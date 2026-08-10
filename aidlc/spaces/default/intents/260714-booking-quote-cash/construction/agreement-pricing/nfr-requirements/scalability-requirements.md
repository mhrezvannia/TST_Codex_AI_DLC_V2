# Scalability Requirements - U03 Agreement Pricing

## Concurrent Capacity

- Stateless Booking/Charge instances support the fixed concurrency-10 workload while database unique constraints and owner fencing arbitrate all races.
- One short claim and one short completion transaction bound lock time; calculation and Booking HTTP calls occur outside database transactions.
- Acceptance seeds at least 100 approved agreements with up to 100 terms each; response charge lines are capped at 100, request body at 256 KiB, equipment quantity/TEU at 1,000.
- Hikari minimum 2/maximum 10 with 2 s connection timeout and outbound/breaker concurrent calls capped at ten per instance; saturation yields controlled unavailable/manual outcomes.

## Scaling Signals

The 1,000-request workload must finish within five minutes with zero errors, p99 <=800 ms, p95 pool wait <100 ms, peak RSS <=768 MiB, no OOM/restart, and DB connections never >10/service. Track claim collisions/takeovers, active calculations, retry/manual/timeout, breaker, candidate/line counts, CPU, and heap.

## Source Coverage

Capacity rules derive from U03 `business-logic-model.md`, `business-rules.md`, and `requirements.md`, retaining stateless Spring/PostgreSQL deployment from `technology-stack.md`.
