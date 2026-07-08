# Reliability Requirements - U04 Reference Event Outbox

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines transactional enqueue, claim recovery, status transitions, retry/dead-letter representation, publish metadata, and recovery-required state. `business-rules.md` requires outbox rows for committed changes, stable event ids, at-least-once semantics, retryable/permanent handling, and operator-visible status. `requirements.md` fixes NFR-002, NFR-011, NFR-016, and FR-024 through FR-027.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Atomicity | A committed reference mutation creates an outbox row in the same transaction. |
| Delivery | Publication supports at-least-once semantics. |
| Deduplication | Event id is stable across retries and sufficient for consumer deduplication. |
| Recovery | Claimed rows are recoverable if publisher crashes before final status update. |
| Failure classification | Retryable, permanent, and recovery-required failures are distinct. |
| Operator visibility | Status APIs and telemetry expose delayed, failed, retrying, and stale items. |

## Failure Behavior

| Failure | Required behavior |
|---|---|
| Broker unavailable | Mark retryable, schedule backoff, preserve event id. |
| Timeout/unknown result | Retry with same event id; reconcile where possible. |
| Serialization/schema error | Mark permanent failure; do not loop indefinitely. |
| Publish succeeds but status update fails | Mark or reconcile recovery-required by event id/broker metadata. |
| Publisher crash after claim | Stale in-progress row becomes eligible for recovery after timeout. |

## Freshness and Consistency

- Event freshness p95 target is <= 60 seconds from successful commit to consumer-observable Kafka event.
- API responses and events must be consistent for committed reference changes; stale or failed publication must be observable.
- Status must distinguish PENDING, IN_PROGRESS, RETRYABLE, PUBLISHED, FAILED_PERMANENT, and RECOVERY_REQUIRED or approved equivalents.

## Health and Smoke Requirements

- Local smoke must prove one outbox row, one Kafka/SR publication, published status, and correlation propagation.
- Readiness must reflect Kafka and Schema Registry dependency availability where publication is required.
- CI must later gate Avro compatibility and message-contract tests.

## Non-Goals

- No exactly-once delivery guarantee.
- No downstream consumer recovery logic.
- No physical DLQ topic mandate in MVP.

