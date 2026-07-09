# Scalability Design - booking-lifecycle-domain

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Booking must support realistic first-release workflow volume while preserving revision history, exception queues, idempotency, outbox, and audit.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Bookings | At least 10,000 records. |
| Booking revisions | At least 25,000 revisions. |
| Exception records | At least 5,000 pricing, capacity, movement, D&D, and contract exceptions. |
| Lifecycle events | At least 1,000 confirmation/revision event records. |
| Concurrent users | At least 50 local simulated users across booking workflows. |

## Data Partitioning

| Data area | Partition/filter strategy |
|---|---|
| Booking search | Status, customer, route, date window, owner, and exception state with pagination. |
| Revision history | Booking id and revision number; current revision loaded separately from full history. |
| Exception queue | Owner, status, reason, severity, linked booking, and age. |
| Outbox | Aggregate id, event type, sequence, claim status, and age. |
| Idempotency | Command scope, subject/service, idempotency key, and request hash. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Search p95 exceeds 500 ms | Add targeted indexes, stricter pagination, and read projection for common filters. |
| Revision history grows | Load current revision by default and page history on demand. |
| Exception count grows | Partition queue views by owner/status/reason and add aging metrics. |
| Outbox lag grows | Tune publisher batch/lease and surface lag health. |
| Concurrent users exceed baseline | Verify command transaction contention and idempotency index selectivity. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements booking, revision, exception, lifecycle event, and concurrent user baselines. |
| `performance-requirements.md` | Uses pagination, indexing, and focused projections to preserve command/query budgets. |
| `security-requirements.md` | Scales authorization, audit, service identity, and boundary enforcement across records and users. |
| `reliability-requirements.md` | Keeps idempotency, outbox, deduplication, exception queues, and stale revision checks separately queryable. |
| `tech-stack-decisions.md` | Uses Booking Service, PostgreSQL, Java/Spring, Kafka/Avro/AsyncAPI/Schema Registry, OpenAPI, and Pact/message-pact. |
| `business-logic-model.md` | Implements lifecycle, revisioning, exceptions, audit, pricing orchestration, and D&D trigger workflows. |
