# Tech Stack Decisions - container-movement-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

CMM is a greenfield service and should follow the existing backend, contract, and runtime patterns.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Service | New `container-movement-service` | CMM owns journey, movement, status, and history state. |
| Backend runtime | Java 21, Spring Boot 3.3.7, Maven | Matches service stack. |
| Persistence | PostgreSQL logical `container_movement` database/user | Supports journeys, movement facts, status snapshots, deduplication, and history. |
| HTTP contracts | OpenAPI | Required for journey, movement, status, and history APIs. |
| Events | Kafka, Avro, AsyncAPI, Schema Registry | Required for Booking -> CMM and CMM -> Booking seams. |
| Contract testing | Message-pact | Required for event integration evidence. |
| Security | Keycloak/JWT and capability checks | Aligns with Shared Platform identity. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Booking-owned movement status | Violates CMM ownership. |
| Charge-owned movement facts | Violates CMM ownership. |
| Production external movement-feed adapter | Deferred until local internal flows pass. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines journey, movement, status, and publication workflows. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies FR-CMM and event requirements. |
| `technology-stack.md` | Supplies Java/Spring, Maven, PostgreSQL, Kafka, Schema Registry, OpenAPI, and message fixtures. |
| `nfr-requirements-questions.md` | Q5 selects CMM service stack. |
