# Performance Requirements - U02 Reference Validation

## Latency Budget

- Warmed validation of the W1 one-customer/one-leg/one-equipment draft shall complete within p95 <=1.5 s and p99 <=2 s over 100 Compose requests at concurrency 10, including live Reference Data calls.
- Independent lookups use bounded concurrency no greater than four; results are emitted in deterministic field-path order.
- Provider connect/read timeouts fit inside the two-second command ceiling and cancel outstanding work after a terminal provider-unavailable decision.
- Reference-option search returns p95 <=500 ms with debounce, cancellation, page size <=50, and no unbounded result set.

## Measurement

Capture total validation, provider call count/latency, bounded-pool wait, invalid-field count, and errors. Failures remain in raw samples. No Booking authoritative cache or copied table may improve benchmarks artificially.

## Source Coverage

Budgets decompose `requirements.md` through U02 `business-logic-model.md` and `business-rules.md` on the Spring HTTP/PostgreSQL/Next.js `technology-stack.md`.
