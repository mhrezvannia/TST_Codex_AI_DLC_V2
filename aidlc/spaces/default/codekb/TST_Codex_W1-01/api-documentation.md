# API Documentation - LinerCore W1-01 Baseline

## Booking HTTP API

Base path: `/api/bookings` on port 8085.

| Method and path | Current responsibility |
|---|---|
| `POST /api/bookings` | Create booking using idempotency-aware request |
| `POST /api/bookings/drafts` | Create explicit draft |
| `GET /api/bookings/{id}` | Booking detail |
| `GET /api/bookings` | Recent bookings with limit |
| `POST /api/bookings/{id}/validate` | Validate references and lifecycle |
| `POST /api/bookings/{id}/price` | Call Booking pricing port and update pricing state |
| `POST /api/bookings/{id}/pricing-snapshot` | Store externally supplied snapshot |
| `POST /api/bookings/{id}/confirm` | Confirm, write outbox, then synchronously POST to CMM |
| `POST /api/bookings/{id}/amend` | Amend attributes and increment revision |
| `POST /api/bookings/{id}/reconfirm` | Reconfirm, write outbox, then synchronously POST to CMM |
| `POST /api/bookings/movement-status` | Consume CMM status over HTTP |

The present Booking DTO uses `originLocationId`, `destinationLocationId`, and `equipmentType`; W1 requires canonical contract fields and routing/equipment collections to match the frozen Avro definitions exactly.

## Charge Agreement and Pricing API

Base agreement path: `/api/charge-agreements` on port 8084.

| Method and path | Current responsibility |
|---|---|
| `GET /api/charge-agreements` | Filtered/paged agreement search |
| `POST /api/charge-agreements` | Create agreement |
| `GET /api/charge-agreements/{id}` | Agreement detail |
| `PUT /api/charge-agreements/{id}?version=` | Optimistic update |
| `POST /api/charge-agreements/{id}/approve?version=` | Approve lifecycle transition |
| `POST /api/charge-agreements/{id}/suspend?version=` | Suspend lifecycle transition |
| `POST /api/charge-agreements/{id}/expire?version=` | Expire lifecycle transition |
| `GET /api/charge-agreements/active-lookup` | Match an active agreement and return terms |
| `GET /api/charge-agreements/module-info` | Module metadata |

The published OpenAPI additionally declares `POST /api/pricing/quote` and `POST /api/pricing/dnd`; no controller currently implements them. `ChargeAgreementApplicationService.price` exists. Booking's `HttpChargePricingClient` calls `active-lookup` and converts returned terms into line items locally, so the live seam does not yet implement the declared pricing contract.

## Container Movement HTTP API

Base path: `/api/container-movement` on port 8086.

| Method and path | Current responsibility |
|---|---|
| `GET /journeys` | Recent journeys |
| `POST /journeys` | Create journey directly |
| `GET /journeys/{id}` | Journey detail |
| `GET /bookings/{bookingId}/journey` | Journey by Booking identity |
| `POST /booking-confirmed` | Consume Booking confirmation over HTTP |
| `POST /journeys/{id}/movements` | Validate and capture movement, then POST status to Booking |

The direct booking-confirmed and movement-status endpoints are transitional paths. W1 should add Kafka consumers and remove these calls from the normal interaction without deleting unrelated diagnostic/API behavior unless requirements direct it.

## Shared Platform APIs

Reference Data uses `/reference-sets` for set discovery, record list/detail/create/update/validate/history, and operational outbox event claim/publish routes. Identity uses `/internal/identity` for authorization, role assignment, effective permissions, and role listing.

All service containers expose Spring Boot actuator dependencies; exact health exposure is controlled by each application YAML. Correlation is generally carried by `X-Correlation-Id`, with local fallback values in controllers.

## Event Contracts

| Topic | Event | Producer | Intended consumer | Current state |
|---|---|---|---|---|
| `booking.events` | `booking.confirmed` | Booking | CMM | Real outbox publisher; no Kafka consumer |
| `containermovement.events` | `containermovement.status` | CMM | Booking | Real outbox publisher; no Kafka consumer |
| `charge-agreement.events` | Charge lifecycle events | Charge | Enterprise services | Real outbox publisher |
| Reference-data topics | `referencedata.*.changed` | Reference Data | Enterprise services | Real outbox publisher |

The service-local `booking.confirmed.avsc` is flat (`originLocationId`, `destinationLocationId`, `containerId`, `equipmentTypeId`). The service-local movement schema is flat (`movementStatus`, `sequenceNumber`, optional reason/location). W1's binding contract requires exact canonical names, routing/equipment arrays, and DCSA movement codes; producer payloads, consumers, examples, AsyncAPI, and service resources must change together.

## Contract Governance

`contracts/catalog/contract-catalog.json` marks the relevant OpenAPI, AsyncAPI, Avro, and fixture entries as `candidate_executable` with backward compatibility. Root scripts validate the catalog and verify providers, including a live evidence mode. These checks complement but do not replace the W1 live Kafka/Schema Registry proof.
