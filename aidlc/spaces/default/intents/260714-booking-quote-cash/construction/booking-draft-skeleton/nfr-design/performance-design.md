# Performance Design - U01 Booking Draft Skeleton

## Request Path

Next.js server/BFF performs one bounded Booking API call. Controller maps typed DTOs; application opens one short transaction; JDBC uses parameterized insert/select and deterministic indexed list query. Detail reads one canonical snapshot with no Reference/Charge/CMM fan-out. No cache is added because local indexed reads meet `performance-requirements.md` and avoid stale authority.

Hikari is min 2/max 10/2 s timeout. List caps 100 rows and orders `(updated_at DESC, booking_id DESC)` over matching indexes. Bodies are limited to 256 KiB. Micrometer timers split BFF, API, transaction, query, serialization, and upcast; the load harness enforces p95/p99 and pool-wait thresholds.

## Validation

Query-plan tests use 10,000 bookings; JUnit measures repository calls and the live harness measures HTTP/UI. Regression fails on errors, p95 >500 ms, p99 >1 s, pool wait p95 >=100 ms, or RSS >768 MiB.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U01 `business-logic-model.md`.
