# Code Generation Plan - U01 PB-01 Journey-to-Booking Walking Skeleton

This plan implements US-01/US-02/US-03/US-04/US-06/US-07/US-09 from the
approved `unit-of-work.md`, `requirements.md`, U01 functional/NFR design, and
infrastructure design. It is limited to the existing CMM/Booking seams and
Container Movement pages.

- [x] Step 1: Inventory existing CMM/Booking domain, ports, routes, schemas, migrations, and test conventions; map each change to US-01/02/03/04/06/07/09.
- [x] Step 2: Add additive Flyway/schema changes for journey expected/actual evidence, intake/capture dispositions, status outbox fencing, and Booking receipt/projection sequence support.
- [x] Step 3: Implement framework-free `ContainerJourney` expected-plan/lifecycle transition and DCSA value validation for seq-0 PLN LOAD and seq-1 ACT GTOT.
- [x] Step 4: Implement `booking.confirmed` mapper/listener/intake transaction with reference validation, stable booking/equipment reconciliation, replay disposition, seq-0 outbox, and audit.
- [x] Step 5: Implement GTOT capture transaction, Identity/Reference Data boundaries, idempotency/attempt/rejection evidence, lifecycle Gated-out, and seq-1 status outbox.
- [x] Step 6: Implement fenced outbox relay and Avro/AsyncAPI/Pact `sequenceNumber` contract mapping; preserve at-least-once publication.
- [x] Step 7: Implement Booking status consumer receipt/disposition/latest projection and booking-reference CMM resolver link without synchronous status query.
- [x] Step 8: Add backend unit tests per component (5-8 each under Standard strategy) for journey transitions, intake replay/reconcile, GTOT acceptance, out-of-sequence 409, relay fencing, and Booking projection.
- [x] Step 9: Add integration test stubs for booking.confirmed broker intake, status publication/consumption, database write sets, and one real broker-to-Booking path.
- [x] Step 10: Implement CMM-owned list/detail/timeline/capture routes and UI outcome evidence with `data-testid` attributes; reuse shared shell/primitives and do not edit packages/ui.
- [x] Step 11: Add frontend component/interaction tests for timeline, GTOT success, out-of-sequence rejection, preserved input, loading/error, and accessibility semantics.
- [x] Step 12: Update configuration/examples/docs and test configuration only where required; run linter/type-check/unit checks and produce `code-summary.md`.

## Story Traceability

| Plan steps | Stories |
|---|---|
| 2-4 | US-01 journey creation and expected moves |
| 5, 8 | US-02/03 GTOT and rejection |
| 6-7, 9 | US-06/07 status publication and Booking consumption |
| 10-11 | US-04/US-09 timeline and observable evidence |
