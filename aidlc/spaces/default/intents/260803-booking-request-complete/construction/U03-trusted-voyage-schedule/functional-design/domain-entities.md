# Domain Entities - U03 Trusted Voyage Schedule

## Ubiquitous Language

| Term | Meaning |
| --- | --- |
| Requested departure | Operator-owned calendar date interpreted in the accepted POL timezone |
| Carrier ETD/ETA | Provider-derived offset-aware estimated departure/arrival instants; never user input |
| Cargo cutoff | Provider-derived last acceptable cargo instant before ETD |
| Documentation deadline | Provider-derived document deadline instant before ETD |
| Confirmation-grade schedule | Active route-compatible voyage with all five facts, valid timezone, and strict temporal ordering |
| Schedule snapshot | Booking's immutable accepted-revision evidence from Reference Data, not master ownership |
| Variance | Signed calendar-day difference between requested departure and ETD in the POL IANA zone |
| Partial schedule | Verified voyage/route with one or more explicit null schedule facts |
| Temporally inconsistent schedule | Verified voyage/route whose present facts violate offset/zone or strict ordering rules |
| Live candidate status | Non-persisted query result used for selection/Refresh; never a silent aggregate update |

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. DCSA-aligned booking/voyage/schedule concepts are used where applicable; the approved W3-04 Booking and Reference Data contracts remain canonical.

## Entities & Aggregates

### `BookingRequest` aggregate extension

U03 enriches the existing `BookingRequest` aggregate with one nullable `SelectedVoyageSnapshot`. When selected, the snapshot composes:

- `VoyageReference` (`voyageId`, required nonblank opaque provider version for every newly accepted U03 snapshot, source, active-at-acceptance status);
- verified origin/destination identities, UN/LOCODEs, versions, and POL IANA timezone;
- `CarrierVoyageNumber?`;
- four nullable `ScheduleMilestone` values;
- `ScheduleClassification`;
- ordered missing facts and reason codes;
- nullable `RequestedDepartureVarianceDays`.

The aggregate still owns the requested departure separately. It does not own the voyage master or mutate on passive provider queries.

A legacy U01 snapshot may deserialize with a null version for read compatibility only. It carries `VOYAGE_VERSION_MISSING` outside the three-state schedule-classification algorithm, cannot satisfy current authority or confirmation, and cannot be copied into a later revision. U04 upgrades it only by successful nonblank-version re-resolution; U05 reports the same reason while it remains legacy.

### `ScheduleMilestone`

`ScheduleMilestone` is an immutable value object containing:

- `canonicalOffsetDateTime: String` in strict RFC 3339 canonical form;
- `offsetDateTime: OffsetDateTime`;
- `instant: Instant` for ordering and persistence/query support.

Equality for accepted snapshot fidelity includes canonical offset text and instant. Two different offsets for the same instant are not silently collapsed because the provider offset is visible provenance.

### `VoyageScheduleCandidate`

This anti-corruption value is returned by `VoyageSchedulePort`; it is not an aggregate. It contains typed identity/version/status/source, typed route/location/timezone, and nullable facts. Booking validates and converts it into a snapshot. No `Map<String,String> attributes` crosses the port.

### `ScheduleAuthorityObservation`

A query-only view describing live `CURRENT`, `STALE`, `INACTIVE`, `ROUTE_MISMATCH`, `NOT_FOUND`, `UNAVAILABLE`, or `CONTRACT_ERROR` status against a persisted or transient selection. It carries safe correlation/recovery and cannot be saved through a query method.

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Requested departure | nullable `LocalDate` | `requestedDepartureDate` (`requirements.md`) | DCSA requested-departure concept | POL-local user authority |
| Selected snapshot | nullable `SelectedVoyageSnapshot` | `request.selectedVoyageSnapshot` (U01 Booking response) | Application contract | Property retained without rename |
| Voyage identity | reference ID | `selectedVoyageSnapshot.voyageId` | Reference Data OHS | Required when snapshot present |
| Voyage version | nonblank opaque string for U03 acceptance; nullable only for legacy read | `selectedVoyageSnapshot.voyageVersion` | Reference Data OHS | Null yields `VOYAGE_VERSION_MISSING`; cannot be newly accepted or carried forward |
| Voyage source | nonblank string | `selectedVoyageSnapshot.voyageSource` | Reference Data OHS | e.g. `reference-data` |
| Carrier voyage number | nullable `CarrierVoyageNumber` | `selectedVoyageSnapshot.carrierVoyageNumber` | DCSA voyage concept | Required for confirmation-grade schedule |
| POL timezone | nullable `ZoneId` | `selectedVoyageSnapshot.portOfLoadingTimeZoneId` | IANA TZDB | Required for variance/grade |
| ETD text | nullable canonical RFC 3339 string | `selectedVoyageSnapshot.estimatedDepartureAt` | ISO 8601 / RFC 3339 | Provider offset retained |
| ETD instant | nullable `Instant` / `TIMESTAMPTZ` | internal `estimatedDepartureInstant` | Persistence/domain | Derived from ETD text; not duplicate public JSON |
| ETA text | nullable canonical RFC 3339 string | `selectedVoyageSnapshot.estimatedArrivalAt` | ISO 8601 / RFC 3339 | Provider offset retained |
| ETA instant | nullable `Instant` / `TIMESTAMPTZ` | internal `estimatedArrivalInstant` | Persistence/domain | Strictly after ETD when both present |
| Cargo cutoff text | nullable canonical RFC 3339 string | `selectedVoyageSnapshot.cargoCutoffAt` | ISO 8601 / RFC 3339 | Provider offset retained |
| Cargo cutoff instant | nullable `Instant` / `TIMESTAMPTZ` | internal `cargoCutoffInstant` | Persistence/domain | Strictly before ETD |
| Documentation deadline text | nullable canonical RFC 3339 string | `selectedVoyageSnapshot.documentationDeadlineAt` | ISO 8601 / RFC 3339 | Provider offset retained |
| Documentation instant | nullable `Instant` / `TIMESTAMPTZ` | internal `documentationDeadlineInstant` | Persistence/domain | Strictly before ETD |
| Classification | enum | `selectedVoyageSnapshot.scheduleClassification` | Application contract | `COMPLETE`, `PARTIAL`, `TEMPORALLY_INCONSISTENT` |
| Missing facts | ordered enum list | `selectedVoyageSnapshot.missingScheduleFacts[]` | Application contract | Approved five-fact order |
| Schedule reasons | ordered code list | `selectedVoyageSnapshot.scheduleReasonCodes[]` | Application contract | Safe stable codes |
| Requested variance | nullable signed integer | `selectedVoyageSnapshot.requestedDepartureVarianceDays` | Application contract | Calendar days in POL zone |
| Route origin/destination | typed location snapshots | U02 `referenceSnapshots.routing[]` | UN/LOCODE / Reference Data | Identity/code/version remain semantic routing evidence |
| Live observation | query-only discriminated view | `scheduleAuthority` | Booking view model | Not part of immutable snapshot |

## Contract Fidelity Check

### Approved target

The target retains U01's `request.selectedVoyageSnapshot` property and existing field names, then specializes voyage-version semantics: null remains readable only for a legacy U01 snapshot, while every new U03 acceptance requires a nonblank opaque version. It adds POL timezone, classification, missing/reason arrays, and signed variance. Requested departure remains a sibling Booking fact. Four milestone public values are canonical offset-aware strings; typed instants persist internally. Route remains typed and unflattened through the U02 routing list.

### Current-code divergence

| Current seam | Divergence | U03 target |
| --- | --- | --- |
| Reference Data `Voyage` | Only carrier number, origin/destination IDs, `scheduledDeparture`, `scheduledArrival` | Typed projection with all five facts, version/source/status, zones, route codes/versions |
| Current schedule parsing | `Instant.parse`, typically UTC `Z`; original provider offset lost | Strict `OffsetDateTime` plus retained canonical offset and derived instant |
| Cutoff/deadline | Absent | Add typed nullable OHS fields; required for confirmation grade |
| Timezone authority | Absent | Active location supplies IANA `timeZoneId` |
| Generic `ReferenceRecord.attributes` | Provider storage shape leaks implicit schedule contract | Adapter translates to typed `VoyageScheduleCandidate`; Booking never reads the map |
| Mixed `VESSEL_VOYAGE` set | Contains vessel and voyage records | OHS returns voyage candidates only and validates record type |
| Booking draft projection | Narrow/legacy schedule evidence | Retain U01 snapshot property and add typed fields additively |

No target divergence is intentionally deferred inside U03. U05 current validation is a separate lifecycle concern, not missing schema. U04 handles legacy snapshot migration/correction.

## Invariants & Validation

1. Requested departure is a `LocalDate` and never becomes or is replaced by a schedule instant.
2. A newly selected snapshot has provider identity, nonblank provider version, source, and verified route; a stale/inactive/mismatched or null-version selection never enters the aggregate.
3. Every non-null milestone has explicit offset, canonical offset text, and a consistent derived instant.
4. The ETD offset is valid under the accepted POL IANA zone at its instant.
5. ETD is strictly before ETA; cargo cutoff and documentation deadline are each strictly before ETD.
6. No rule orders the two pre-ETD deadlines relative to each other.
7. Missing facts remain null and produce ordered reasons; no duration/default/neighbor voyage fills a gap.
8. `COMPLETE` means all five facts and all temporal/timezone rules pass. It does not mean U05 current validation exists.
9. Signed variance uses ETD converted to POL zone and cannot affect completeness by itself.
10. Snapshot facts, instant equivalents, classification, completeness, projection, activity, and operation result commit atomically.
11. Passive queries cannot call aggregate mutation or repository save.
12. Raw provider attributes/payloads are absent from Booking persistence, logs, errors, and evidence.
13. A legacy null-version snapshot is readable but non-current, incomplete, and never eligible for correction carry-forward.
14. U04 outage carry-forward requires exact equality of voyage ID/version, POL/POD ID/version, and requested date; it copies a non-legacy snapshot byte-for-byte and transfers no U05 validation.

## Lifecycle / State

Schedule classification is orthogonal to Booking lifecycle:

```text
no selected voyage                -> DRAFT / schedule absent
verified + all facts valid        -> DRAFT / COMPLETE
verified + facts missing          -> DRAFT / PARTIAL
verified + temporal/zone invalid  -> DRAFT / TEMPORALLY_INCONSISTENT
stale/inactive/route mismatch     -> no new revision
provider unavailable              -> no new revision; operation NOT_ACCEPTED
legacy null-version snapshot      -> readable / VOYAGE_VERSION_MISSING
unchanged U04 tuple + unavailable -> new revision / prior snapshot copied, authority unavailable
changed U04 tuple + unavailable   -> no new revision; operation NOT_ACCEPTED
```

Text fallback: a truthful incomplete schedule may live in a readable draft; invalid authority does not create a new revision. U04 may explicitly replace the snapshot. U05 separately validates current authority. Only a complete, currently validated revision can later satisfy confirmation preconditions.

The live observation state may transition independently from `CURRENT` to `STALE`, `INACTIVE`, `ROUTE_MISMATCH`, `UNAVAILABLE`, or back to `CURRENT` as queries run. Those transitions are presentation observations, not aggregate events.

## Open Questions

1. Any schedule field name, timezone representation, or ordering rule still disputed?
   - A. All canonical names and rules are confirmed by the approved requirements and U03 answers (recommended)
   - B. Some names/rules need domain-expert decision (list them)
   - X. Other
   - `[Answer]: A - preserve U01 selectedVoyageSnapshot names, strict offset-aware milestones, POL-zone variance, and the approved ordering only.`

No unresolved domain-name or schedule-semantics question remains for U03 Functional Design.

## Upstream Traceability

- `unit-of-work.md`: U03 schedule vertical slice, typed provider authority, and live DoD.
- `unit-of-work-story-map.md`: US-03 primary plus U03 correction/validation/detail/security/evidence contributions.
- `requirements.md`: FR-008 through FR-011, AC-004/AC-005, stable error and integrity requirements.
- `components.md`: Booking aggregate, `CarrierScheduleEvidence`, `VoyageSchedulePort`, and ownership.
- `component-methods.md`: schedule option/resolve/refresh/create/read methods and U05 separation.
- `services.md`: Reference Data OHS/Booking adapter, persistence, degradation, security, and Compose topology.
