# Architecture - LinerCore W1-01 Baseline

## System Topology

The repository is a modular monorepo. Java 21/Spring Boot services use domain, application-service, data-access, messaging, and container modules. Next.js apps and shared TypeScript packages are managed by Yarn workspaces and Turbo. PostgreSQL stores each service's data in a separate database. Kafka and Schema Registry provide the event backbone; nginx exposes the local web surface.

```mermaid
flowchart LR
    UI[Booking Next.js app] -->|HTTP via BFF routes| BKG[Booking service]
    BKG -->|validate HTTP| REF[Reference-data service]
    BKG -->|active lookup HTTP| CHG[Charge agreement service]
    BKG -->|outbox relay| K[(Kafka and Schema Registry)]
    K -. missing consumer .-> CMM[Container movement service]
    CMM -->|outbox relay| K
    K -. missing consumer .-> BKG
    BKG --> BP[(Booking PostgreSQL)]
    CHG --> CP[(Charge PostgreSQL)]
    CMM --> MP[(CMM PostgreSQL)]
    REF --> RP[(Reference PostgreSQL)]
```

Text fallback: the Booking web app calls Booking; Booking calls Reference Data and Charge synchronously; Booking and CMM each persist an outbox and publish to Kafka; the corresponding Kafka consumers are absent; every service owns PostgreSQL state.

## Backend Module Pattern

Booking, CMM, and Charge use ports-and-adapters boundaries. Domain records enforce lifecycle rules, application services coordinate authorization/idempotency/persistence, JDBC adapters implement repository ports, messaging adapters map outbox payloads to Avro `GenericRecord`, and Spring container modules wire HTTP and runtime concerns. Charge, Identity, and Reference Data additionally retain `application` and `published-language` modules; Booking and CMM use the leaner five-module form.

The shared `platform-messaging` module owns `KafkaGenericRecordPublisher`, `ConfluentSchemaRegistrar`, `AvroSchemaRepository`, `ScheduledOutboxRelay`, retry classification, broker metadata, and `NoopMessagingGuard`. Service modules correctly adopt this shared infrastructure for publishing.

## Interaction Diagrams

Current confirmation behavior duplicates the async intent with a synchronous delivery path:

```mermaid
sequenceDiagram
    participant UI as Booking UI or API caller
    participant BC as Booking controller
    participant BS as Booking application service
    participant DB as Booking PostgreSQL
    participant HC as HTTP CMM client
    participant CMM as CMM controller and service
    UI->>BC: POST /api/bookings/{id}/confirm
    BC->>BS: confirm(id, actor, correlation)
    BS->>DB: save confirmed booking and outbox in transaction
    BS-->>BC: confirmed booking
    BC->>HC: publishBookingConfirmed
    HC->>CMM: POST /api/container-movement/booking-confirmed
    CMM->>CMM: consumeBookingConfirmed and open journey
    CMM-->>BC: HTTP result
    BC-->>UI: confirmed booking
```

Text fallback: confirmation commits Booking plus an outbox row atomically, then the controller makes a blocking HTTP call to CMM. The outbox publishes too, but no CMM Kafka consumer handles it.

The target W1 interaction removes the Booking-to-CMM and CMM-to-Booking HTTP handoffs:

```mermaid
sequenceDiagram
    participant UI as Booking UI
    participant B as Booking service
    participant K as Kafka
    participant C as CMM service
    UI->>B: create, validate, price, confirm
    B->>B: commit booking and booking.confirmed outbox
    B->>K: publish booking.confirmed
    K->>C: consume and deduplicate envelope
    C->>C: commit journey and status outbox
    C->>K: publish containermovement.status
    K->>B: consume and deduplicate envelope
    B->>B: commit movement projection
    UI->>B: GET booking detail
    B-->>UI: booking with journey status
```

Text fallback: the two services communicate through Kafka, each consumer performs deduplication and state mutation transactionally, and the UI reads the resulting Booking projection.

## Persistence and Delivery

Booking uses `booking_records`, `booking_idempotency`, `booking_audit`, and `booking_outbox`. CMM uses journey, idempotency, audit, and outbox tables. Charge uses normalized agreement/term/activity tables, manual pricing cases, and an outbox. Outbox rows track status, attempts, claim ownership, retry time, broker coordinates, and errors.

Schemas are mutable startup SQL files with `CREATE TABLE IF NOT EXISTS` and incremental `ALTER TABLE` statements, not a versioned Flyway/Liquibase chain. This is adequate for the current local baseline but makes upgrade ordering and rollback evidence weak.

## Runtime Profiles

Compose profiles are `core`, `app`, `devtools`, `observability`, and `full`. The default PostgreSQL host mapping is `${POSTGRES_HOST_PORT:-55432}:5432`, avoiding host port 5432. Service-internal connections remain on `postgres:5432`. Kafka runs at container address `kafka:9092`; Schema Registry at `schema-registry:8081`; nginx listens on host port 8088.
