# NFR Design Questions - U02 Ordered Lifecycle and Observable Rejections

U02's approved NFR requirements already fix local rejection timing, fenced
publisher/consumer retry fixtures, exact ten-delivery Booking ordering, and the
isolated-stack boundary.

## Q1. Conflict transaction pattern

How should duplicate and out-of-sequence rejection preserve accepted state?

- A. Use one local transaction with row lock/idempotency claim, immutable attempt/rejection/audit rows, and no accepted-state/outbox mutation on conflict. (recommended)
- B. Return conflicts before durable evidence is written.
- C. Queue conflict evidence asynchronously after accepting the request.
- X. Other (please specify)

[Answer]: Atomic evidence transaction (Recommended)

## Q2. Retry fencing pattern

How should publisher and Booking-consumer fail-once fixtures be fenced?

- A. Use event-targeted fail-once seams plus conditional event/worker/token/version updates and explicit due/health evidence. (recommended)
- B. Use an unfenced status flag and worker retry.
- C. Use a new workflow/orchestration service for retries.
- X. Other (please specify)

[Answer]: Event-targeted fenced seams (Recommended)

## Q3. Ordering projection pattern

How should Booking handle the exact ten-delivery mixed ordering window?

- A. Insert/lock one receipt per unique event, return DUPLICATE for redelivery evidence, classify equal/lower unique positives STALE, and update only the strongest projection. (recommended)
- B. Last-arrival-wins projection.
- C. Query CMM synchronously to resolve order.
- X. Other (please specify)

[Answer]: Receipt + strongest projection (Recommended)
