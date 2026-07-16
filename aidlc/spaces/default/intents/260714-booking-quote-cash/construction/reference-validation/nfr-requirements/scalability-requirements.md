# Scalability Requirements - U02 Reference Validation

## Load and Fan-out

- Stateless Booking instances may validate concurrently; expected revision/fingerprint prevents stale cross-instance application.
- Per-request provider concurrency is capped at four and total HTTP connection/thread pools are bounded; overload returns unavailable rather than creating unbounded tasks.
- W1 load uses 100 validations at concurrency 10 against at least 100 active records per required set. Limits are eight legs and 20 equipment lines, producing at most 45 provider lookups/request; per-request concurrency four and shared outbound concurrency ten.
- Reference-option pages are bounded to 50 with debounced search and stale-request cancellation.

## Capacity Signals

Monitor validation rate, provider call amplification, active/pending client connections, pool saturation, timeout/429 rates, and Reference Data latency. The five-minute load phase passes only with zero errors, p95 pool wait <100 ms, no more than ten DB/outbound operations active per instance, peak RSS <=768 MiB, and no OOM/restart.

## Source Coverage

Capacity requirements derive from U02 `business-logic-model.md`, `business-rules.md`, and `requirements.md` using stateless Spring/Next.js components in `technology-stack.md`.
