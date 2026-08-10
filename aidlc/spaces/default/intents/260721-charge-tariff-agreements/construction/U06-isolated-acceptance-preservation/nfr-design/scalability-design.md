# Scalability Design - U06 Isolated Acceptance and Preservation

## Non-deployable capacity posture

U06 adds only drivers, schemas, and reports. It inherits U01-U05 fixture sizes
and uses exactly 10 pricing clients. It adds no runtime service, database,
cache, queue, broker, replica, shard, shared UI component, or production
capacity claim.

## Bounded orchestration

The runner owns a finite ordered DAG. Manager fingerprint, migrations, seed,
commercial mutations sharing keys, restart/restore, guards, audits, and final
manifest remain serial. Only fixture-isolated read/browser cells may run in a
configured bounded worker pool. One worker failure is persisted and drives
FAILED/BLOCKED; it is never hidden by retry.

Readiness has monotonic deadlines, bounded polling, and no busy loop. Later
gates are written SKIPPED after terminal BLOCKED/FAILED so closed IDs remain
complete without executing unsafe work.

## Closed matrices

One checked-in `acceptance-registry.json` is the authoritative closed registry:

- preservation: exactly 5 (`W0-01`, `W0-02`, `W1-01`, `W2-01`, `W2-02`);
- security: exactly 6 (`SEC-U06-001` through `SEC-U06-006`);
- commercial: exactly 13 (`AGREEMENT_PRICE`, `TARIFF_FALLBACK`,
  `SUCCESSOR_REPRICE`, `NO_RATE`, four `AMBIGUITY_*`, `OUTAGE_TIMEOUT`,
  `OUTAGE_503`, `OUTAGE_CIRCUIT`, `CHARGE_DISABLED`,
  `RECONFIRM_NO_CHARGE`);
- browser structural: exactly 40 IDs, the Cartesian product of five families
  (`LIST_FILTER`, `CREATE_EDIT`, `DETAIL_LIFECYCLE`, `MANUAL_EVIDENCE`,
  `BOOKING_PRICING`), four widths, and two themes;
- browser functional state: exactly 33 IDs: 5 list/filter, 6 create/edit,
  6 detail/lifecycle, 4 manual-evidence, and 12 Booking-pricing states from
  `frontend-components.md`, each assigned one declared route/width/theme;
- design dependencies: exactly 3 (`DS-01`, `DS-02`, `DS-03`);
- observability: exactly 6 (`LATENCY`, `TERMINAL_OUTCOME`, `BASIS`,
  `MANUAL_FALLBACK`, `REPLAY_CONFLICT`, `REDACTION`);
- quality: exactly 10 (`BACKEND`, `FRONTEND`, `CONTRACT`, `MIGRATION`,
  `COVERAGE`, `NGINX`, `PLAYWRIGHT`, `PERFORMANCE`, `RESTART_RESTORE`,
  `GIT_DIFF`);
- audit: exactly 4 (`AIDLC_DETECTOR`, `AIDLC_MANUAL`,
  `ERP_FIDELITY_DETECTOR`, `ERP_FIDELITY_MANUAL`).

The registry also contains the ten owned route patterns and five edge-regression
routes. Every result is PASS, FAIL, BLOCKED, or SKIPPED and references one
registry ID, one or more artifact hashes, and required scenario/correlation
links. Duplicate, absent, unknown, dangling, or illegal SKIPPED results fail
finalization; SKIPPED is legal only after the ledger's earlier terminal gate.

Browser worker count is fixed by host/config and every context has isolated
session/fixture namespace. Commercial fresh identities are never shared.

## Streaming evidence

Command output, performance samples, logs, and assertion records stream to
bounded files beneath the run root. Hashes cover final bytes; compression is
allowed only before indexing. In-memory state retains small counters and index
metadata, not complete logs/traces/samples.

Owner-local SQL is paged/bounded and redacted. The harness never exports whole
tables, performs cross-database joins, or issues N+1 evidence queries.

## Growth and reruns

Each attempt receives a new UTC/random run ID and links the prior terminal
manifest. FAILED/BLOCKED roots are immutable. No mutable `latest` directory or
caller-supplied PASS exists. A larger future matrix requires explicit disk,
time, concurrency, and redaction budgets.

## Degradation

Unavailable Docker/browser/capability records BLOCKED once with command,
environment evidence, and next action. Available timeout/assertion mismatch is
FAILED. Neither authorizes manager mutation, alternate port/project, raw
Compose, direct-backend acceptance, skipped IDs, or hardcoded price.

## Verification and traceability

Tests force path escape, duplicate/missing IDs, interrupted streaming, worker
failure, timeout, hash mismatch, stale prior links, oversized output, and
manager drift, proving deterministic terminal status and bounded resources.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
