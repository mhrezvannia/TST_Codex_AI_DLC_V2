# Tech Stack Decisions - shared-platform-reference-events

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The approved posture is brownfield hardening of the existing Reference Data Service.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Service | Existing `reference-data-service` | Preserves MVP foundation and ownership. |
| Backend runtime | Java 21, Spring Boot 3.3.7, Maven | Matches existing backend stack. |
| Persistence | PostgreSQL logical `reference_data` database/user | Supports lifecycle, history, and outbox. |
| HTTP contracts | OpenAPI YAML | Existing contract pattern for reference APIs. |
| Event payloads | Avro `.avsc` | Required for reference-data changed events. |
| Broker | Kafka | Existing local event broker. |
| Compatibility | Schema Registry | Required for backward-compatible event schema evidence. |
| Auth | Keycloak/JWT integration | Aligns with Shared Platform security. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Replacing Reference Data Service | Not required; hardening existing ownership is lower risk. |
| Cross-service database access | Forbidden by architecture and requirements. |
| External master-data integration | Deferred until internal flows pass locally. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines reference lifecycle, validation, event publication, and outbox health. |
| `business-rules.md` | Defines ownership and contract rules. |
| `requirements.md` | Supplies FR-SP-004, FR-SP-005, FR-RUN, and NFR-COMP requirements. |
| `technology-stack.md` | Supplies Java/Spring, PostgreSQL, Kafka, Schema Registry, Avro, and OpenAPI context. |
| `nfr-requirements-questions.md` | Q5 selects brownfield hardening stack. |
