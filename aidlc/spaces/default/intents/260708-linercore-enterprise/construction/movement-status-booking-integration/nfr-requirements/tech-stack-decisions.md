# Tech Stack Decisions - movement-status-booking-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The event integration uses Kafka contracts and service-owned persistence, not shared databases or UI polling as lifecycle authority.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Producer | Container Movement Service | CMM owns movement status derivation. |
| Consumer | Booking Service | Booking owns lifecycle update and D&D trigger input evidence. |
| Broker | Kafka | Existing local event broker. |
| Schema | Avro, AsyncAPI, Schema Registry | Required for compatible `containermovement.status` events. |
| Contract testing | Message-pact fixtures | Required for producer/consumer evidence. |
| Persistence | PostgreSQL deduplication/lifecycle update state | Supports idempotent Booking updates. |
| Runtime | Docker Compose with Kafka/Schema Registry | Supports local-first evidence. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Shared database update | Violates service boundaries. |
| Booking-derived movement status | Violates CMM ownership. |
| CMM D&D relevance decision | Violates Booking ownership. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines status publish/consume and lifecycle update workflow. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies status publication and Booking lifecycle update requirements. |
| `technology-stack.md` | Supplies Kafka, Avro, Schema Registry, PostgreSQL, Spring, and message fixtures. |
| `nfr-requirements-questions.md` | Q5 selects status-event integration stack posture. |
