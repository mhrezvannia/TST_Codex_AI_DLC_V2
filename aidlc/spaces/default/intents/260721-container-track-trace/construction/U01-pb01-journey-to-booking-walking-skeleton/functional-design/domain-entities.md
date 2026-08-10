<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces contract/DCSA field fidelity and typed value objects. -->

# Domain Entities - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

The model specializes U01 from `unit-of-work.md` and
`unit-of-work-story-map.md`, uses canonical fields from `requirements.md`, and
implements `components.md`, `component-methods.md`, and `services.md` without
expanding beyond the walking skeleton.

## Ubiquitous Language

- **Container journey:** CMM aggregate for one confirmed booking revision and one assigned equipment reference.
- **Expected movement:** ordered planned LOAD@POL or DISC@POD.
- **Actual movement:** accepted DCSA equipment event; U01 exercises ACT GTOT only.
- **Lifecycle:** U01 exercises Allocated -> Gated-out; later states remain typed but unexercised until U02.
- **Capture attempt/request disposition:** append-only invocation evidence and immutable idempotency decision.
- **Status receipt/projection:** Booking-owned durable consumption fact and latest per-container view.

## Entities & Aggregates

`ContainerJourney` is the aggregate root identified by `JourneyId`, looked up
by stable `(BookingId, EquipmentReference)` with monotonic `BookingRevision`,
and composes ordered `ExpectedMovement` values, accepted
`EquipmentMovement` history, `JourneyLifecycle`, and `nextMovementCode`. All
state changes go through `createFromConfirmedBooking`, `reconcile`, or `capture`.

Separate persistence entities retain `BookingIntakeReceipt`,
`CaptureRequestDisposition`, `CaptureAttemptEvidence`, `MovementRejection`,
`AuditRecord`, and `StatusOutboxEntry`; they are transaction participants, not
children callers may mutate through the aggregate. Booking owns
`MovementStatusReceipt` and `LatestContainerStatusProjection`.

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| journey identity | `JourneyId` | API/internal only; status uses nullable `data.movementId` | LinerCore | Stable CMM route identity, not an Avro field |
| booking identity | `BookingId` | `data.bookingId` input -> `data.bookingRef` status | LinerCore contracts | Stable aggregate-key part |
| booking revision | `BookingRevision` | `data.bookingRevision` input | LinerCore contract | Monotonic state, not identity |
| routing | `List<RoutingLeg>` | `data.routing[]` with `legSequence/loadUnLocode/dischargeUnLocode/voyageId` | Booking contract/UN LOCODE | U01 requires exactly one leg |
| equipment | `EquipmentReference` | `data.equipment[].equipmentId` input -> `data.containerRef` status | ISO 6346/contracts | One assignment, quantity 1, non-null ID |
| equipment type/quantity | typed code/int | `data.equipment[].equipmentTypeCode/quantity` | Booking contract | supported type, quantity 1 |
| event classifier | `EventClassifierCode` | `eventClassifierCode` | DCSA T&T | U01 ACT for actual, PLN for seq-0 planned |
| movement code | `EquipmentEventTypeCode` | `moveCode` | DCSA T&T | U01 GTOT actual; expected LOAD/DISC |
| load state | `EmptyIndicatorCode` | `emptyIndicatorCode` | DCSA | LADEN for GTOT/LOAD/DISC |
| movement ID | `MovementId?` | `data.movementId` | Status contract | null for PLN seq-0, actual ID for GTOT |
| location | `MovementLocation` | `data.location.unLocationCode/facilityCode/facilityTypeCode` | UN/LOCODE/status contract | facility fields optional |
| occurrence time | `Instant` | `data.occurredDateTime` | DCSA/status contract | UTC instant; distinct from received time |
| received time | `Instant` | `data.receivedDateTime` | Status contract | broker/application receipt time |
| sequence | `MovementSequence` backed by Java `int` / PostgreSQL `integer` | `data.sequenceNumber` Avro `int` | LinerCore v1 additive | Default 0; non-negative; actuals 1-4 |
| lifecycle | `JourneyLifecycle` | `data.derivedStatus` | LinerCore status contract | ALLOCATED/GATED_OUT in U01 |
| transshipment | boolean | `data.transshipment` | Status contract | false in one-leg U01 |
| correlation | `CorrelationId` | `correlationId` | LinerCore envelope | Stable across broker/DB/API/UI evidence |
| idempotency | `IdempotencyKey` | `idempotencyKey` | CMM REST | Immutable request disposition identity |

## Contract Fidelity Check

The checked-in Avro names are explicit in the table. U01 adds
`data.sequenceNumber` using the approved executable integer type with default
0 and updates Avro, AsyncAPI, Pact, examples, generated models, and both mappers
together. Seq-0 is PLN LOAD/ALLOCATED/LADEN/POL with null movement ID and false
transshipment; seq-1 is ACT GTOT/GATED_OUT/LADEN with actual ID/location and
false transshipment. Current generic/hard-coded mapper aliases are divergences
to remove. Target contract divergence is zero; no public DCSA API is added.

## Invariants & Validation

- One journey per stable booking/equipment reconciliation key; revision is monotonic aggregate state.
- Exactly two ordered expected moves: LOAD@POL then DISC@POD.
- New journey is Allocated; GTOT is the next actual code.
- Only canonical ISO 6346 equipment and active UN/LOCODE references enter the domain.
- Actual U01 movement is GTOT + ACT + LADEN; occurrence time is valid UTC and `occurredDateTime <= injected Clock.instant()`.
- Movement sequence is monotonic and allocated transactionally; seq-0 is never an accepted actual.
- Rejection cannot mutate accepted aggregate state or create a status outbox row.

## Lifecycle / State

| Current | Command | Required values | Next | Event/result |
| --- | --- | --- | --- | --- |
| none | valid confirmed booking | one equipment, one active POL/POD leg | Allocated | Journey created, plan stored, seq-0 PLN status |
| Allocated | capture GTOT | ACT, LADEN, canonical location/equipment/time | Gated-out | MovementAccepted seq-1 + status |
| Gated-out | capture DISC | DISC while LOAD required | Gated-out | MovementRejected `OUT_OF_SEQUENCE_MOVEMENT`; accepted state unchanged |

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]:` A. All canonical names above are confirmed from the checked-in contracts; `sequenceNumber` is the explicit additive change.
