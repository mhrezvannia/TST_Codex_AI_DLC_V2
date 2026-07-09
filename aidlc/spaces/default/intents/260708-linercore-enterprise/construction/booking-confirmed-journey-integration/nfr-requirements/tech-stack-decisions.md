# Tech Stack Decisions - booking-confirmed-journey-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The event integration uses Kafka contracts and service-owned persistence, not shared databases or UI-driven synchronization.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Producer | Booking Service | Booking owns confirmation facts. |
| Consumer | Container Movement Service | CMM owns journey creation and reconciliation. |
| Broker | Kafka | Existing local event broker. |
| Schema | Avro, AsyncAPI, Schema Registry | Required for compatible `booking.confirmed` events. |
| Contract testing | Message-pact fixtures | Required for producer/consumer evidence. |
| Persistence | PostgreSQL outbox and CMM deduplication tables | Supports durability and replay safety. |
| Runtime | Docker Compose with Kafka/Schema Registry | Supports local-first evidence. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Shared database trigger | Violates service boundaries. |
| Synchronous Booking -> CMM journey API as primary path | Conflicts with approved event choreography. |
| Mock-only event broker | Fails contract/runtime evidence requirements. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines event publish/consume and journey reconciliation workflow. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies Booking confirmation and CMM journey requirements. |
| `technology-stack.md` | Supplies Kafka, Avro, Schema Registry, PostgreSQL, Spring, and message fixtures. |
| `nfr-requirements-questions.md` | Q5 selects event integration stack posture. |
