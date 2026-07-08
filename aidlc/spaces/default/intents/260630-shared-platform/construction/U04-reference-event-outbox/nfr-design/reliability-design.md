# Reliability Design - U04 Reference Event Outbox

## Reliability Goals

U04 provides durable, observable at-least-once publication for committed reference changes. Every successful U03 mutation must create an outbox row in the same transaction. Publication retries keep the same event id so consumers can deduplicate.

## State Model

Outbox statuses include PENDING, IN_PROGRESS, RETRYABLE, PUBLISHED, FAILED_PERMANENT, and RECOVERY_REQUIRED or approved equivalents. Rows record event id, entity id, reference set, operation, payload snapshot, schema version, correlation id, attempt count, `nextAttemptAt`, `claimedBy`, `claimedAt`, last error code/message, and safe broker metadata after publish.

## Failure Handling

Broker unavailable and timeout/unknown-result cases move to RETRYABLE with backoff and stable event id. Serialization/schema errors move to FAILED_PERMANENT and require operator or contract/schema action. Publish success followed by status update failure moves to RECOVERY_REQUIRED or is reconciled by event id and broker metadata where possible.

Publisher crash after claim leaves an IN_PROGRESS row that becomes eligible for recovery after timeout. Shutdown does not delete or lose in-flight rows.

## Consistency and Freshness

API responses and events must remain consistent with committed reference changes because the outbox row is created with the same database transaction. Stale, retrying, failed, and recovery-required publications are observable through status APIs and telemetry. The freshness target is p95 <= 60 seconds from successful commit to consumer-observable Kafka event.

## Health, Smoke, and Recovery

Readiness reflects Kafka and Schema Registry availability where publication is required. Local smoke proves one outbox row, one Avro/SR publication, PUBLISHED status, and correlation propagation. CI later gates Avro compatibility and message-contract tests.

## Non-Goals

The design does not promise exactly-once delivery, downstream consumer recovery, a final physical DLQ topic, or final broker sizing in this stage.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
