# Performance Requirements - U05 Returned Status Detail

## User-Visible Latency

- Successful confirm response to matching visibly rendered returned status shall meet nearest-rank p95 <=5 s over 100 measured unique journeys at concurrency 5 after 10 warm-ups.
- From committed CMM status outbox to Booking projection plus BFF-visible data shall meet p95 <=3 s, preserving the U04 allocation.
- Detail projection query shall meet p95 <=500 ms for the W1 booking/container using indexed local tables only.
- UI revalidates once per second for at most 30 attempts, pauses while hidden, prevents overlap, and stops immediately on success/error/navigation.

## Measurement

Use monotonic timestamps at confirm response and matching event-ID render. Capture relay/consume/projection/BFF/poll latency, lag, attempts, errors, and raw samples. Every failure fails the workload; no direct CMM call or cached fixture may satisfy timing.

## Source Coverage

Targets implement U05 `business-logic-model.md`, `business-rules.md`, and NFRs in `requirements.md` using Kafka/PostgreSQL/Next.js from `technology-stack.md`.
