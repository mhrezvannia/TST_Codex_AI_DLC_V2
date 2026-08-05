# NFR Design Questions - U03 Agreement Authority

## Decision

No additional human question is open for this unit. The approved NFR inputs
already fix the measurable capacity, contention, recovery, authorization,
compatibility, and topology choices. U01 also fixes the shared Charge database
pool and fail-closed dependency-adapter posture, while U02 fixes the vendor-media
BFF boundary. Re-asking those decisions would create contradictory local
variants rather than clarify U03.

## Binding design inputs

- Use authoritative PostgreSQL reads and DB-backed concurrency; do not add a
  cache, replica, shard, queue, or new deployable.
- Preserve the Charge datasource transaction for commercial rows, activity, and
  outbox enqueue; broker publication remains a separate relay concern.
- Reuse bounded fail-closed Identity and Reference Data adapters with no
  automatic mutation retry or stale commercial fallback.
- Preserve exact legacy/default and W2 vendor-media adapters with no fallthrough.
- Make the existing relay's retry timing configurable and bounded so the
  approved 100-event/120-second recovery proof is achievable; the current
  five-minute retry deferral is not accepted as compliant evidence.

## Ambiguity analysis

The source set contains no unresolved contradiction for artifact generation.
The relay retry timing is an implementation gap, not a product-choice gap: the
approved reliability requirement already determines the required outcome. No
blank `[Answer]:` tag is present because the stage is not waiting for user input.

