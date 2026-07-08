# NFR Design Questions - U04 Reference Event Outbox

## Scope

This file records design questions resolved during NFR Design for `U04-reference-event-outbox`.

## Resolved Questions

### Q1. How is event loss prevented after a committed reference mutation?

U03 persists reference aggregate state and an outbox row in the same PostgreSQL transaction. U04 treats a committed mutation without a corresponding outbox row as an anomaly requiring explicit recovery. Direct Kafka publish without durable outbox remains rejected.

### Q2. How do multiple publisher workers avoid duplicate concurrent sends?

Publisher workers claim bounded PENDING or RETRYABLE rows using row-level concurrency protection such as `SKIP LOCKED` or an equivalent compare-and-claim mechanism. Claimed rows move to IN_PROGRESS with `claimedBy` and `claimedAt`, and stale claims become recoverable after timeout.

### Q3. What delivery guarantee is designed?

U04 provides at-least-once publication. Event ids remain stable across retries and are included in the event envelope so consumers can deduplicate. Exactly-once delivery is not promised.

### Q4. How are poison events and dependency outages handled?

Broker outages and unknown publish outcomes become RETRYABLE with backoff and the same event id. Serialization or schema errors become FAILED_PERMANENT and do not loop indefinitely. Publish success followed by failed status update becomes RECOVERY_REQUIRED or an equivalent reconciled state.

### Q5. What status information is exposed?

Authorized admin/operator APIs expose filtered and paginated outbox status by event id, record id, reference set, status, and time range. Responses include safe lifecycle state, attempts, timestamps, correlation id, and broker metadata where safe, but not broker credentials, secrets, raw stack traces, or unsafe payload internals.

## Open Questions

No blocking questions remain for this stage. Final broker sizing, partition counts, physical DLQ topics, and environment encryption details are deferred to later infrastructure and performance validation stages.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
