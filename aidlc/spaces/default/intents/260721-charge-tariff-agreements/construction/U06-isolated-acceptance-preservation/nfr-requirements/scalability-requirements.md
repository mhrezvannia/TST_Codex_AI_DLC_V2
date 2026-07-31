# Scalability Requirements - U06 Isolated Acceptance and Preservation

## Capacity and topology boundary

U06 is a non-deployable evidence harness. It adds no service, database, cache,
broker, queue, replica, shard, shared UI component, or production topology.
Runtime capacity is inherited from U01-U05 fixtures: 10k Rates/50k versions,
10k Agreements/50k versions/150k links, 100k Charge receipts/10k OPEN cases,
10k Bookings/50 snapshots for 1k deep histories/100k local receipts, and 10
concurrent pricing clients.

## Bounded harness behavior

| ID | Requirement | Pass condition |
| --- | --- | --- |
| SCALE-U06-001 | readiness and command polling is bounded | 120 seconds per service/probe, 10 minutes full stack; no busy/indefinite loop |
| SCALE-U06-002 | performance work uses fixed concurrency and unique namespaces | exactly recorded 10 clients; no identity reuse/replay; bounded connections/threads/memory |
| SCALE-U06-003 | browser evidence uses a declared finite page/state/width/theme matrix | every required cell exactly once; worker count bounded by host/config; no silent omission |
| SCALE-U06-004 | evidence files stream/write incrementally beneath one run root | no unbounded in-memory log/trace/sample aggregation; sizes/counts/hash indexed |
| SCALE-U06-005 | DB/history queries are owner-local, paged/indexed and redacted | no cross-DB join, full-table payload export, or N+1 evidence loop |
| SCALE-U06-006 | preservation/security/observability sets are closed | exactly five preservation IDs, six security cells, required scenario/metric IDs; unavailable is BLOCKED, not dropped |

Parallelism is permitted only for independent read/test cells whose fixtures and
browser contexts are isolated. Commercial mutations sharing authority keys,
manager fingerprints, migrations, restart, restore, demo guards, and final
manifest derivation remain ordered. A parallel worker failure cannot be retried
silently into green; the run records it and derives FAIL/BLOCKED.

## Growth and evidence retention

The harness retains raw pricing samples, screenshots/traces, command output,
canonical DB assertions, audit reports, and final manifest under one collision-
free run ID. Large logs are bounded by scenario/time and may be compressed after
hashing rules account for the final bytes. Evidence must not be truncated in a
way that removes an asserted failure or correlation.

No production traffic/capacity inference follows from this local host. Future
larger fixtures or matrices require explicit disk/time/parallelism budgets and
must preserve unique identities, manager isolation, redaction, and closed-set
validation. U06 does not authorize infrastructure scaling to make a failing
functional assertion pass.

## Degradation and recovery

Unavailable Docker/browser/required external capability yields BLOCKED once with
command, environment evidence, and next action. An available dependency that
misses a readiness bound or an observed assertion mismatch yields FAIL. Neither
causes manager mutation, alternate port, raw Compose fallback, skipped matrix
cell, or hardcoded commercial result.

Transient readiness polling stays within the fixed bound. Commercial retry uses
the same specified body/key and is recorded; a later fresh acceptance attempt
uses a new run ID and links the prior terminal manifest.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, making the integrated capacity and
finite evidence sets testable without creating a deployable or production claim.

