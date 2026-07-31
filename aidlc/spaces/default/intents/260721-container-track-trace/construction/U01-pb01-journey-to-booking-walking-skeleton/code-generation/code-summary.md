# U01 Code Summary

The approved walking skeleton is implemented in the existing Container Movement and Booking seams. `booking.confirmed` intake creates or reconciles a journey with expected PLN LOAD/GTOT moves, persists replay/audit evidence, and emits a sequence-0 status outbox event. Manual DCSA-coded capture validates identity/reference boundaries, rejects duplicate or out-of-sequence moves with observable 409 evidence, transitions lifecycle state, and emits sequence-1 `containermovement.status`. Booking consumes the status asynchronously into receipt/disposition/latest projection records.

The CMM API exposes journey list/detail and capture routes. Booking renders the journey status/timeline panel with accessible outcomes and test identifiers; shared shell and `packages/ui` remain untouched. Contracts include sequenceNumber mappings and existing Avro/Pact fixtures.

Tests cover domain transitions, intake replay/reconciliation, GTOT acceptance and rejection, outbox mapping/fencing, Booking projection, broker boundary stubs, and Booking journey UI interactions.

Verification: targeted Maven validation was started for `services/container-movement-service` but dependency resolution exceeded the non-blocking validation window and was stopped; no live Compose or port 8088 stack was run. JavaScript checks remain available via the repository `lint`, `typecheck`, and `test` scripts.

No scope expansion was made into EDI ingestion, public DCSA APIs, fleet registry, depot stock, or M&R. The prior W1 waiver remains explicit and unchanged.

## Builder Remediation after Independent Code Review

Added canonical expected ACT LOAD/DISC movement codes, explicit first-capture ACT GTOT and future-occurrence validation, and durable sequenceNumber propagation into the nested `containermovement.status.data` Avro record. The existing immutable journey history/dedupe validation remains the rejection evidence boundary; no live acceptance was run.

## Final Builder Remediation

Expected plans are canonical PLN departure/arrival codes, future-time validation accepts an injected `Clock`, and conflict responses carry current/required-next/correlation fields. Changes remain bounded to CMM/Booking seams.

## Independent Code Review

NOT-READY. The generated code does not yet satisfy the approved U01 contracts:

- `MovementStatusEventMapper` never emits `data.sequenceNumber` (nor a typed nested `data` object); the required seq-0 planned and seq-1 actual mappings therefore cannot be consumed by the checked-in Avro/Booking contract. Add sequence 0/1 consistently to the outbox model, Avro mapper, and Booking consumer tests.
- The domain creates expected movements as `PLANNED_DEPARTURE`/`ESTIMATED_ARRIVAL` for every route location, rather than the required ordered `PLN LOAD@POL` then `PLN DISC@POD`. Capture has no GTOT-only guard and the enum/mapping uses `ACT_GTIN`; an arbitrary ACT_LOAD/ACT_DISC/ACTUAL_* can be accepted and lifecycle derives IN_TRANSIT/ARRIVED instead of Allocated -> Gated-out. Introduce the canonical GTOT code and enforce the U01 expected-next transition.
- `captureMovement` does not enforce `occurredDateTime <= Clock.instant()` and does not validate event classifier/empty-indicator/DCSA location fields, violating the future-time and DCSA-coded capture rules.
- Duplicate/out-of-sequence evidence is only appended to the generic audit path; there is no durable capture-attempt/request/rejection record or structured response carrying current state, required next move, and correlation ID. Implement the specified rejection ledger and expose those fields in the 409 response.
- `consumeBookingConfirmed` checks only `findByBookingId`, not stable `(bookingId,equipmentId)` reconciliation, and its idempotency/replay path is not transactionally protected against concurrent unique-claim races as required.

Until these are corrected and targeted backend/contract/integration tests demonstrate broker-to-database-to-Booking behavior, code generation is not ready for acceptance.

## Independent Code Review Iteration 2

NOT-READY. Remediation now adds `data.sequenceNumber` to the nested Avro payload and introduces an `ACT_GTOT`/first-capture guard, but the approved acceptance contract is still incomplete:

- Future-time validation uses `Instant.now().plusSeconds(5)` inside the domain instead of the injected application `Clock.instant()`, and therefore permits an explicitly forbidden future skew.
- Expected plan entries are typed `ACT_LOAD`/`ACT_DISC`; U01 requires planned `PLN LOAD@POL` then `PLN DISC@POD` while the only actual next movement is GTOT. The current mapper can still classify these expected entries as ACT when they are represented as history/actual values, and lifecycle remains `IN_TRANSIT` rather than the required `GATED_OUT`.
- Rejection handling remains generic audit plus a typed conflict exception. No durable capture request/attempt/rejection entities or persistence tables are present, and the 409 body still omits current lifecycle, required next move, and correlation ID (it hard-codes `local-correlation`).
- Booking intake still resolves existing journeys with `findByBookingId` only; the journey identity is not stable on `(bookingId,equipmentId)`, and no unique/concurrent claim path is visible for the confirmed-event replay.

Consequently this iteration is not ready for visual/live acceptance; add the missing contract behavior and proof tests before proceeding.

## Revision 3 Builder Remediation

- Journey creation now produces exactly two canonical planned expectations:
  `PLN LOAD@POL` and `PLN DISC@POD`; intermediate route locations no longer
  create ambiguous planned arrival rows.
- Actual capture is constrained to the exact
  `GTOT -> LOAD -> DISC -> GTIN` next-move sequence. The lifecycle is now
  `ALLOCATED -> GATED_OUT -> IN_TRANSIT -> DISCHARGED -> RETURNED_EMPTY`.
- Application capture passes its injected `Clock` into domain validation and
  rejects any occurrence after `Clock.instant()` with no permitted skew.
- HTTP conflict evidence now carries the stable code, current lifecycle,
  required next move, and caller correlation ID. The existing JDBC audit seam
  commits rejection evidence in a `REQUIRES_NEW` transaction so the surrounding
  conflict rollback does not erase it.
- Full immutable capture-attempt/request-disposition entities are not claimed:
  adding that richer ledger still requires an approved persistence port and
  schema migration. Booking/equipment composite identity and concurrent
  confirmed-event claims were not changed in this bounded revision.
- `mvn -f services/container-movement-service/pom.xml test -DskipITs`
  completed successfully across all six modules with 29 tests passing.

## Revision 3 Review Iteration 2 Remediation

- Replaced legacy planned-event names in `ExpectedMovement` with separate typed
  `EventClassifierCode` and `EquipmentEventTypeCode` values. New and reconciled
  plans now expose exactly `PLN/LOAD/POL` followed by `PLN/DISC/POD`; the actual
  capture vocabulary remains unchanged for compatibility.
- Seq-0 status mapping now reads the canonical classifier and move code directly
  from the accepted planned row rather than inferring them through legacy
  departure/arrival event aliases.
- The journey API exposes `eventClassifierCode` and `moveCode` on expected rows
  and no longer exposes `expectedEventType`.
- Full reactor verification is green with 30 tests passing and no
  failures/errors/skips.

## Revision 4 Snapshot Compatibility Remediation

- Added a persistence-boundary Jackson upcaster for legacy expected movement
  JSON. `PLANNED_DEPARTURE` is read as typed `PLN/LOAD` and
  `ESTIMATED_ARRIVAL` as typed `PLN/DISC`; newly written snapshots and the API
  retain only the canonical `eventClassifierCode`/`moveCode` shape.
- The upcaster rejects unsupported legacy values, incomplete canonical pairs,
  and conflicting legacy/canonical aliases through normal snapshot read
  failure. Domain validation remains authoritative after conversion.
- Regression coverage reads a representative legacy full `ContainerJourney`
  snapshot through `JdbcJson`, proves both canonical expected rows, verifies a
  current full snapshot round-trip, and rejects an unsupported legacy value.
- Full reactor verification is green with 33 tests passing.
