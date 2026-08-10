# Reliability Design - U01 Rate Authority

## Reliability model and upstream basis

This design implements `reliability-requirements.md` and its RPO-0 local proof
under the targets and controls in `performance-requirements.md`,
`security-requirements.md`, and `scalability-requirements.md`. It uses the
brownfield choices in `tech-stack-decisions.md` and the authoritative command,
query, concurrency, and migration flows in `business-logic-model.md`.

There is no production availability SLA, multi-AZ promise, or stale commercial
fallback. Reliability means atomic commands, deterministic concurrency,
fail-closed dependencies, validated forward-only migrations, restart
durability, and a tested isolated restore.

## Transaction and concurrency resilience

Create, edit, approve, and successor each persist commercial rows plus exactly
one attributable activity in one Spring/PostgreSQL transaction. Any audit,
constraint, connection, or process failure before commit leaves neither row.
After commit, exact IDs, version numbers, row versions, canonical values, and
activity hashes survive restart.

Approval acquires the transaction-scoped advisory key, locks/reloads the exact
Draft, checks expected row version and lifecycle, executes the inclusive
overlap query, and commits once. Successor creation locks the stable Rate before
version allocation. Database constraints remain the final invariant. The
service never retries a whole mutation automatically; recovery from a lost
response is a detail read followed by a command valid for the observed state.

## Remote dependency resilience

Identity and Reference Data adapters have separate bounded permit sets: 10 for
Identity with a 16 KiB response limit, and 50 for Reference Data with at most
five 64 KiB responses per command. Permit wait is capped at 100 ms, connection
establishment at 250 ms, and all work shares one two-second overall deadline
from adapter entry. Each command holds at most five Reference permits; the
healthy ten-command maximum consumes all 50 without waiting and completes its
provider calls/fan-out within 250/300 ms. They fail closed with
401/403/503 or readiness failure as defined upstream. No automatic retry,
circuit-breaker cache, stale record, or default decision is used. This keeps the
maximum resource occupancy bounded and prevents duplicated or unauthorized
commercial writes.

A dependency outage affects only operations needing that dependency. Existing
authorized Rate reads may continue when their service-side authorization can be
obtained; mutations never bypass authorization or reference validation. A
typed unavailable outcome retains safe browser form state but commits nothing.

## Health, restart, and graceful shutdown

Liveness proves only that the Charge process and event loop are responsive. It
does not call Identity, Reference Data, or PostgreSQL. Readiness verifies Charge
database connectivity, Flyway validation/catalog adoption, and mandatory non-
local credentials plus fail-closed adapter configuration. It does not make live
downstream calls on every probe.

On shutdown, the HTTP server stops accepting new work, bounded in-flight
transactions either commit or roll back, and datasource resources close. The
local acceptance wrapper restarts the service, waits at most 120 seconds for
readiness, then completes an authenticated Rate detail read and compares
canonical counts/hashes. A timeout in an available environment is FAIL; an
unavailable required capability is BLOCKED, never PASS.

## Forward-only migration adoption

Flyway uses one ordered V1-V4 chain in the Charge database. Startup selects
exactly one path:

- empty catalog: apply V1-V4;
- Flyway history present: validate checksums and migrate forward;
- nonempty catalog without history: compare the full legacy catalog and
  baseline at V1 only on an exact match;
- partial or drifted catalog: abort startup and remain unready.

An applied versioned file is immutable. Defects are fixed by a later ordered
forward-repair migration or by restoring a verified backup into a newly
provisioned isolated database. Destructive reset and in-place down migration
are not recovery mechanisms.

The migration suite covers empty, exact legacy, history-present, partial, and
drifted fixtures; exact V3/V4 schema/backfill contracts; checksum enforcement;
and repeated startup. It preserves the explicit LEGACY/W2 discriminator,
nullable legacy commodity seam, append-only agreement activity, and pricing
dedupe structures even though U03/U04 own their behavior.

## Backup, restore, and RPO-0 proof

Before upgrade, the isolated wrapper captures a PostgreSQL backup containing
catalog, Flyway history, Rate/version/activity, and legacy rows. Restore creates
a new isolated database rather than overwriting the source. It then validates
catalog shape, checksums, row counts, and canonical selected-column hashes;
starts Charge; and performs authenticated reads of legacy and new records.

RPO 0 is proven by equality of committed `charge_rates`,
`charge_rate_versions`, `charge_rate_activity`, relevant legacy rows, and Flyway
history counts/hashes before and after restart/restore. Backup credentials and
commercial payloads are redacted from retained evidence.

## Observability and failure injection

Metrics cover operation latency/outcome, reference unavailable, authority
conflict, pool wait, advisory/row lock wait, deadlock, transaction result, and
migration/readiness status using only low-cardinality dimensions. Correlated
logs connect the safe authorization/reference decision, mutation outcome,
activity row, and latency sample without logging amounts or secrets.

Fault tests stop the process before and after commit, fail activity writes,
exhaust permits/pools, delay/corrupt dependencies, inject stale state, and run
same-key contention. Every case asserts counts/hashes and exact typed outcomes;
an exception alone is insufficient.

All decisions trace to `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
