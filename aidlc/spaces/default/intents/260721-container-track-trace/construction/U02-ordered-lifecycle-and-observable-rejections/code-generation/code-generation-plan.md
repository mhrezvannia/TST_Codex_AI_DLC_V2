# Code Generation Plan - U02 Ordered Lifecycle and Observable Rejections

This plan implements the approved U02 unit/story artifacts for lifecycle depth,
observable conflicts, fenced publication, Booking ordering, and CMM-owned UI.

- [x] Step 1: Inventory existing U02/CMM/Booking lifecycle, conflict, relay, receipt, schema, route, and test seams.
- [x] Step 2: Add additive migrations/constraints for movement attempts, rejection evidence, outbox fences, Booking receipt dispositions, sequence and consumer health.
- [x] Step 3: Implement typed DCSA ACT LOAD/DISC/GTIN transitions and lifecycle Allocated -> Gated-out -> In-transit -> Discharged -> Returned-empty.
- [x] Step 4: Implement duplicate occurrence/idempotency and OUT_OF_SEQUENCE_MOVEMENT rejection transactions with exact write sets and 409 contracts.
- [x] Step 5: Implement event-targeted fail-once publisher/Booking consumer seams, due/retry health, and conditional worker/token/version fences.
- [x] Step 6: Implement `containermovement.status` sequence mapping and Booking receipt/DUPLICATE evidence/STALE ordering/strongest projection.
- [x] Step 7: Add backend unit tests (5-8 per component) for transitions, conflicts, fences, receipts, and write-set invariants.
- [x] Step 8: Add integration test stubs for duplicate/out-of-sequence API, retry recovery, ten-delivery ordering, and CMM-to-Booking proof.
- [x] Step 9: Implement CMM timeline/capture/rejection UI states with `data-testid`, preserved input, focus/live-region semantics, and shared primitives only.
- [x] Step 10: Add frontend interaction/accessibility tests and update config/docs; run linter/type-check/unit checks and write `code-summary.md`.

## Story Traceability

| Steps | Stories |
|---|---|
| 2-4, 7 | U02 lifecycle/conflict stories |
| 5-6, 8 | U02 relay and Booking ordering stories |
| 9-10 | U02 timeline and rejection UI stories |
