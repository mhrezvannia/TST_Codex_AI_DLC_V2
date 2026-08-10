# Domain Entities - U02 Complete Commercial Request

## Ubiquitous Language

| Term | Meaning |
| --- | --- |
| Booking request | Booking-owned commercial intent at one stable identity and revision; not a physical container assignment |
| Complete request | A request with no missing U02 fact; it is not automatically current-reference validated or confirmation-ready |
| Valid partial draft | A draft whose supplied facts are valid and verified but whose absent required facts are recorded as ordered completeness reasons |
| Governed reference | A committed Reference Data identity resolved by ID/code/version/set/role and active state |
| Accepted reference snapshot | The minimum typed evidence captured for one Booking revision: ID, code, display name, version, status, source, and semantic role where relevant |
| Booking customer | Party in the commercial booking-customer role; distinct from shipper, consignee, and notify party roles |
| Shipper | Required party responsible for presenting the cargo for carriage |
| Consignee | Optional receiving-party role; explicit null when absent |
| Notify party | Optional notification-party role; explicit null when absent |
| Requested departure | Operator-owned POL-local calendar date, distinct from carrier ETD |
| Equipment request | One ISO equipment type and requested count with null physical equipment ID until later assignment |
| Completeness reason | Stable safe code and field path explaining an absent required request fact |
| Current validation | U05 evidence that the exact current revision remains valid against live authorities; distinct from U02 save-time verification |

This language consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. DCSA-aligned concepts are retained where present: booking parties, commodity, package, gross weight, volume, routing, requested departure, voyage, and requested equipment. W3-04's exact published application contract remains the naming authority.

## Entities & Aggregates

### `BookingRequest` aggregate

`BookingRequest` extends the U01 aggregate at one `BookingId`. Its concurrency boundary is `revision`; U02 creates revision `1`. It composes:

- `BookingReference` and lifecycle state `DRAFT`;
- `CommercialParties` with role-specific `PartyReferenceSnapshot` values;
- `CustomerBookingReference`;
- `CargoRequest` with description, commodity, package count/type, gross weight, and optional volume;
- ordered `List<RoutingLeg>` containing one leg in W3-04;
- `RequestedDepartureDate` and `SelectedVoyageSnapshot` from U01;
- ordered `List<EquipmentRequestLine>` containing one line in W3-04;
- fixed `CommercialScope` (`USD`, `FCL_DRY`, non-reefer, non-DG);
- `RequestCompleteness` with ordered reasons;
- the existing U01 operation result/activity relationships.

No authoritative request value is stored only in `Map<String,String>`, JSON attributes, a display label, or a cross-service table.

U02 explicitly generalizes U01's complete PB-01 creation invariant so a stored `DRAFT/INCOMPLETE` can represent missing facts without fabrication. `CommercialParties` has nullable required-role snapshots; required text/value objects are nullable; `RoutingLeg` always exists at sequence 1 but its POL/POD snapshots are nullable; requested departure and selected voyage are nullable; the one `EquipmentRequestLine` always exists but type and quantity are nullable; gross weight is nullable. Optional consignee, notify party, and volume remain nullable by business definition. Fixed commercial scope remains non-null, and physical equipment remains explicit null.

The exact pre-domain `BookingDraftCandidate` mirrors the nullable JSON in `business-logic-model.md`. A builder accepts it only after shape validation. It produces either no aggregate plus field errors, or a `BookingRequest` whose nulls are paired with ordered `CompletenessReason` values. A partially supplied reference tuple or measure object is invalid and never converted to a null aggregate fact.

### Value objects

| Value object | Content and semantics |
| --- | --- |
| `PartyReferenceSnapshot` | `id`, `code`, `displayName`, `version`, `ACTIVE`, `source`, and one `PartyRole`; nullable at a missing draft role |
| `CommodityReferenceSnapshot` | `id`, canonical commodity `code`, `displayName`, `version`, `ACTIVE`, `source` |
| `PackageTypeReferenceSnapshot` | `id`, canonical package-type `code`, `displayName`, `version`, `ACTIVE`, `source` |
| `LocationReferenceSnapshot` | location `id`, `unLocode`, `displayName`, `version`, `ACTIVE`, `source`, and POL/POD role |
| `EquipmentTypeReferenceSnapshot` | ISO equipment type `code`, optional provider identity where supplied by OHS, `displayName`, `version`, `ACTIVE`, `source` |
| `CustomerBookingReference` | normalized NFC printable text, 1..64 Unicode code points when present |
| `CargoDescription` | normalized NFC printable text, 1..500 Unicode code points when present |
| `PackageCount` | integer `1..999999` |
| `DecimalMeasure` | exact positive `BigDecimal`, precision <=18, scale <=3, plus fixed unit |
| `GrossWeight` | `DecimalMeasure` with `KGM`; nullable only in an incomplete draft |
| `Volume` | optional `DecimalMeasure` with `MTQ`; null or complete |
| `RoutingLeg` | sequence plus nullable typed POL/POD snapshots; one ordered slot for W3-04 |
| `SelectedVoyageSnapshot` | nullable as a whole in an incomplete draft; otherwise U01 provider-resolved identity/version/source and explicit nullable derived schedule facts |
| `EquipmentRequestLine` | nullable equipment type snapshot, nullable quantity in incomplete draft, explicit null initial equipment ID |
| `CompletenessReason` | stable `code`, canonical `fieldPath`, `group`, and safe `messageKey` |

The common snapshot fields describe a structural minimum, not a generic runtime entity. Party, commodity, package, location, voyage, and equipment values remain distinct semantic types so roles and invariants cannot be accidentally interchanged.

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Aggregate ID | `BookingId` | `bookingId` (`requirements.md`, Booking OpenAPI) | Application contract | Stable, opaque |
| Human reference | `BookingReference` | `bookingReference` (Booking OpenAPI) | Application contract | Generated by Booking |
| Revision | positive integer | `revision` (Booking OpenAPI) | Application contract | `1` on U02 create |
| Lifecycle | enum | `status` (Booking OpenAPI) | Application contract | `DRAFT` in U02 |
| Booking customer ID | nullable reference ID | `bookingCustomerPartyId` (approved field dictionary) | DCSA Booking party concept | Required for completeness; null in partial draft |
| Booking customer version | nullable opaque string | `bookingCustomerPartyVersion` (U02 canonical command) | Reference Data OHS | Null iff ID null |
| Customer reference | `CustomerBookingReference?` | `customerBookingReference` (approved field dictionary) | DCSA booking reference concept | Null only in partial draft |
| Shipper ID | nullable reference ID | `shipperPartyId` (approved field dictionary) | DCSA party role | Required for completeness; null in partial draft |
| Shipper version | nullable opaque string | `shipperPartyVersion` (U02 canonical command) | Reference Data OHS | Null iff ID null |
| Consignee ID | nullable reference ID | `consigneePartyId` (approved field dictionary) | DCSA party role | Explicit null allowed |
| Consignee version | nullable opaque string | `consigneePartyVersion` (U02 canonical command) | Reference Data OHS | Null iff ID null |
| Notify party ID | nullable reference ID | `notifyPartyId` (approved field dictionary) | DCSA party role | Explicit null allowed |
| Notify party version | nullable opaque string | `notifyPartyVersion` (U02 canonical command) | Reference Data OHS | Null iff ID null |
| Cargo description | `CargoDescription?` | `cargoDescription` (approved field dictionary) | DCSA cargo description concept | Shared multiline UI; null only in partial draft |
| Commodity ID | nullable reference ID | `commodityId` (approved field dictionary) | Reference Data OHS | Required for completeness; null in partial draft |
| Commodity code | nullable canonical string | `commodityCode` (approved field dictionary) | Provider commodity code | Null with absent ID; otherwise match ID/version |
| Commodity version | nullable opaque string | `commodityVersion` (U02 canonical command) | Reference Data OHS | Null iff commodity absent |
| Package count | `PackageCount?` | `packageCount` (approved field dictionary) | DCSA package quantity concept | `1..999999`; null only in partial draft |
| Package type ID | nullable reference ID | `packageTypeId` (approved field dictionary) | Reference Data OHS | Required for completeness; null in partial draft |
| Package type code | nullable canonical string | `packageTypeCode` (approved field dictionary) | UN/ECE recommendation where provider maps it | Null with absent ID; otherwise match provider |
| Package type version | nullable opaque string | `packageTypeVersion` (U02 canonical command) | Reference Data OHS | Null iff package type absent |
| Gross weight | nullable `GrossWeight` | `grossWeight` (approved field dictionary) | DCSA weight concept | Null only in partial draft; otherwise complete object |
| Gross weight value | canonical decimal string / `BigDecimal` | `grossWeight.value` (approved field dictionary) | DCSA weight concept | Positive precision 18, scale <=3 when present |
| Gross weight unit | literal | `grossWeight.unit` (approved field dictionary) | UN/CEFACT unit code | Exactly `KGM` when present |
| Volume | nullable `Volume` | `volume` (approved field dictionary) | DCSA volume concept | Explicit null or complete object |
| Volume value | canonical decimal string / `BigDecimal` | `volume.value` (approved field dictionary) | DCSA volume concept | Positive precision 18, scale <=3 |
| Volume unit | literal | `volume.unit` (approved field dictionary) | UN/CEFACT unit code | Exactly `MTQ` |
| Routing | ordered `List<RoutingLeg>` | `routing[]` (`requirements.md`, Booking contract) | DCSA routing concept | Exactly one leg in W3-04; not flattened |
| Leg sequence | positive integer | `routing[].legSequence` (Booking contract) | Application contract | Exactly `1` |
| POL location ID | nullable reference ID | `routing[].portOfLoadingLocationId` (U02 command) | Reference Data OHS | Required for completeness; null in partial draft |
| POL code | nullable `UnLocode` | `routing[].portOfLoadingUnLocode` (U01 contract) | UN/LOCODE | Null with absent ID; otherwise match version |
| POL version | nullable opaque string | `routing[].portOfLoadingVersion` (U02 command) | Reference Data OHS | Null iff POL absent |
| POD location ID | nullable reference ID | `routing[].portOfDischargeLocationId` (U02 command) | Reference Data OHS | Required for completeness; null in partial draft |
| POD code | nullable `UnLocode` | `routing[].portOfDischargeUnLocode` (U01 contract) | UN/LOCODE | Null with absent ID; otherwise match version |
| POD version | nullable opaque string | `routing[].portOfDischargeVersion` (U02 command) | Reference Data OHS | Null iff POD absent |
| Requested departure | `LocalDate?` | `requestedDepartureDate` (approved field dictionary) | DCSA requested-departure concept | POL-local date; null only in partial draft |
| Selected voyage | nullable `SelectedVoyageSnapshot` | `selectedVoyage` (U01 contract generalized by U02) | Reference Data voyage OHS | Null in partial draft |
| Voyage identity | reference ID | `selectedVoyage.voyageId` (U01 contract) | Reference Data voyage OHS | Required when selected voyage present |
| Voyage version | nullable opaque string | `selectedVoyage.voyageVersion` (U01 contract) | Reference Data voyage OHS | Provider contract may return null |
| Equipment requests | ordered `List<EquipmentRequestLine>` | `equipment[]` (`requirements.md`, confirmed contract) | DCSA equipment request concept | Exactly one line in W3-04 |
| Equipment type | nullable canonical code | `equipment[].equipmentTypeCode` (U01 contract) | ISO 6346 size/type code | Required for completeness; null in partial draft |
| Equipment type version | nullable opaque string | `equipment[].equipmentTypeVersion` (U02 command) | Reference Data OHS | Null iff type absent |
| Equipment quantity | nullable positive integer | `equipment[].quantity` (U01 contract) | Application contract | Null in partial draft; otherwise `1..9999`; demo value `3` |
| Physical equipment | null | `equipment[].equipmentId` (confirmed contract) | ISO 6346 reference when later assigned | Always null on initial request |
| Currency | literal | `currency` (approved scope) | ISO 4217 | Exactly `USD` |
| Cargo mode | literal | `cargoMode` (approved scope) | Application contract | Exactly `FCL_DRY` |
| Reefer indicator | boolean | `reefer` (approved scope) | Application contract | Exactly false |
| Dangerous-goods indicator | boolean | `dangerousGoods` (approved scope) | Application contract | Exactly false |
| Completeness | enum | `requestCompleteness` (Booking projection) | Application contract | `COMPLETE` or `INCOMPLETE` |
| Missing reasons | ordered list | `completenessReasons[]` (Booking projection) | Application contract | Safe code/path/group/message key |

## Contract Fidelity Check

### Approved target contract

The target matches the approved W3-04 field dictionary and preserves routing/equipment arrays. It uses explicit semantic names and typed snapshots. Optional parties and volume are explicit null. Measures travel as strings and persist as exact decimals. The selected voyage retains the U01 typed identity/schedule snapshot. Initial physical equipment remains null.

### Current-code divergence to replace or extend in U02

| Current seam | Divergence | Target treatment |
| --- | --- | --- |
| `BookingDraftFields.customerId` | Legacy alias instead of `bookingCustomerPartyId`; no version/snapshot role | New W3 DTO uses canonical name and typed customer snapshot; compatibility adapter alone may retain alias |
| `BookingDraftFields` lacks party roles | Shipper/consignee/notify absent | Add explicit typed fields and null semantics |
| `BookingDraftFields` lacks cargo/package/measures | Commercial dictionary cannot round-trip | Add value objects and exact projection fields |
| Current commodity handling | Code-only / attributes-oriented seam | Use ID/code/version and typed commodity snapshot |
| Current `ReferenceOption.attributes` | Open provider bag can hide canonical facts | Do not copy into Booking target contract or snapshots |
| Legacy `validateBookingDraft` | Treats most narrow strings as required and validates an equipment ID | Replace/extend with supplied-value validation plus completeness; initial ID must be null |
| Current route fields | Narrow UN/LOCODE strings | Retain U01 canonical codes and add provider identity/version snapshots |
| Current equipment | Code plus legacy physical ID assumptions, often quantity one | One typed request line, quantity `1..9999`, physical ID null |
| Current measure transport | No exact canonical representation | Decimal strings over JSON, `BigDecimal(18,3)` persistence |

No intentional U02 target divergence remains. U04 handles legacy snapshot upcast/backfill without inventing facts; U05 handles current validation. The checked-in `booking.confirmed` Avro remains intentionally narrower and is not expanded with party/cargo payloads.

## Invariants & Validation

1. Booking identity is stable and revision starts at `1` for a U02 create.
2. Supplied text is NFC, outer-trimmed, control-free, within code-point length, and never stored as empty string.
3. Counts are exact bounded integers. Measures are exact positive decimals with fixed units and no floating-point conversion.
4. Optional party ID/version pairs are both null or both present. Volume is null or a complete MTQ measure.
5. Every supplied governed reference is authorized and re-resolved against its correct set/role before commit; an entirely absent tuple remains null and incomplete.
6. Snapshot identity/code/version/status agrees with the submitted selection and provider result; only active choices may be newly accepted.
7. Arrays contain exactly one leg and one equipment line in W3-04. POL and POD must be distinct when both are present.
8. Requested departure remains distinct from provider-derived ETD.
9. Equipment quantity does not create physical equipment. Initial `equipmentId` is null.
10. Fixed currency/mode/indicators cannot be overridden or defaulted from invalid input.
11. Invalid supplied values cause no Booking mutation. Missing required values may create a valid incomplete draft with ordered reasons.
12. Completeness is not lifecycle validation; U05 evidence is required before later actions.
13. Snapshot, projection, reasons, activity, and U01 terminal operation result commit atomically behind the fence.
14. No raw party/cargo payload or generic provider attributes are written to logs, activity, operation diagnostics, or events.

## Lifecycle / State

U02 introduces no new Booking lifecycle transition. Its aggregate remains `DRAFT` and adds orthogonal request-completeness state:

```text
valid supplied facts + missing required facts -> DRAFT / INCOMPLETE
valid supplied facts + no missing U02 facts  -> DRAFT / COMPLETE
invalid or unverifiable supplied fact        -> no aggregate mutation
```

Text fallback: completeness changes only as part of an accepted draft revision; an invalid save does not create a revision. U02 create produces revision `1`; U04 later owns revisioned replacement. U05 may validate only the exact current revision and fingerprint. Confirmation and assignment states are outside U02.

The operation lifecycle remains U01's `IN_PROGRESS`, `SUCCEEDED`, `REJECTED`, `OUTCOME_UNKNOWN`, `NOT_ACCEPTED`, and `EXPIRED` model with stored/effective-state distinction, read-only status Refresh, and signed bounded retry. U02 only expands the canonical payload fingerprint and terminal result content.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from the approved W3-04 field dictionary and contracts (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]: A - all U02 canonical names and semantic roles are confirmed; legacy aliases remain compatibility-only and no open attributes are introduced.`

No unresolved domain-name or value-semantics question remains for U02 Functional Design.

## Upstream Traceability

- `unit-of-work.md`: U02 complete field dictionary, create/reopen boundary, shared dependency, and live DoD.
- `unit-of-work-story-map.md`: US-02 primary and U02 contributions to correction, validation, security, and evidence.
- `requirements.md`: FR-001 through FR-007, canonical contracts, AC-001 through AC-003, and NFR data-integrity/privacy obligations.
- `components.md`: typed BookingRequest aggregate and semantic bounded-context ownership.
- `component-methods.md`: create/read DTO, normalization, completeness, and reference-port method behavior.
- `services.md`: Booking-owned transaction/persistence and Reference Data OHS boundaries.
