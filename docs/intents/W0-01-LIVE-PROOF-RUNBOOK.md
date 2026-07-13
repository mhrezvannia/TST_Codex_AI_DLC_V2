# W0-01 Live Eventing Proof

This is the final acceptance procedure for W0-01. It proves that a reference-data
mutation and a booking confirmation leave their service transactions through the
JDBC outbox, register schemas, and arrive on real Kafka topics.

Do not close the intent from container startup alone. All pass criteria at the end
must be observed and retained under `artifacts/w0-01-live/`.

## Prerequisites

- Docker Desktop is running and can pull Docker Hub images.
- Java 21 and Maven are available.
- Ports 5432, 8081, 8083, 8085, 8086, and 9092 are free.
- Run from branch `intent/W0-01-platform-eventing` at repository root.

The pricing mock below is only a prerequisite-state fixture. Reference Data,
Booking, CMM, PostgreSQL, Kafka, Schema Registry, schema registration, the outbox
relays, and the Booking-to-CMM HTTP call are the real implementations.

## 1. Clean, package, and pull

The `down -v` command deletes only this Compose project's local volumes. Do not run
it against a workspace whose local data must be retained.

```powershell
git switch intent/W0-01-platform-eventing
git status --short

docker rm -f w0-booking w0-pricing-mock 2>$null
docker compose --profile app down -v --remove-orphans

mvn -U -f services/pom.xml package -DskipTests
docker compose --profile app pull postgres kafka schema-registry
docker compose --profile app build reference-data-service booking-service container-movement-service
```

Expected: Maven ends with `BUILD SUCCESS`, and all six required images exist:

```powershell
docker image inspect postgres:15 --format '{{.Id}}'
docker image inspect confluentinc/cp-kafka:7.7.1 --format '{{.Id}}'
docker image inspect confluentinc/cp-schema-registry:7.7.1 --format '{{.Id}}'
docker image inspect linercore/reference-data-service:local --format '{{.Id}}'
docker image inspect linercore/booking-service:local --format '{{.Id}}'
docker image inspect linercore/container-movement-service:local --format '{{.Id}}'
```

## 2. Start the real infrastructure and services

```powershell
docker compose --profile app up -d postgres kafka schema-registry
docker compose --profile app up -d --no-deps reference-data-service container-movement-service

docker run -d --rm --name w0-pricing-mock `
  --network linercore-local `
  node:24-alpine node -e 'const http=require("http");const body=JSON.stringify({matched:true,agreementId:"w0-live-agreement",terms:[{id:"term-1",chargeCodeId:"OCEAN_FREIGHT",basis:"PER_CONTAINER",amount:100,currencyId:"USD",validFrom:"2026-01-01",validTo:"2027-12-31",notes:"W0 live proof"}],noMatchReason:null});http.createServer((req,res)=>{res.writeHead(200,{"content-type":"application/json"});res.end(body)}).listen(18084,"0.0.0.0")'

docker compose --profile app run -d --name w0-booking --no-deps --service-ports `
  -e CHARGE_AGREEMENT_SERVICE_URL=http://w0-pricing-mock:18084 `
  booking-service
```

Wait for the infrastructure health checks and application endpoints:

```powershell
$deadline = (Get-Date).AddMinutes(5)
do {
  $infra = docker compose --profile app ps --format json | ConvertFrom-Json
  $ready = $true
  foreach ($url in @(
    'http://localhost:8081/subjects',
    'http://localhost:8083/actuator/health',
    'http://localhost:8085/actuator/health',
    'http://localhost:8086/actuator/health'
  )) {
    try { Invoke-RestMethod -Uri $url -TimeoutSec 3 | Out-Null }
    catch { $ready = $false }
  }
  if (-not $ready) { Start-Sleep -Seconds 5 }
} while (-not $ready -and (Get-Date) -lt $deadline)

if (-not $ready) {
  docker compose --profile app ps
  docker compose --profile app logs --no-color --tail 200
  docker logs w0-booking
  throw 'W0 services did not become ready'
}
```

## 3. Create booking prerequisites and one proof reference change

```powershell
function New-W0Reference {
  param(
    [string]$Set,
    [string]$Code,
    [string]$DisplayName,
    [string]$CorrelationId
  )

  $body = @{
    code = $Code
    displayName = $DisplayName
    attributes = @{}
    actorSubjectId = 'reference-admin'
    actorDisplayName = 'Reference Admin'
    operation = 'create'
    reason = 'W0 live eventing proof'
    correlationId = $CorrelationId
  } | ConvertTo-Json -Depth 5

  Invoke-RestMethod `
    -Method Post `
    -Uri "http://localhost:8083/reference-sets/$Set/records" `
    -Headers @{ 'X-Correlation-Id' = $CorrelationId } `
    -ContentType 'application/json' `
    -Body $body
}

function Get-W0ReferenceId($record) {
  if ($record.id -is [string]) { return $record.id }
  return $record.id.value
}

$customer = New-W0Reference PARTY_CUSTOMER W0-CUSTOMER 'W0 Customer' corr-w0-setup-customer
$origin = New-W0Reference LOCATION W0-ORIGIN 'W0 Origin' corr-w0-setup-origin
$destination = New-W0Reference LOCATION W0-DESTINATION 'W0 Destination' corr-w0-setup-destination
$equipment = New-W0Reference EQUIPMENT_TYPE W0-40HC 'W0 40HC' corr-w0-setup-equipment

# This is the designated reference-data proof event.
$currency = New-W0Reference CURRENCY W0-USD 'W0 US Dollar' corr-w0-reference-live
```

Expected: all responses have `status: ACTIVE`. The designated currency mutation
must later appear with correlation ID `corr-w0-reference-live` on
`referencedata.events`.

## 4. Create, validate, price, and confirm one booking

```powershell
$bookingBody = @{
  idempotencyKey = 'w0-live-booking-create'
  customerId = Get-W0ReferenceId $customer
  originLocationId = Get-W0ReferenceId $origin
  destinationLocationId = Get-W0ReferenceId $destination
  equipmentType = Get-W0ReferenceId $equipment
  attributes = @{ proof = 'W0-01' }
  actorSubjectId = 'booking-operator'
  correlationId = 'corr-w0-booking-live'
} | ConvertTo-Json -Depth 5

$booking = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:8085/api/bookings' `
  -Headers @{ 'X-Correlation-Id' = 'corr-w0-booking-live' } `
  -ContentType 'application/json' `
  -Body $bookingBody

$actorBody = @{
  actorSubjectId = 'booking-operator'
  correlationId = 'corr-w0-booking-live'
} | ConvertTo-Json

$validated = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8085/api/bookings/$($booking.id)/validate" `
  -ContentType 'application/json' `
  -Body $actorBody

$pricingBody = @{
  idempotencyKey = 'w0-live-booking-price'
  actorSubjectId = 'booking-operator'
  correlationId = 'corr-w0-booking-live'
} | ConvertTo-Json

$priced = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8085/api/bookings/$($booking.id)/price" `
  -ContentType 'application/json' `
  -Body $pricingBody

if ($validated.status -ne 'VALIDATED') { throw "Unexpected validation status: $($validated.status)" }
if ($priced.status -ne 'PRICED') { throw "Unexpected pricing status: $($priced.status)" }

$confirmed = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8085/api/bookings/$($booking.id)/confirm" `
  -Headers @{ 'X-Correlation-Id' = 'corr-w0-booking-live' } `
  -ContentType 'application/json' `
  -Body $actorBody

if ($confirmed.status -ne 'CONFIRMED') { throw "Unexpected confirmation status: $($confirmed.status)" }

Start-Sleep -Seconds 15
```

## 5. Capture broker, schema, outbox, and CMM evidence

```powershell
New-Item -ItemType Directory -Force artifacts/w0-01-live | Out-Null

docker compose --profile app ps | Tee-Object artifacts/w0-01-live/compose-ps.txt

Invoke-RestMethod http://localhost:8081/subjects |
  ConvertTo-Json -Depth 5 |
  Set-Content artifacts/w0-01-live/schema-subjects.json

docker compose exec -T schema-registry kafka-avro-console-consumer `
  --bootstrap-server kafka:9092 `
  --topic referencedata.events `
  --from-beginning `
  --timeout-ms 15000 `
  --property schema.registry.url=http://schema-registry:8081 `
  2>$null | Tee-Object artifacts/w0-01-live/reference-events.jsonl

docker compose exec -T schema-registry kafka-avro-console-consumer `
  --bootstrap-server kafka:9092 `
  --topic booking.events `
  --from-beginning `
  --timeout-ms 15000 `
  --property schema.registry.url=http://schema-registry:8081 `
  2>$null | Tee-Object artifacts/w0-01-live/booking-events.jsonl

docker compose exec -T postgres bash -lc `
  "PGPASSWORD=reference_data_local psql -h localhost -U linercore_reference_data -d linercore_reference_data -c \"select event_id,event_type,status,attempt_count,correlation_id from reference_outbox order by occurred_at;\"" |
  Tee-Object artifacts/w0-01-live/reference-outbox.txt

docker compose exec -T postgres bash -lc `
  "PGPASSWORD=booking_local psql -h localhost -U linercore_booking -d linercore_booking -c \"select event_id,event_type,status,attempt_count,correlation_id from booking_outbox order by occurred_at;\"" |
  Tee-Object artifacts/w0-01-live/booking-outbox.txt

docker compose exec -T postgres bash -lc `
  "PGPASSWORD=container_movement_local psql -h localhost -U linercore_container_movement -d linercore_container_movement -c \"select journey_id,booking_id,booking_revision,movement_status from container_journeys where booking_id='$($booking.id)';\"" |
  Tee-Object artifacts/w0-01-live/cmm-booking-journey.txt

docker compose --profile app logs --no-color reference-data-service container-movement-service |
  Set-Content artifacts/w0-01-live/service-logs.txt
docker logs w0-booking | Set-Content artifacts/w0-01-live/booking-logs.txt
```

Run the decisive assertions:

```powershell
if (-not (Select-String artifacts/w0-01-live/reference-events.jsonl -Pattern 'corr-w0-reference-live' -Quiet)) {
  throw 'Reference event was not observed on referencedata.events'
}
if (-not (Select-String artifacts/w0-01-live/booking-events.jsonl -Pattern 'corr-w0-booking-live' -Quiet)) {
  throw 'Booking event was not observed on booking.events'
}
if (-not (Select-String artifacts/w0-01-live/reference-outbox.txt -Pattern 'PUBLISHED' -Quiet)) {
  throw 'Reference outbox did not reach PUBLISHED'
}
if (-not (Select-String artifacts/w0-01-live/booking-outbox.txt -Pattern 'PUBLISHED' -Quiet)) {
  throw 'Booking outbox did not reach PUBLISHED'
}
if (-not (Select-String artifacts/w0-01-live/cmm-booking-journey.txt -Pattern $booking.id -Quiet)) {
  throw 'Booking-to-CMM delivery was not observed'
}
```

## Pass criteria

W0-01 closes only when all of these are true:

1. PostgreSQL, Kafka, Schema Registry, Reference Data, Booking, and CMM are running.
2. `schema-subjects.json` contains the reference-data and booking subjects.
3. `reference-events.jsonl` contains `corr-w0-reference-live`.
4. `booking-events.jsonl` contains `corr-w0-booking-live` and the confirmed booking ID.
5. Both outbox evidence files show `PUBLISHED`, with no permanent failure.
6. `cmm-booking-journey.txt` contains the confirmed booking ID.
7. The five assertion blocks complete without throwing.

## Cleanup

```powershell
docker rm -f w0-booking w0-pricing-mock 2>$null
docker compose --profile app down -v --remove-orphans
```

Do not retain a green claim if the consumer output, outbox status, or CMM row was
not observed. A successful `docker compose up` by itself is not acceptance evidence.
