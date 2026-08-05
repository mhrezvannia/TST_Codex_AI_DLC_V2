# Reliability Requirements - U01 Booking Draft Skeleton

## Atomicity and Durability

- Booking row/snapshot, command receipt, lifecycle, and audit commit atomically; injected failure at each write boundary leaves none of the effects.
- Same idempotency key/hash replays; changed hash conflicts; concurrent claims produce one logical draft.
- A committed draft remains queryable after two Booking restarts and full browser refresh with no process-local recovery dependency.
- Flyway V1/V2 migration preserves IDs, numbers, status/revision, lifecycle/pricing data and reports stable checksums over two restarts. Automatic baseline-on-migrate is forbidden: a non-empty schema without history is explicitly baselined only after an exact checked-in V1 catalog fingerprint matches; unknown or partial schemas fail before any baseline or migration.

## Recovery Objectives

Within the existing PostgreSQL volume, committed transactions must survive service/container restart and failed transactions leave zero partial effects. Host/volume loss has no zero-RPO claim; restore RPO is the time of the latest captured pre-upgrade dump. Service restart recovery target is <=60 seconds after database health returns. Destructive reset is not recovery evidence and W1 claims no production availability SLA.

Health/readiness distinguish process alive, database/migration ready, and dependency readiness. Detail failures return safe correlation and Retry while never substituting demo data.

## Source Coverage

Reliability scenarios prove U01 `business-logic-model.md`, `business-rules.md`, and restart/migration clauses in `requirements.md` on the PostgreSQL/Spring stack from `technology-stack.md`.
