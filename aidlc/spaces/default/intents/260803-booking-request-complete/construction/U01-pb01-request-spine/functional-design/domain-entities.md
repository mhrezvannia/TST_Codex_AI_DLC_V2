# Domain Entities - U01 PB-01 Request Spine

## Ubiquitous Language

| Term | Meaning in U01 | Standards/authority alignment |
| --- | --- | --- |
| Booking | Booking-owned aggregate and stable commercial request identity. | Existing Booking bounded context. |
| Request spine | The minimum truthful PB-01 request persisted by U01: route, requested departure, selected-voyage evidence and requested equipment. | U01 slice of the approved W3-04 field dictionary. |
| Draft | A saved, reopenable Booking that may be incomplete and is not validated, priced or confirmed. | DCSA-aligned booking-request lifecycle concept; Booking state authority. |
| Requested departure | Operator-entered POL-local calendar-date preference. | Booking/customer authority; distinct from carrier ETD. |
| Selected voyage snapshot | Governed evidence captured from the live route-compatible voyage authority at selection/save time. | Reference Data/Carrier authority; Booking stores evidence, not the master. |
| Equipment request | Commercial demand for an ISO equipment type and quantity, without physical assignment. | DCSA-aligned requested equipment; ISO 6346 type code. |
| Operation identity | Opaque client-generated UUID that binds one command, its payload fingerprint, actor scope and recoverable result. | Booking idempotency/recovery authority. |
| Outcome unknown | Acceptance or commit cannot be proven at the client boundary. | Requires status Refresh, never blind resubmission. |
| Current snapshot | Explicit typed representation written for new U01 records. | Additive Booking persistence; pre-W3 evolution remains U04. |

## Entities & Aggregates

### `Booking` aggregate root

- Identity: `BookingId` (`bookingId`).
- Immutable lineage: booking reference, creation timestamp and originating actor scope.
- Version: positive `BookingRevision`; initial U01 value is `1`.
- Lifecycle: `DRAFT` only in U01.
- Composes one `BookingRequestSpine` and safe lifecycle activity.
- Enforces that an initial equipment request contains no physical `equipmentId`.

### `BookingRequestSpine` value object

- Composes an ordered non-empty `List<RoutingLeg>`, one `RequestedDeparture`, one mandatory `SelectedVoyageSnapshot`, and one `EquipmentRequestLine`.
- Preserves requested and derived schedule facts separately.
- Is explicit in the current snapshot; it is not hidden in an attributes bag.
- Existing customer/fixed-scope compatibility values may accompany the aggregate, but the complete U02 party/cargo/packaging model is outside this unit.

### `RoutingLeg` value object

- Contains `portOfLoadingUnLocode` and `portOfDischargeUnLocode`.
- Both values are syntactically valid UN/LOCODEs and distinct.
- Retains the DCSA-aligned ordered `routing[]` shape. U01 requires exactly one direct leg; multi-leg/transshipment is outside scope, but the model is not flattened to a scalar route.

### `RequestedDeparture` value object

- Contains `requestedDepartureDate` as `LocalDate` and the POL context used to interpret it.
- It is never derived from or overwritten by carrier ETD.

### `SelectedVoyageSnapshot` value object

- Identity/provenance: mandatory `voyageId` and source, plus nullable `voyageVersion` when not supplied by the current seam.
- Derived evidence: carrier voyage number and four schedule instants when available.
- U01 permits missing derived facts and marks the request truthfully incomplete. U03 later owns complete authority-state classification and recovery.
- All derived fields are read-only in Booking UI/domain commands.

### `EquipmentRequestLine` value object

- Contains canonical `equipmentTypeCode`, positive integer `quantity`, and nullable `equipmentId`.
- U01 has exactly one line. PB-01 evidence uses quantity `3` and null ID.
- Quantity is commercial demand and never expanded into synthetic physical-equipment entities.

### `BookingOperation` aggregate/entity

- Identity: opaque `OperationId` UUID, usable before `bookingId` exists.
- Binds operation type, actor/tenant scope, normalized payload fingerprint, nullable booking/revisions, state, recovery, correlation and timestamps.
- Claim execution is fenced by opaque `ownerToken`, monotonically increasing `claimVersion`, `leaseUntil`, and bounded `attempt`.
- Same identity and fingerprint returns the recorded result; a different fingerprint is an idempotency conflict.
- The status projection is privacy-shaped and authorizes before disclosure.

### Relationships

| From | Cardinality | To | Constraint |
| --- | --- | --- | --- |
| `Booking` | 1 | `BookingRequestSpine` | Owned immutable-at-revision value tree |
| `BookingRequestSpine` | 1..* ordered | `RoutingLeg` | Exactly one direct leg in U01; array shape retained |
| `BookingRequestSpine` | 1 | `RequestedDeparture` | Operator authority |
| `BookingRequestSpine` | 1 | `SelectedVoyageSnapshot` | Voyage identity/source required; derived evidence may be incomplete, never guessed |
| `BookingRequestSpine` | 1 | `EquipmentRequestLine` | Exactly one requested line in W3-04 |
| `BookingOperation` | 0..1 | `Booking` | Null before/without a committed create; stable after success |

## Field-Level Schema (canonical names)

The public/domain names below follow the approved `requirements.md` field dictionary. Internal evidence fields are explicitly identified. Public DTOs, shell/BFF payloads, domain value objects and current persistence must map without semantic renaming.

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Booking identity | `BookingId` | `bookingId` (Booking contract) | Booking-owned | Stable opaque identifier. |
| Booking reference | `BookingReference` | `bookingReference` (Booking projection) | Booking-owned | Current code calls this `bookingNumber`; adapter mapping must be explicit. |
| Revision | `BookingRevision` | `revision` (Booking contract) | Booking-owned optimistic revision | Initial U01 value `1`. |
| Lifecycle state | `BookingStatus` | `status` (Booking contract) | Booking-owned | `DRAFT` in U01. |
| Port of loading | `UnLocode` within `RoutingLeg` | `routing[].portOfLoadingUnLocode` (`requirements.md`) | UN/LOCODE | Current code uses `routing[].loadUnLocode`; mapping divergence is listed below. |
| Port of discharge | `UnLocode` within `RoutingLeg` | `routing[].portOfDischargeUnLocode` (`requirements.md`) | UN/LOCODE | Must differ from POL. Current code uses `routing[].dischargeUnLocode`. |
| Requested departure | `RequestedDeparture(LocalDate, PolContext)` | `requestedDepartureDate` (`requirements.md`) | ISO 8601 local date | Operator authority; currently stored in `attributes`. |
| Voyage identity | `VoyageId` | `voyageId` (`requirements.md`) | Reference Data Voyage | Required selected candidate for PB-01 proof. |
| Voyage version | `ReferenceVersion` | `voyageVersion` (`requirements.md`) | Reference Data version | Nullable only when the live U01 seam cannot yet supply it; incompleteness remains explicit. |
| Voyage source | `ReferenceSource` | `voyageSource` (internal governed evidence) | Reference Data provenance | Minimum provider/source identifier; not customer input. |
| Carrier voyage number | `CarrierVoyageNumber` | `carrierVoyageNumber` (`requirements.md`) | Carrier/Reference Data | Derived, read-only. |
| Estimated departure | `Instant` | `estimatedDepartureAt` (`requirements.md`) | ISO 8601 instant | Derived, timezone-aware. |
| Estimated arrival | `Instant` | `estimatedArrivalAt` (`requirements.md`) | ISO 8601 instant | Derived, timezone-aware. |
| Cargo cutoff | `Instant` | `cargoCutoffAt` (`requirements.md`) | ISO 8601 instant | Derived, timezone-aware. |
| Documentation deadline | `Instant` | `documentationDeadlineAt` (`requirements.md`) | ISO 8601 instant | Derived, timezone-aware. |
| Equipment type | `EquipmentTypeCode` | `equipmentTypeCode` (`requirements.md`) | ISO 6346 size/type code | Active canonical FCL-dry type. |
| Requested quantity | `EquipmentQuantity` | `quantity` (`requirements.md`) | DCSA-aligned equipment count | Integer `1..9999`; PB-01 uses `3`. |
| Physical equipment ID | `EquipmentReference?` | `equipmentId` (`requirements.md`) | ISO 6346 | Must be null at initial draft; no form control. |
| Currency | `CurrencyCode` | `currency` (`requirements.md`) | ISO 4217 | Fixed `USD` in W3-04. |
| Cargo mode | `CargoMode` | `cargoMode` (Booking contract) | Booking-owned | Fixed `FCL_DRY`. |
| Reefer indicator | `boolean` | `reefer` (Booking contract) | Booking-owned | Fixed false. |
| Dangerous-goods indicator | `boolean` | `dangerousGoods` (Booking contract) | Booking-owned | Fixed false. |
| Operation identity | `OperationId(UUID)` | `operationId` (`component-methods.md`) | Booking-owned | Also command idempotency key. |
| Operation type | `OperationType` | `operationType` (`component-methods.md`) | Booking-owned | `CREATE_DRAFT` in U01. |
| Actor/tenant scope | `ActorScope` | internal `actorSubjectId`, `tenantId` | Identity/Booking policy | Never exposed beyond authorized safe status. |
| Payload fingerprint | `RequestFingerprint` | internal `requestFingerprint` | Booking-owned | Hash of canonical normalized command, not raw payload. |
| Claim owner | `OpaqueClaimToken` | internal `ownerToken` | Booking-owned | Random execution-fencing token; never returned by status. |
| Claim version | positive integer | internal `claimVersion` | Booking-owned | Monotonic CAS/fencing version. |
| Claim lease | `Instant` | internal `leaseUntil` | Booking-owned | Bounds ownership; stale owners cannot commit. |
| Attempt | positive integer | internal `attempt` | Booking-owned | Initial attempt plus at most one explicit same-identity retry in U01. |
| Operation booking | `BookingId?` | `bookingId` (operation status contract) | Booking-owned | Null until/no successful create. |
| Requested revision | `BookingRevision?` | `requestedRevision` (operation status contract) | Booking-owned | Null for initial create. |
| Committed revision | `BookingRevision?` | `committedRevision` (operation status contract) | Booking-owned | `1` after success. |
| Stored operation state | `OperationState` | internal `storedState` | Booking-owned | Changed only by fenced command/reconciliation transactions. |
| Effective operation state | `OperationState` | `state` (operation status contract) | Booking-owned | Read projection; may derive `NOT_ACCEPTED` from expired fenced `IN_PROGRESS` without mutation. |
| Terminal flag | `boolean` | `terminal` (operation status contract) | Booking-owned | Derived consistently from state. |
| Recovery | `OperationRecovery` | `recovery` (operation status contract) | Booking-owned | Server-authoritative action. |
| Retry eligibility | `boolean` | `retryEligible` (operation status contract) | Booking-owned | True only with proof of non-acceptance. |
| Expected claim version | positive integer? | `expectedClaimVersion` (status/retry contract) | Booking-owned | Returned only when retry is eligible; binds reclaim CAS. |
| Retry grant | opaque signed token? | `retryGrant` (status/retry contract) | Booking-owned | Read-only derived, short-lived, scope/type/fingerprint/version-bound; not persisted and contains no payload. |
| Safe result | `SafeResultReference?` | `resultReference`, `code` (operation status contract) | Booking-owned | No raw protected payload. |
| Correlation | `CorrelationId` | `correlationId` (cross-service contract) | LinerCore observability | Safe support reference. |
| Operation timestamps | `Instant` | `updatedAt`, `expiresAt` (operation status contract) | ISO 8601 instant | Expiry never implies retry safety. |

## Contract Fidelity Check

### Target contract alignment

The target U01 entity matches the approved W3-04 dictionary for ordered `routing[]`, requested date, voyage identity/version, all five derived voyage facts, equipment type, quantity and nullable equipment ID. It also implements the approved unified operation-status fields from `component-methods.md`. There is no intentional scalar flattening of route legs or equipment quantity into physical assignments and no attributes bag for new authoritative facts.

### Current-code divergences to close in U01

| Current shape observed in the code graph | Target U01 shape | Required treatment |
| --- | --- | --- |
| Shell submits to `/api/booking/bookings`. | `/api/booking/bookings/drafts` is the only new W3-04 create path. | Add canonical route and leave legacy create unchanged until U08. |
| Current shell hardcodes equipment `quantity: 1`. | `quantity` is user/request value; PB-01 evidence is `3`. | Add typed field/value object and exact round-trip. |
| Current shell exposes `equipmentId` input. | Initial `equipmentId` is null with no create control. | Remove from U01 create composition; persist null. |
| `requestedDepartureDate` is stored in `attributes`. | Explicit typed `RequestedDeparture`. | Map to typed current snapshot/projection. |
| Current `RoutingLeg` names are `loadUnLocode`/`dischargeUnLocode`. | Approved canonical names are `portOfLoadingUnLocode`/`portOfDischargeUnLocode`. | Use explicit adapter mapping; do not leak inconsistent semantics across new W3-04 contracts. |
| Current request carries `voyageId` only. | Governed identity/version/source plus available carrier number and four schedule instants. | Extend typed request/snapshot with provider-derived evidence. |
| Current `CreateBookingCommand` carries an open `attributes` map. | Explicit U01 command/value objects plus fingerprint. | Do not place new U01 authority in the map. |
| Current idempotency receipt records completion by key/revision but has no unified pre-booking operation status contract. | `BookingOperation` supports read-only status by operation UUID before booking ID. | Add operation journal/status projection without duplicating create. |
| Current save response navigates with `?created=1`. | Canonical `?tab=overview` plus one-time accessible status announcement. | Treat announcement as navigation/session state, not persistent query truth. |

### Deferred divergence

Pre-W3 snapshot upcast/backfill, migration ledger, restart/baseline behavior and same-record correction remain U04. The complete U02 party/cargo/packaging field schema and full U03 schedule authority-state matrix are intentionally absent from this U01 entity. No published field is renamed as part of that deferral.

## Invariants & Validation

1. `bookingId`, booking reference and creation lineage do not change after creation.
2. Revision is positive and U01 create commits revision `1` exactly once.
3. `routing[]` is ordered and non-empty; U01 contains exactly one leg whose `portOfLoadingUnLocode` and `portOfDischargeUnLocode` are valid, distinct UN/LOCODE values.
4. `requestedDepartureDate` is a valid POL-local `LocalDate` and never derives from ETD.
5. A selected voyage identity must match the route-compatible candidate committed by the user.
6. `SelectedVoyageSnapshot`, `voyageId`, and source are mandatory for U01; provider version and derived facts may be absent only when the authority did not supply them.
7. Any captured schedule instant or carrier number comes from the selected voyage authority and is read-only.
8. Missing provider-derived voyage facts remain null/absent and produce explicit incompleteness; they are never guessed.
9. When all schedule facts are present, `estimatedDepartureAt < estimatedArrivalAt`, and cutoff/deadline precede ETD. U03 owns the complete failure classification, but U01 must not persist knowingly contradictory facts as confirmation-grade.
10. `quantity` is an integer in `1..9999`; PB-01 acceptance evidence uses `3`.
11. Initial `equipmentId` is null regardless of quantity.
12. Fixed W3-04 values are USD, FCL dry, non-reefer and non-DG.
13. New U01 authoritative values are explicit typed fields, not attributes-map entries.
14. `operationId` is a valid globally unique UUID; actor/tenant scope and operation type are immutable authorization bindings on that row.
15. One operation identity binds one operation type and one normalized payload fingerprint.
16. A worker may commit only while its owner token/version/state and lease match the locked journal row.
17. `SUCCEEDED` create has non-null `bookingId` and `committedRevision`; `IN_PROGRESS` may not claim a committed result.
18. `retryEligible=true` is valid only after the active lease expires, no terminal/booking result exists, and a stale worker is fenced.
19. An eligible response includes the current expected claim version and a valid signed retry grant; reclaim requires both and the original request fingerprint.
20. Status lookup performs policy/scope authorization before exposing any result and performs no stored-state transition.

Live Reference Data validation is required for authoritative voyage/route/equipment evidence. When that live evidence is unavailable, the draft may preserve truthful partial facts, but the missing evidence cannot be labeled valid or confirmation-grade.

## Lifecycle / State

### Booking lifecycle in U01

| From | Command/event | To | Effects |
| --- | --- | --- | --- |
| Nonexistent | Authorized unique create / `BOOKING_DRAFT_CREATED` | `DRAFT` revision `1` | Persist typed request spine, projection, safe activity and successful operation result |
| `DRAFT` | Reopen/query | `DRAFT` unchanged | Read-only privacy-shaped projection |

No U01 transition reaches validated, priced or confirmed state.

### Create-operation lifecycle

| From | Trigger | To | Permitted recovery |
| --- | --- | --- | --- |
| Nonexistent | Authorized claim | `IN_PROGRESS` | Refresh status only while acceptance is unresolved |
| `IN_PROGRESS` | Atomic create commit | `SUCCEEDED` | Inspect canonical booking |
| `IN_PROGRESS` | Deterministic validation/policy rejection | `REJECTED` | Recorded correction/safe terminal action |
| `IN_PROGRESS` | Booking-owned downstream acceptance cannot be determined | `OUTCOME_UNKNOWN` | Refresh status only |
| stored `IN_PROGRESS` | Lease expired, no result/booking, stale owner fenced (read projection) | effective `NOT_ACCEPTED`; stored state unchanged | Signed-grant Retry may be offered |
| `IN_PROGRESS` | Command/reconciler proves no acceptance/effect | stored `NOT_ACCEPTED` | Dedicated same-identity Retry once with signed grant |
| Any nonterminal | Retention expiry without provable result | `EXPIRED` | Inspect/manual resolution; no blind retry |
| Any state | Same identity/same fingerprint replay | Unchanged | Return recorded state/result |
| Any state | Same identity/different fingerprint | Unchanged | `IDEMPOTENCY_CONFLICT`; no mutation |

A BFF/client timeout does not perform the `OUTCOME_UNKNOWN` transition. It creates only local presentation state and then reads the Booking-owned journal. Claim transaction C1 inserts/claims stored `IN_PROGRESS`; fenced transaction C2 atomically writes the Booking and stored `SUCCEEDED` result. A read may project effective `NOT_ACCEPTED` from an expired, result-free claim without persisting a transition. Reclaim is compare-and-set only through the dedicated retry command with expected version and signed grant, never through status Refresh or an ordinary delayed draft POST.

## Persistence Shape

- The Booking current snapshot stores the explicit value-object tree and snapshot version marker used by the current writer.
- The additive query projection stores only approved searchable/list/detail columns plus the canonical snapshot, without replacing the snapshot as aggregate authority.
- The operation journal is independently addressable by globally unique `operationId` because an uncertain create may have no known booking ID.
- Claim transaction C1 commits the fenced `IN_PROGRESS` row before bounded provider work. Successful result transaction C2 locks/fences that row and commits the Booking plus terminal result atomically.
- If C2 rolls back, no Booking or terminal result exists. An expired claimant cannot later commit because owner token/version/lease checks fail.
- The status adapter may derive effective `NOT_ACCEPTED`, `expectedClaimVersion` and a signed retry grant without a write. The dedicated retry adapter validates the grant and original canonical request before the repository CAS.
- Existing pre-W3 rows are not rewritten or backfilled by U01.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All U01 canonical names are confirmed from the approved W3-04 field dictionary and Application Design operation contract (approved).
   - B. Some names need a domain-expert decision.
   - X. Other.
   - `[Answer]: A - no unresolved U01 field-name dispute. Internal provenance and operation fields are explicitly marked as Booking evidence rather than public DCSA fields.`

## Upstream Traceability

- `unit-of-work.md`: U01 request-spine entity boundary and live round-trip outcome.
- `unit-of-work-story-map.md`: US-01 primary entity/identity requirements and cross-cutting constraints.
- `requirements.md`: approved canonical field dictionary, FR-005, FR-008 through FR-010, NFR-002, NFR-003 and NFR-006.
- `components.md`: typed `BookingRequest`, operation journal, voyage port and additive projection.
- `component-methods.md`: create/status/detail/voyage command and response shapes.
- `services.md`: Booking ownership, Reference Data authority and local transaction boundary.
