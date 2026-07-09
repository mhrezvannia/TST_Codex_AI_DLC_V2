# Tech Stack Decisions - booking-lifecycle-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Booking is a greenfield service but should follow the existing LinerCore backend/runtime patterns.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Service | New `booking-service` | Booking owns lifecycle state and must not be folded into Charge or CMM. |
| Backend runtime | Java 21, Spring Boot 3.3.7, Maven | Matches existing backend stack. |
| Persistence | PostgreSQL logical `booking` database/user | Supports durable booking, revisions, exceptions, idempotency, outbox, and audit. |
| HTTP contracts | OpenAPI | Required for booking command/query and exception APIs. |
| Events | Kafka, Avro, AsyncAPI, Schema Registry | Required for booking confirmation and revision event paths. |
| Contract testing | Pact/message-pact | Required for Charge and CMM seams. |
| Security | Keycloak/JWT and capability checks | Aligns with Shared Platform identity. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Calculating prices or D&D | Owned by Charge. |
| Calculating movement status | Owned by CMM. |
| External schedule/capacity provider | First release uses local deterministic adapter seam and audited override. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines booking lifecycle, pricing orchestration, event, and exception workflows. |
| `business-rules.md` | Defines ownership and integration rules. |
| `requirements.md` | Supplies FR-BKG, FR-E2E, and NFR requirements. |
| `technology-stack.md` | Supplies Java/Spring, Maven, PostgreSQL, Kafka, Schema Registry, OpenAPI, and Pact context. |
| `nfr-requirements-questions.md` | Q5 selects the greenfield booking service stack. |
