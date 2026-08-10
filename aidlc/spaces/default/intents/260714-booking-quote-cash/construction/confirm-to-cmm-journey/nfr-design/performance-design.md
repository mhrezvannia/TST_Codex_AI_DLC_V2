# Performance Design - U04 Confirm to CMM Journey

## Async Budget

Confirm transaction performs row lock, receipt, aggregate/audit/outbox insert and responds without Kafka wait. `ScheduledOutboxRelay` runs at fixed delay 250 ms and atomically claims up to 50 due rows with `FOR UPDATE SKIP LOCKED` plus update/returning semantics. `PENDING`, due `RETRYABLE`, and `IN_PROGRESS` rows whose 30-second claim lease expired are eligible. The shared publisher caches parsed schema/registered subject after preflight and waits at most 2.5 seconds for the producer send to terminate.

Kafka producer configuration is `acks=all`, `enable.idempotence=true`, `max.in.flight.requests.per.connection=5`, `delivery.timeout.ms=2000`, `request.timeout.ms=1000`, and `retries=1`. That one immediate transport retry remains inside the same producer send and delivery-timeout budget; it has no application backoff or durable scheduling. The outbox exclusively owns cross-send durable publish retries at 250 ms, 1 second, 5 seconds, then capped at 30 seconds; schema/contract failures are permanent. Three-partition listener concurrency3 maps/validates then performs Reference HTTP outside transaction and one CMM apply transaction.

Micrometer records confirm, outbox lag/claim age/attempt, producer ack/timeout, consumer lag/retry/DLT, reference validation, receipt/journey/outbox commit. The 100-journey concurrency5 harness enforces confirm p95500ms/p99 1s, CMM commit p95 2s, lag drain 30s, pools/RSS.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U04 `business-logic-model.md`.
