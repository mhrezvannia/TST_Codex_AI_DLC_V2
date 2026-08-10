# NFR Requirements Questions - U02 Ordered Lifecycle and Observable Rejections

U02 inherits U01's local-only p95/max API target, 30-second healthy propagation,
isolated-stack protection, security/accessibility controls, and no-production-SLO
boundary. These questions specialize `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and `technology-stack.md` only where U02
adds rejection, relay-recovery, and ordered-consumer behavior.

## Q1. Rejection response target

What measured target should duplicate and out-of-sequence capture paths meet?

- A. For 20 run-scoped attempts of each 409 class after one excluded warm-up, require p95 <= 2 seconds and max <= 5 seconds from submit to durable rejection response plus focused UI summary; 409s are measured as expected outcomes but never as accepted GTOT samples. (recommended)
- B. Record rejection timing without a pass/fail target.
- C. Define a production rejection-latency SLO.
- X. Other (please specify)

[Answer]: A - p95 2s, max 5s (Recommended)

## Q2. Transient relay recovery

What bounded acceptance-profile target should prove RETRYABLE outbox recovery?

- A. Inject one retryable publish failure, require durable RETRYABLE with `nextAttemptAt` within 5 seconds, restore the broker, and require fenced publication plus Booking DB/UI APPLIED within 30 seconds from the later of broker-restored or row-due time; production backoff remains configurable and unspecified. (recommended)
- B. Keep the checked-in five-minute retry and use an injected clock to prove eventual recovery without a 30-second real-time bound.
- C. Define one fixed retry schedule for all production environments.
- X. Other (please specify)

[Answer]: A - Due 5s, applied 30s (Recommended)

## Q3. Booking ordering contention

What bounded consumer load should prove duplicate/stale/legacy ordering without a
production throughput claim?

- A. Deliver a 10-record run-scoped mix containing one highest positive event, redelivery of its envelope ID, equal/lower positive events, legacy sequence 0, and invalid/unassigned input; require one durable receipt per unique event ID, exact dispositions, and only the strongest valid latest projection within the healthy 30-second observer window. (recommended)
- B. Test each disposition sequentially with no mixed ordering window.
- C. Add a sustained Kafka throughput and partition-scaling test.
- X. Other (please specify)

[Answer]: A - Ten-record mix (Recommended)
