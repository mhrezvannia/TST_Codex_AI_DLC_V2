# Scalability Requirements - U04 Pricing Provider and Manual Cases

## Capacity boundary

U04 runs inside the existing Charge service and PostgreSQL authority. It adds no
service, cache, broker, queue, database, shard, replica, or global client store.
Local evidence uses the confirmed U01 fixture (10,000 Rates/50,000 versions),
U03 fixture (10,000 Agreements/50,000 versions/150,000 links), at least 100,000
terminal receipts, 10,000 OPEN cases, and 10 concurrent pricing clients. This is
not a production traffic forecast.

## Bounded query and contention behavior

| ID | Requirement | Pass condition |
| --- | --- | --- |
| SCALE-U04-001 | Agreement-first resolution uses indexed exact match/window/lifecycle predicates and bounded three-link reload. | each fresh agreement scenario passes p99; no full history, legacy candidate, or N+1 link query |
| SCALE-U04-002 | Tariff fallback queries three indexed category/applicability/window sets and stops before calculation on missing/ambiguity. | each tariff/no-rate/ambiguity scenario passes independently with exact query/count evidence |
| SCALE-U04-003 | Receipt claim/replay remains unique-index lookup plus fenced conditional update at 100k terminals. | p99 gate and 20-round matrix pass; stale repository completion is exact `CompletionResult.FENCE_REJECTED`, with 409 in-progress before winner completion or winner-byte replay after it; no table scan, duplicate terminal/case, or stale-owner write |
| SCALE-U04-004 | Manual list/detail remains indexed, stable and page-bounded at 10k OPEN cases. | p95 <=750 ms; size <=100; authorization before count/lookup; no unbounded snapshot parsing |
| SCALE-U04-005 | Canonical case creation is contention safe. | 20+ same-key rounds return one unchanged OPEN row to all contenders without deadlock/overwrite |

The service is stateless between calls except authoritative receipt/case rows.
Lease/fencing and DB uniqueness, not JVM locks or affinity, provide multi-instance
correctness. Terminal receipts intentionally trade storage for deterministic
byte replay and protection from recalculation drift.

## Growth and degradation

No commercial cache is selected: caching candidate or terminal state risks
stale authority, duplicate cases, or disclosure. No asynchronous pricing path is
selected because Booking needs the terminal response and the current bounded
workflow meets the local target.

Capacity review triggers are a per-scenario p99 breach after query/index tuning,
receipt/case index plan degradation, connection/lock contention on distinct keys,
or the three-cycle heap/RSS gate failing. Optimize query shape, indexes,
serialization, and expired-claim cleanup first. Any partition/archive/cache/queue
requires a later consistency, replay, retention, recovery, and operations design.

When Identity/database/reference authority is unavailable, return typed failure
without a manual case or fabricated price. Load cannot change deterministic
classification precedence. Invalid/unbounded manual queries are rejected.
Automatic mutation retry is prohibited; identical deliberate retry follows the
receipt protocol.

## Resource and concurrency validation

The blocking three-cycle heap/RSS, pool, deadlock, unbounded-query/history, and
N+1 criteria are defined in `performance-requirements.md`. Concurrency tests run
through two Spring contexts sharing PostgreSQL; JVM-local synchronization cannot
pass falsely. Reports include query plans, rows, connections, locks, heap/RSS,
GC/CPU, receipt/case counts, and outcome latency.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, preserving their sole-authority,
fenced-receipt, manual-evidence, and no-new-topology boundaries.
