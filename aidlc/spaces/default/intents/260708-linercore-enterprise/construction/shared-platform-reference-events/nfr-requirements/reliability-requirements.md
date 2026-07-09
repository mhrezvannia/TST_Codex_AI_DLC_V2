# Reliability Requirements - shared-platform-reference-events

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability centers on durable reference lifecycle changes, transactional outbox publication, Schema Registry compatibility, and honest health reporting.

## Reliability Targets

| Area | Requirement |
|---|---|
| Reference mutations | Commit reference state and outbox entry atomically. |
| Event publishing | At-least-once publish from transactional outbox with deduplication keys. |
| Schema compatibility | Block readiness when required reference event schema compatibility fails. |
| Retry | Publisher failures are retryable and visible in outbox health. |
| No lost changes | No committed reference lifecycle change may be missing corresponding outbox evidence. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Invalid reference command | Reject with auditable validation error. |
| Forbidden mutation | Deny, audit, and do not mutate state. |
| Schema Registry unavailable | Preserve outbox, mark publish blocked, and expose health failure. |
| Kafka unavailable | Retry outbox publish and expose lag/blocker. |
| Consumer validation request invalid | Return typed validation error without leaking internal data. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines reference lifecycle, event publication, and outbox health. |
| `business-rules.md` | Defines validation, evidence, and boundary rules. |
| `requirements.md` | Supplies FR-SP-005, NFR-REL-002, NFR-COMP-001, and NFR-OBS-001. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, PostgreSQL, and Spring context. |
| `nfr-requirements-questions.md` | Q2 sets transactional outbox reliability. |
