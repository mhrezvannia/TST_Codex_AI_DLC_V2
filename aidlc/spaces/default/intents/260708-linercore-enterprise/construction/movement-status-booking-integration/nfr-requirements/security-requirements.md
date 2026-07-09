# Security Requirements - movement-status-booking-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The movement-status event path must preserve producer/consumer service identity and ownership boundaries.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Producer identity | CMM publishes with configured service identity and Kafka ACL hook. |
| Consumer identity | Booking consumes with configured service identity and Kafka ACL hook. |
| Event metadata | Event contains correlation ID, event ID, journey/status identity, ordering metadata, schema version, and deduplication/staleness fields. |
| Boundary | Booking consumes status but does not derive movement status; CMM reports status but does not decide D&D relevance. |
| Database isolation | Booking and CMM do not query each other's databases. |
| Audit | Status publication, consumption, lifecycle update, stale/duplicate handling, and D&D trigger input evidence are auditable. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines status publication/consumption and lifecycle update workflow. |
| `business-rules.md` | Defines security context and boundary validation. |
| `requirements.md` | Supplies FR-BKG-008/009, FR-CMM-007/008, NFR-SEC, and no-cross-database constraints. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, and service stack context. |
| `nfr-requirements-questions.md` | Q2 sets status-event security controls. |
