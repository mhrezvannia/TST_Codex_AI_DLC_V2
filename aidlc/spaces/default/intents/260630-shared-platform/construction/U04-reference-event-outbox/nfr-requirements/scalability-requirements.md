# Scalability Requirements - U04 Reference Event Outbox

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines bounded batch claiming, multiple publisher instance protection, retry scheduling, schema subjects, and status projections. `business-rules.md` requires concurrency-protected claims, bounded/observable retries, deterministic publish keys, and typed event contracts. `requirements.md` fixes Kafka, Schema Registry, Avro, at-least-once delivery, and local/on-prem reproducibility.

## Scaling Model

U04 scales through bounded outbox batches and concurrency-safe publisher workers. More workers may process different rows, but the same row must not publish concurrently.

## Structural Scalability Requirements

| Area | Requirement |
|---|---|
| Outbox table | Indexed by status, nextAttemptAt, claimed state, reference set, record id, event id, and time. |
| Publisher workers | Multiple workers require row-level claim protection. |
| Batch size | Configurable and bounded. |
| Retry schedule | Backoff and nextAttemptAt prevent hot retry loops. |
| Status API | Filtered and paginated by event id, record id, reference set, status, and time range. |
| Schema subjects | One typed event family per reference set. |

## Growth Assumptions

- MVP publishes nine typed reference-change event families.
- Future downstream consumers may increase topic usage but must deduplicate by event id.
- Payloads are reference-change facts, not full downstream projections.
- Final event volume remains tied to open MVP load profile.

## Scaling Risks

| Risk | Mitigation |
|---|---|
| Outbox backlog grows | Monitor depth, oldest age, retry counts, and freshness p95. |
| Poison event loops | Permanent schema/serialization failures stop retry loops and mark failed. |
| Publisher contention | Use SKIP LOCKED or equivalent claim guard. |
| Status query load | Require filters/pagination and safe projections. |
| Schema family sprawl | Keep nine typed events and compatibility checks under U07/U08 governance. |

## Non-Goals

- No downstream consumer scaling model.
- No final Kafka partition count or broker sizing; infrastructure/performance stages finalize.
- No service stubs for future modules.

