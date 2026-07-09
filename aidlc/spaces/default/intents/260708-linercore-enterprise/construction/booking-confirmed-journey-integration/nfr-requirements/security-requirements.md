# Security Requirements - booking-confirmed-journey-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The confirmed-booking event path must preserve service identity, authorization context, schema governance, and no direct database coupling.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Producer identity | Booking publishes with configured service identity and Kafka ACL hook. |
| Consumer identity | CMM consumes with configured service identity and Kafka ACL hook. |
| Event metadata | Event contains correlation ID, event ID, booking revision, schema version, producer, and idempotency/deduplication fields. |
| Schema auth metadata | AsyncAPI/Avro metadata describes protected producer/consumer context. |
| Boundary | CMM creates/reconciles journey; Booking does not write CMM database. |
| Audit | Confirmation, publish, consume, deduplication, and reconciliation evidence are auditable. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines event publish/consume and journey reconciliation workflow. |
| `business-rules.md` | Defines security context, idempotency, and boundary validation. |
| `requirements.md` | Supplies FR-BKG-006, FR-CMM-001, NFR-SEC, and no-cross-database constraints. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, and service stack context. |
| `nfr-requirements-questions.md` | Q2 sets event security controls. |
