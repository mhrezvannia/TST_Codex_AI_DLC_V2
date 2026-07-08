# Scalability Design - U04 Reference Event Outbox

## Scalability Goals

U04 scales publication through bounded outbox batches, indexed status transitions, concurrency-safe worker claims, configurable backoff, and typed event families. Additional workers may process different rows, but the same row must not publish concurrently.

## Outbox Storage

The outbox table is indexed by status, `nextAttemptAt`, claimed state, reference set, record id, event id, created time, and occurred time. Payload snapshots are reference-change facts, not full downstream projections.

Retention and archive policies can be added later, but status queries in the MVP must remain filtered and paginated.

## Worker Scaling

Publisher workers claim PENDING and RETRYABLE rows with `SKIP LOCKED` or an equivalent guard. Batch size is configurable and bounded per worker. Backoff and `nextAttemptAt` prevent hot retry loops when Kafka, Schema Registry, or serialization dependencies are failing.

Stale IN_PROGRESS rows become recoverable after timeout, supporting horizontal worker scaling and safe shutdown.

## Event Contract Scaling

The MVP publishes nine typed reference-change event families, one per approved reference set family. Schema subjects remain governed by U07/U08 contract catalog and compatibility checks. Future consumers must deduplicate by stable event id and must not require U04 to implement service stubs or shared database access.

## Operational Scaling

Telemetry tracks depth, oldest pending age, retry counts, failed count, recovery-required count, and freshness p95 so operators can identify backlog, poison events, publisher contention, and schema sprawl. Final Kafka partitions and broker sizing remain deferred to infrastructure/performance validation.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
