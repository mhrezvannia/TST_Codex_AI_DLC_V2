# Security Design - movement-status-booking-integration

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The movement-status event path must preserve producer/consumer service identity and ownership boundaries.

## Event Security

| Control | Design |
|---|---|
| Producer identity | CMM publishes with configured service identity and Kafka ACL hook. |
| Consumer identity | Booking consumes with configured service identity and Kafka ACL hook. |
| Event metadata | Event contains correlation ID, event ID, journey/status identity, ordering metadata, schema version, and deduplication/staleness fields. |
| Boundary | Booking consumes status but does not derive movement status; CMM reports status but does not decide D&D relevance. |
| Database isolation | Booking and CMM do not query each other's databases. |
| Audit | Status publication, consumption, lifecycle update, stale/duplicate handling, and D&D trigger input evidence are auditable. |

## Boundary Enforcement

Booking treats CMM status as input evidence for Booking-owned lifecycle and D&D relevance decisions. CMM does not mutate Booking lifecycle. The integration does not use UI polling or shared database state as lifecycle authority.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements producer identity, consumer identity, event metadata, boundary rules, database isolation, and audit. |
| `performance-requirements.md` | Keeps security metadata in the event path without violating latency budgets. |
| `scalability-requirements.md` | Scales protected metadata and audit across event, duplicate, stale, update, and fixture volumes. |
| `reliability-requirements.md` | Ensures duplicates, stale events, conflicts, incompatible schemas, and broker failures remain auditable. |
| `tech-stack-decisions.md` | Uses Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, and service-owned persistence. |
| `business-logic-model.md` | Implements status publication/consumption and lifecycle update workflow. |
