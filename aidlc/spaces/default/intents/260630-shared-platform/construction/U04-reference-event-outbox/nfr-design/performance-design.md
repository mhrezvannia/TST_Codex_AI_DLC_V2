# Performance Design - U04 Reference Event Outbox

## Performance Goals

U04 must publish p95 <= 60 seconds from successful reference commit to consumer-observable Kafka event. It must expose enough measurements to separate commit-to-outbox delay, outbox age, claim delay, serialization latency, Schema Registry latency, Kafka publish latency, and publish-to-status-update latency.

## Outbox Claim Design

Publisher ticks select due PENDING and RETRYABLE rows by `nextAttemptAt` using a bounded configurable batch size. Claim queries use `SKIP LOCKED` or an equivalent concurrency-safe guard so multiple workers can run without blocking or claiming the same row.

Indexes cover status, `nextAttemptAt`, claimed state, reference set, record id, event id, created time, and occurred time. Stale IN_PROGRESS rows are not scanned through unbounded history; they are selected by indexed timeout criteria.

## Mapping and Publication Design

Each outbox row maps to a typed Avro event family for its reference set. The mapper builds the common envelope, validates required fields and schema version, resolves the Schema Registry subject, serializes the payload, publishes to Kafka with deterministic keying, then records broker metadata and PUBLISHED status.

Permanent schema/serialization failures stop retry loops and move to FAILED_PERMANENT. Retryable broker failures update attempts and `nextAttemptAt` using bounded backoff.

## Status Query Design

Status APIs require filters and pagination for event id, record id, reference set, status, and time range. API projections are safe, compact, and suitable for U06/admin/operator views. They must not perform unbounded outbox-history scans.

## Measurement

Metrics include outbox depth, oldest pending age, retrying count, failed count, recovery-required count, claim latency, serialization latency, publish latency, status update latency, end-to-end freshness, and p95 freshness. Event id and correlation id are kept in logs/traces rather than high-cardinality metric labels.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
