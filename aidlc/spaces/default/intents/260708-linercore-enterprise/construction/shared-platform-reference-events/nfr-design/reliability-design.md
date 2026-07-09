# Reliability Design - shared-platform-reference-events

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability centers on durable reference lifecycle changes, transactional outbox publication, Schema Registry compatibility, and honest health reporting.

## Transactional Outbox Design

Reference mutations commit reference state, history/audit context, and an outbox entry in one database transaction. No committed reference lifecycle change may be missing corresponding outbox evidence.

Outbox rows include aggregate id, reference set, record key, event type, schema version, deduplication key, correlation ID, producer identity, payload hash, status, attempt count, next retry time, and last error.

## Publish Reliability

| Failure | Behavior |
|---|---|
| Invalid reference command | Reject with auditable validation error. |
| Forbidden mutation | Deny, audit, and do not mutate state. |
| Schema Registry unavailable | Preserve outbox, mark publish blocked, and expose health failure. |
| Kafka unavailable | Retry outbox publish and expose lag/blocker. |
| Consumer validation request invalid | Return typed validation error without leaking internal data. |
| Schema compatibility failure | Block readiness for required reference event schema. |

## Retry And Health

The publisher uses claim/lease semantics so multiple workers can run without double-owning the same row. Retries use bounded backoff and visible lag metrics. Health reports count pending, claimed, failed, blocked, and published rows by event type and age.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements atomic mutation/outbox commit, at-least-once publish, compatibility blocks, retry visibility, and no-lost-change rules. |
| `performance-requirements.md` | Keeps outbox enqueue inside mutation budget and publisher throughput independent. |
| `security-requirements.md` | Preserves event producer identity, correlation, audit, and protected validation APIs. |
| `scalability-requirements.md` | Supports event volume, history volume, and consumer-module growth through claim/lease batches and paginated health. |
| `tech-stack-decisions.md` | Uses PostgreSQL outbox, Kafka, Schema Registry, Avro, Java/Spring, OpenAPI, and Keycloak/JWT. |
| `business-logic-model.md` | Implements reference lifecycle, event publication, outbox health, validation, and exception handling workflows. |
