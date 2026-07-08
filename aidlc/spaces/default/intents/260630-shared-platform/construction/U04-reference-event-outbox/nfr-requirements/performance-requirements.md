# Performance Requirements - U04 Reference Event Outbox

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines outbox enqueue, claim, event mapping, Kafka publication, retry/dead-letter, status query, schema compatibility, and walking-skeleton workflows. `business-rules.md` fixes transactional outbox rows, bounded claims, typed Avro contracts, at-least-once publication, retry visibility, and correlation propagation. `requirements.md` fixes NFR-002, NFR-004, NFR-011, NFR-012, NFR-016, and constraints C-003 and C-006.

## Target Requirements

| Requirement | U04 obligation |
|---|---|
| Event freshness | p95 <= 60 seconds from successful reference commit to consumer-observable Kafka event. |
| Publisher throughput | Batch size must be configurable and bounded. |
| Claim latency | Due pending/retryable rows must be claimed without blocking concurrent publishers. |
| Status query latency | Event status queries must be filterable by event id, record id, reference set, status, and time range. |
| Schema validation | Serialization and compatibility checks must be measurable and gateable in CI. |

## Measurement Requirements

- Measure commit-to-outbox, outbox age, claim latency, serialization latency, publish latency, publish-to-status-update latency, and end-to-end freshness.
- Emit outbox depth, oldest pending age, retrying count, failed count, recovery-required count, and p95 freshness metrics.
- Trace event id and correlation id through mapping, schema registry, Kafka publish, and status update.
- Avoid high-cardinality metric labels for event id/correlation id; use logs/traces for item-level lookup.

## Performance Constraints

- Claim queries must use concurrency-safe row selection such as SKIP LOCKED or equivalent.
- Publisher batch size and backoff are configurable.
- Permanent schema/serialization failures must not loop indefinitely.
- Status queries must be paginated/filterable and must not scan unbounded outbox history.

## Non-Goals

- U04 does not optimize downstream consumer processing.
- U04 does not implement reference API read performance; U03 owns provider/admin reads.
- U04 does not set final production broker capacity; later performance validation confirms load.

