# Reliability Requirements - U06 Isolated Acceptance and Preservation

## Acceptance-state integrity

Run state is `PLANNED`, `RUNNING`, `BLOCKED`, `FAILED`, or technical `PASSED`.
Unavailable required capability is BLOCKED; observed command/assertion mismatch
is FAILED; later gates are SKIPPED after either terminal condition. Only observed
zero-exit plus semantic assertions is PASS. Technical PASSED requires all closed
sets, guards, hashes and gates green; it only permits the later human gate and
does not satisfy it.

Every transition is append-only in the run ledger and final manifest is derived,
not caller supplied. A rerun receives a new run ID and links the previous
terminal manifest; it never edits a failed/blocked run into green.

## Manager and orchestration reliability

The pre-guard and isolation config must pass before Wave A starts. All lifecycle,
exec/log/restart/teardown operations use `scripts/wave-a-compose.mjs` and target
only `linercore-wave-a`. Post-guard plus manager inventory equality is required
even if all commercial scenarios pass. If pre/post fingerprints differ, final
status is FAILED/BLOCKED as observed and no automated manager repair is attempted.

Each service/probe has the confirmed 120-second bound; full readiness has 10
minutes. Liveness/health alone cannot close authenticated/domain readiness.

## Data durability, migration, and restore

The harness proves:

- exact empty/legacy/partial/drifted Charge catalog behavior across V1-V4 and
  ordered Booking migration, with checksums and fail-closed drift;
- deterministic LEGACY backfill, no invented rate links, and old flattened
  Booking snapshots readable without synthetic typed rows;
- RPO 0 across restart for committed Rate/Agreement versions/links/activity/
  outbox, Charge pricing receipt/case/fence state, Booking aggregate/snapshot/
  evidence/local receipt/audit, and Flyway history via counts/canonical hashes;
- lost-response terminal replay creates no duplicate receipt, case, Booking
  snapshot, activity, or outbox row;
- approved/historical commercial rows and typed snapshots reject update/delete;
- backup restore targets a newly provisioned isolated database, validates old/
  new reads and hashes, and later migration—not in-place edit/down/reset—performs
  forward repair.

The runner captures backup identifier, redacted commands, catalog/data hashes,
restore target, restart timings, and recovery result. A destructive reset cannot
be accepted as proof.

## Commercial and cross-service consistency

Each scenario has one unique correlation joining edge/API, Booking, Charge,
owner-local DB assertions, safe logs/metrics, and UI. Evidence queries databases
separately and correlates by public/safe identities; it never performs a cross-
database join.

Agreement, tariff, successor Reprice, no-rate, ambiguity/outage and Charge-
disabled scenarios assert exact outcomes. Reprice appends and switches current
snapshot while prior bytes/versions remain unchanged. Reconfirm produces no
Charge call. No-rate has one Charge OPEN case and Booking manual-required with no
current total; outage/circuit has Booking-local evidence and no Charge case.
Disabling Charge cannot yield a new price or fallback line.

## Closed preservation and evidence sets

Exactly one result is required for W0-01, W0-02, W1-01, W2-01, and W2-02.
Unavailable/incompatible validation is BLOCKED, never omitted. Original W1
blocked/waived bytes/path/status and its new preservation result are separate.
W2-02 and DS-01/02/03 remain exactly as integrated observation proves.

Exactly one result is also required for every live scenario, security cell,
representative browser matrix cell, observability metric/log/redaction record,
quality gate, and audit/manual-review entry. Manifest schema validates closed
enums, uniqueness, referential links, status derivation, relative paths beneath
the run root, and SHA-256 rehashes.

## Failure, observability, and upstream coverage

Infrastructure failures record command, exit/output, classification and next
action once. Assertion failures are not auto-rerun. Logs and before/after metric
deltas prove latency, outcome, agreement/tariff basis, manual fallback,
replay/conflict and redaction. Missing telemetry is BLOCKED rather than inferred
from API/health.

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, implementing BR-U06-001-032 while
preserving manager, prior-wave, human-gate, and evidence honesty.

