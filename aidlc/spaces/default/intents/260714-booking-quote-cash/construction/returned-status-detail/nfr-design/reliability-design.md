# Reliability Design - U05 Returned Status Detail

## Ordering and Recovery

Transaction inserts event ID then SQL `ON CONFLICT ... DO UPDATE WHERE` compares occurred, rank, received, event ID. Duplicate conflict returns no-op; stale distinct commits receipt disposition but not projection; failure rolls both back. Consumer auto-commit is disabled and `AckMode.RECORD` acknowledges only after listener return and transaction commit. `DefaultErrorHandler` exclusively owns two transient retries at 250 ms then 1 second; permanent contract/invariant failures go directly through `DeadLetterPublishingRecoverer`, preserving original key/value and origin/error headers before source acknowledgement.

The CMM status outbox exclusively owns durable cross-send publish retry state/backoff and recovers atomic claims after a 30-second lease. Source and DLT producers use all-replica acknowledgement, idempotence, and exactly one immediate transport retry bounded within the same 2-second delivery attempt; neither producer schedules application retries.

Detail reads persisted projection during CMM/Kafka outage/restart. Confirmed/no projection is pending; polling exhaustion delayed+Retry; local read failure unavailable while retaining previous display. Restart health recovers <=60s with no volume-loss claim.

## Source Coverage

Design implements `reliability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U05 `business-logic-model.md`.
