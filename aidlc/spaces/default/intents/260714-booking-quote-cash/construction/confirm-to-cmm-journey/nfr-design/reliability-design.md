# Reliability Design - U04 Confirm to CMM Journey

## Outbox and Consumer

Booking transaction and deterministic UUID/unique logical key provide one event. The W0 relay is adopted with a strengthened atomic claim: one database transaction selects due rows `FOR UPDATE SKIP LOCKED`, marks them `IN_PROGRESS`, stamps `claimed_at`, and returns the claimed batch. A 30-second lease makes abandoned `IN_PROGRESS` rows eligible after restart. Publish failure returns the row to `RETRYABLE` with outbox-owned delays of 250 ms, 1 second, 5 seconds, then at most 30 seconds; schema/contract failures move directly to permanent failure. The idempotent producer permits exactly one immediate transport retry within the same 2-second delivery budget. The outbox remains the sole owner of durable cross-send retry state and backoff, so the two layers cannot multiply application retry schedules.

Consumers use `enable.auto.commit=false`, `AckMode.RECORD`, and `max.poll.records=50`. `DefaultErrorHandler` owns consume retries with `ExponentialBackOffWithMaxRetries(2)`, initial interval 250 ms and multiplier 4 (250 ms, then 1 second). Contract/invariant exceptions are classified non-retryable. A `DeadLetterPublishingRecoverer` writes the original key/value plus origin and error headers to the service-owned DLT using an `acks=all`, idempotent producer. Kafka acknowledgement occurs only after the listener returns and its application transaction commits; DLT recovery completes before the failed source record is acknowledged.

CMM transaction inserts receipt, locks/guards highest revision, reconciles journey, and inserts deterministic status outbox/audit. Duplicate envelope no-op; stale distinct commits receipt only; rollback leaves no receipt/effect. Publish retry ownership belongs only to the outbox; consume retry ownership belongs only to `DefaultErrorHandler`. Health/readiness expose DB/Flyway, broker/SR, listener, relay claim age and local guard.

CMM uses the same guarded brownfield migration pattern with automatic baseline disabled: valid history is validated/migrated, an empty schema receives V1/V2, and a non-empty schema without history is explicitly baselined only after an exact checked-in CMM V1 catalog fingerprint matches. Unknown or partial catalogs abort before baseline or migration and keep readiness false.

## Source Coverage

Design implements `reliability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U04 `business-logic-model.md`.
