# Reliability Design - U06 Isolated Acceptance and Preservation

## Run state machine

The append-only ledger transitions `PLANNED -> RUNNING -> PASSED`, `BLOCKED`, or
`FAILED`. Unavailable required capability is BLOCKED; observed nonzero exit,
bound breach, or semantic mismatch is FAILED. Later gates become SKIPPED. The
manifest derives status from ledger/closed sets/hashes and cannot accept a
caller-supplied result. Technical PASSED only permits the later human gate.

## Durable evidence protocol

Every gate writes an exclusive temporary file, flushes/syncs/closes, atomically
renames within its validated directory, reopens/hashes final bytes, then appends
one ledger frame. A frame is `byteLength:canonicalJson:sha256` plus newline.
The file handle is synced after every frame; gate ID plus attempt is unique.

Recovery scans frames to the last complete length/hash boundary and truncates a
torn tail. Registry artifacts not referenced by a valid frame are moved to a
run-local quarantine index and cannot be adopted silently. A valid frame whose
artifact is missing or hash-mismatched finalizes FAILED. Duplicate gate frames
must be byte-identical; divergent duplicates fail.

`manifest.json` is always regenerated from the valid ledger and registry. It is
written/synced as `manifest.<sequence>.<hash>.tmp`, atomically renamed to its
immutable version, then published through synced `manifest.json.tmp` atomic
replacement. Recovery enumerates immutable manifest versions, chooses the
highest sequence whose hash/ledger boundary revalidates, and republishes
`manifest.json`; a torn/missing publication cannot lose committed ledger truth.
Windows directory-sync limitations are handled by enumeration/reconciliation,
not by assuming rename durability. Finalization is idempotent.

## Manager and orchestration recovery

Pre-guard and rendered isolation config must pass before `up`. Every lifecycle,
exec/log/restart/teardown mutation goes through `wave-a-compose.mjs`.
Post-guard/inventory equality is mandatory even after scenario success. Manager
drift is recorded and never auto-repaired.

Polling may retry within its deadline. Assertion failure is not rerun. A later
attempt uses a new run ID and previous-manifest link.

## Data preservation and restore

Migration proof covers empty, exact legacy, partial, and drifted catalogs;
ordered checksums; deterministic LEGACY backfill; immutable approved/history
rows; readable flattened Bookings; and additive typed snapshots. Restart hashes
prove local RPO 0 for U01-U05 authoritative data and exact lost-response replay
without duplicate receipt/case/snapshot/activity/outbox.

Backup restores only into a newly provisioned isolated database. Before any
mutation, the runner generates
`w203_restore_<utcRunId>_<random8>` from a strict lowercase identifier grammar,
asserts the configured host/project is the Wave A owner, queries source name/OID,
proves target name differs and does not exist, then creates it only through
wrapper `exec`. It reconnects and proves a new target OID plus a run-ID owner
marker before restore. Every restore command receives that exact target
explicitly; connection defaults are forbidden.

On failure, wrapper-only cleanup may drop only the exact guarded target after
revalidating name, owner marker, and target OID and proving it is not the source
OID. A failed guard leaves the target untouched and records manual cleanup.
Applied migrations are never edited/down/reset; forward repair is a later
migration. Backup ID, redacted command, source/target identities/hashes, Flyway
history, timing, and authenticated probes are indexed.

## Cross-service consistency

Each scenario uses one safe correlation, but Charge and Booking databases are
queried independently. Agreement, tariff, successor Reprice, no-rate,
ambiguity/outage, Charge-disabled, and Reconfirm assert exact ownership.
No-rate produces one Charge case and no Booking total; outage produces
Booking-local evidence and no case; Reconfirm makes no Charge call.

## Closed preservation and observability

W0-01, W0-02, W1-01, W2-01, and W2-02 each have one result; original W1 waiver
bytes/status remain separate. Missing telemetry is BLOCKED, not inferred.
Before/after metric deltas and safe logs prove latency, outcome, basis, manual,
replay/conflict, and correlation while redaction excludes secrets/commercial
payload.

## Verification and traceability

Failure injection covers crash before/after rename/hash/ledger append, manifest
rehash mismatch, restart/restore interruption, readiness timeout, manager drift,
missing matrix cells, and audit leads. Repeated finalization is idempotent and
cannot turn FAILED/BLOCKED into PASSED.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
