# Performance Requirements - U03 Agreement Pricing

## Blocking Latency Gate

- After 100 warm-up requests, 1,000 measured valid-agreement requests at concurrency 10 shall meet nearest-rank p99 <=800 ms on the real Compose Booking-to-Charge HTTP seam.
- Every measured error remains in raw evidence and fails the gate; success-only percentile filtering is forbidden.
- Booking HTTP timeout is two seconds with at most one retry only on timeout/503 using the same key/body/correlation; 4xx is never retried.
- Agreement selection and pricing queries use indexed party/status/validity/lane fields; line calculation is O(applicable terms) with deterministic ordering.

## Budget and Telemetry

Capture total operation, Booking client, Charge claim, agreement query, calculation, fenced completion, retry, breaker state, pool wait, and error code. Amount calculation uses `BigDecimal`; benchmarking cannot replace itemized lines with cached/guessed totals.

## Source Coverage

Targets directly implement U03 `business-logic-model.md`, `business-rules.md`, and pricing NFRs in `requirements.md` on the Java/Spring/PostgreSQL stack from `technology-stack.md`.
