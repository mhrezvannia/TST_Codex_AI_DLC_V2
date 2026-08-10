# Functional Design Questions - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

These questions specialize `unit-of-work.md`, `unit-of-work-story-map.md`,
`requirements.md`, application `components.md`, `component-methods.md`, and
`services.md` for U01 only.

## Q1 - Booking Intake and Reconciliation

- A. Key receipt/journey reconciliation by event ID plus booking/revision/container identity; validate envelope, assignment, route, and references before one atomic create/reconcile transaction (recommended).
- B. Create a new journey on every delivery.
- C. Trust payload strings without Reference Data validation.
- X. Other.
- `[Answer]:` A. Key receipt/journey reconciliation by event and business identity (recommended).

## Q2 - Journey Creation Outcome

- A. Persist Allocated snapshot, ordered expected LOAD@POL/DISC@POD, seq-0 PLN LOAD status outbox, intake receipt/outcome, and audit atomically (recommended).
- B. Persist journey first and add plan/status later.
- C. Publish synchronously before commit.
- X. Other.
- `[Answer]:` A. Persist journey/plan/seq-0 receipt/audit/outbox atomically (recommended).

## Q3 - Migration and Forward Repair

- A. U01 owns ordered Flyway baseline/additive migrations, deterministic backfill/checks, restart verification, and an executable idempotent forward-repair command/path (recommended).
- B. Replace schema with a destructive reset.
- C. Defer migrations to U03.
- X. Other.
- `[Answer]:` A. U01 owns additive migration, backfill, restart, and executable forward repair (recommended).

## Q4 - First GTOT Capture

- A. Authenticate/map at REST, authorize in the application service, validate typed ACT GTOT/LADEN/location/equipment/time, then commit attempt/request/movement/snapshot/audit/outbox atomically (recommended).
- B. Authorize in the browser only.
- C. Update journey and publish before evidence rows.
- X. Other.
- `[Answer]:` A. Application authorization plus typed validation and one atomic accepted write (recommended).

## Q5 - U01 Conflict Behavior

- A. DISC-after-GTOT returns HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT` with LOAD-next/current-state/correlation evidence, preserves input, appends attempt/rejection/audit only, and emits no status (recommended).
- B. Throw a generic 500.
- C. Silently ignore it.
- X. Other.
- `[Answer]:` A. Exact HTTP 409 out-of-sequence result and rejection-only evidence (recommended).

## Q6 - Booking Projection Ordering

- A. Durable receipt first; positive sequence dominates; sequence 0 uses existing occurrence/classifier fallback; update latest projection only for stronger assigned-container status (recommended).
- B. Query CMM synchronously from Booking.
- C. Store the full CMM timeline in Booking.
- X. Other.
- `[Answer]:` A. Durable receipt with positive-sequence ordering and legacy fallback (recommended).

## Q7 - Frontend Composition

- A. Server-first CMM list/detail reads plus focused client capture form; shared-shell/@erp-ui composition, explicit loading/empty/error/denied/pending/success/rejection states, no global store (recommended).
- B. Build a standalone workbench outside the shell.
- C. Add RTK/global store and redesign shared primitives.
- X. Other.
- `[Answer]:` A. Server-first shared-shell composition with focused local capture state (recommended).

## Ambiguity Check

- `[Answer]:` No ambiguity: choices match the approved application contracts and U01 boundary.
