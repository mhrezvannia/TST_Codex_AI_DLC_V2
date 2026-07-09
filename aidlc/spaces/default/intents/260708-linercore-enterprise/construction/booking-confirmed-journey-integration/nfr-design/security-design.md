# Security Design - booking-confirmed-journey-integration

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The confirmed-booking event path must preserve service identity, authorization context, schema governance, and no direct database coupling.

## Event Security

| Control | Design |
|---|---|
| Producer identity | Booking publishes with configured service identity and Kafka ACL hook. |
| Consumer identity | CMM consumes with configured service identity and Kafka ACL hook. |
| Event metadata | Event contains correlation ID, event ID, booking revision, schema version, producer, and idempotency/deduplication fields. |
| Schema auth metadata | AsyncAPI/Avro metadata describes protected producer and consumer context. |
| Boundary | CMM creates/reconciles journey; Booking does not write CMM database. |
| Audit | Confirmation, publish, consume, deduplication, and reconciliation evidence are auditable. |

## Boundary Enforcement

This integration does not derive movement status, decide D&D relevance, calculate pricing/D&D, or use shared database triggers. CMM creates or reconciles journeys from the event contract only.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements producer identity, consumer identity, event metadata, schema auth metadata, boundary, and audit controls. |
| `performance-requirements.md` | Keeps security metadata in the event path without exceeding latency budgets. |
| `scalability-requirements.md` | Scales protected metadata and audit across events, revisions, replay cases, and journeys. |
| `reliability-requirements.md` | Ensures duplicate, stale, incompatible, and processing-failure events remain auditable. |
| `tech-stack-decisions.md` | Uses Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL outbox, and service identities. |
| `business-logic-model.md` | Implements event publish/consume and journey reconciliation workflow. |
