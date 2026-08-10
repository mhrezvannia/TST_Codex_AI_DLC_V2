# Monitoring Design - U03 Agreement Pricing

## Pricing Signals

Booking records client total/attempt/retry/timeout/breaker/bulkhead/result/manual timers. Charge records claim insert/replay/conflict/live/expired-takeover, agreement candidate/query, term count, calculate, fenced complete, stale-owner rejection, manual outcome, and API latency/status. Hikari, PostgreSQL, JVM RSS/GC, readiness, and restart signals are collected for both owners.

Traces connect BFF pricing command, Booking HTTP client, Charge controller, claim transaction, agreement query/calculation, terminal completion, and Booking apply using correlation ID. Pricing payloads/rates/customer attributes and tokens are excluded from logs/traces; metric labels remain bounded to operation/outcome/error code.

## Gates and Alerts

After 100 warm-ups, 1,000 valid-agreement requests run at concurrency 10. The run fails on any error, contract mismatch, duplicate result/manual case, p99 above the approved local threshold, duration over five minutes, pool wait p95 >=100 ms, connections >10/service, RSS >768 MiB, OOM/restart, or resilience parameter drift. Separate scenarios prove live claim, expired takeover, stale completion rejection, timeout/503 retry only once, breaker opening, and `NO_RATE` manual behavior.

Alerts distinguish provider saturation, database contention, breaker open, high takeover/collision, manual business outcome, malformed/unauthorized request, and migration/readiness failure. W1 local alerts are blocking evidence assertions, not a production availability claim.

## Evidence

Raw monotonic samples, Pact reports, claim/result rows, before/after hashes, breaker event stream, query plans, pool/JVM/Docker stats, and restart timelines land under the unique W1 run ID with command/time/exit/hash metadata.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U03 `business-logic-model.md`.
