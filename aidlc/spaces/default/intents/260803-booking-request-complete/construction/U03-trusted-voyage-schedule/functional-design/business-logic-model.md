# Business Logic Model - U03 Trusted Voyage Schedule

## Purpose and Scope

U03 extends the U01 selected-voyage snapshot and U02 complete request with trustworthy schedule authority. It preserves the operator's POL-local `requestedDepartureDate`, re-resolves one active route-compatible voyage, captures carrier voyage number plus ETD, ETA, cargo cutoff, and documentation deadline with provenance, computes a neutral calendar-day variance, and classifies partial, temporally inconsistent, stale, inactive, route-mismatched, and unavailable states without guessing facts or losing draft work.

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It specializes US-03 and U03 contributions to US-04, US-05, US-09, US-10, and US-11, chiefly FR-008 through FR-011, FR-026 through FR-030, AC-004 through AC-005, and NFR-002 through NFR-010. U04 owns post-save correction, U05 owns current-revision validation authority, and U08 owns final one-next-action convergence.

## Authority Boundaries

| Concern | Authority | U03 behavior |
| --- | --- | --- |
| Requested departure | Booking user / Booking aggregate | Preserved as a POL-local `LocalDate`; never overwritten by ETD |
| Voyage identity, status, route, schedule, source/version | Reference Data OHS | Re-resolved; Booking captures revision evidence only |
| POL timezone | Active Reference Data location | Used for variance; persisted with accepted snapshot evidence |
| Draft snapshot and completeness | Booking | Persists truthful returned facts, explicit nulls, and reasons |
| Current lifecycle validation | U05 | Separate result bound to exact Booking revision/fingerprint |
| Passive option/schedule refresh | Query only | Never mutates a persisted Booking revision |

The browser and BFF are not schedule authorities. They may render candidates, but create/correction commands carry only selected voyage identity/version. Booking accepts provider-derived facts only through `VoyageSchedulePort`.

## Canonical Voyage Schedule OHS

The target Reference Data response is typed and additive. It does not expose a generic attributes bag to Booking:

```json
{
  "voyageId": "voyage-id",
  "voyageVersion": "19",
  "status": "ACTIVE",
  "source": "reference-data",
  "carrierVoyageNumber": "LC1042",
  "origin": {
    "locationId": "location-usnyc-id",
    "unLocode": "USNYC",
    "version": "23",
    "timeZoneId": "America/New_York"
  },
  "destination": {
    "locationId": "location-nlrtm-id",
    "unLocode": "NLRTM",
    "version": "31",
    "timeZoneId": "Europe/Amsterdam"
  },
  "estimatedDepartureAt": "2026-08-23T10:00:00-04:00",
  "estimatedArrivalAt": "2026-09-04T09:00:00+02:00",
  "cargoCutoffAt": "2026-08-22T08:00:00-04:00",
  "documentationDeadlineAt": "2026-08-21T16:00:00-04:00"
}
```

Every milestone is either an RFC 3339 offset date-time string or explicit null in a partial provider result. A complete result requires all five schedule facts: nonblank carrier voyage number and the four date-times. `voyageVersion`, source, route identities/codes, status, and POL IANA timezone are mandatory authority metadata. For every newly accepted U03 snapshot, `voyageVersion` is a nonblank opaque concurrency token returned by Reference Data and exactly equal to the submitted version. The provider may return a typed partial result; it may not fabricate missing values.

U01-compatible snapshots that predate U03 may contain a null `voyageVersion`. They remain readable as historical evidence with a `VOYAGE_VERSION_MISSING` completeness/authority reason outside the three-state schedule-classification algorithm, are never represented as current authority, and cannot become confirmation-grade. U04 can upgrade one only by submitting a nonblank selected voyage version and successfully re-resolving the voyage; U05 rejects an exact revision that still contains a null voyage version with the same reason.

Current executable `Voyage` code reads `carrierVoyageNumber`, `originLocationId`, `destinationLocationId`, `scheduledDeparture`, and `scheduledArrival` from `ReferenceRecord.attributes`, parses only UTC-compatible `Instant`s, and has no cutoff, documentation deadline, or timezone fields. U03 requires a typed OHS projection/anti-corruption adapter over that model. Booking must not parse the current generic attributes map directly.

## Offset-Date-Time Canonicalization

For each non-null milestone:

1. Require strict RFC 3339 date, time, seconds, and numeric offset or `Z`; a local date-time without offset is invalid.
2. Parse as `OffsetDateTime` and derive `Instant` for ordering/comparison.
3. Serialize to canonical ISO offset-date-time text while retaining the provider's actual numeric offset; do not replace it with server/browser local time or automatically collapse it to `Z`.
4. Persist both the canonical offset-aware text in the revision snapshot and its instant-equivalent typed value (`TIMESTAMPTZ`/domain `Instant`) for deterministic ordering and queries.
5. For ETD, resolve the accepted POL `timeZoneId` through `ZoneId`; convert the ETD instant using those zone rules. If the provider ETD offset is not valid for that POL zone at the ETD instant, classify `VOYAGE_TIMEZONE_MISMATCH` and do not treat the schedule as confirmation-grade.

Parsing, persistence, response mapping, fingerprint-supporting validation, and browser display use the same canonical strings. Locale formatting is presentation only; the machine-readable `<time dateTime>` value remains canonical and unambiguous.

## Voyage Resolution and Draft Save Sequence

1. The form commits one candidate only after POL, POD, and requested departure are present. Search text is never the selection.
2. The create/correction command carries the U01/U02 canonical route, requested date, and `selectedVoyage.voyageId/voyageVersion`; it never carries schedule facts as client authority.
3. U01/U02 parse, normalize, validate, fingerprint, authorize, and claim the operation before protected provider work.
4. Booking calls `VoyageSchedulePort.resolve` with selected identity/version and the accepted POL/POD identity/code/version. Requested departure is supplied only for candidate ordering/variance context, never route validity or schedule rewriting.
5. The adapter validates the OHS envelope, version/status/source, route equality, IANA zone, each non-null offset date-time, and response bounds. Malformed provider output becomes a safe contract error.
6. If identity, nonblank version, `ACTIVE` state, and route match, construct `SelectedVoyageSnapshot` from every returned fact. Missing facts remain explicit null. Calculate temporal classification and signed requested-date variance.
7. A complete or partial/temporally inconsistent verified snapshot may commit with the draft in the existing fenced C2. Partial/invalid schedule facts add ordered completeness reasons and block later confirmation; they do not invalidate otherwise valid user input.
8. A stale-version, inactive, route-mismatched, or not-found new selection is not accepted as canonical. The command stores fenced `REJECTED` and no Booking mutation. Provider unavailability proven not accepted stores `NOT_ACCEPTED` for U01 same-identity recovery.
9. Success/reopen returns the persisted snapshot. Passive option or schedule Refresh returns a separate candidate/status view and never writes the Booking aggregate.

Text fallback: Booking verifies the selected voyage and route, preserves every real provider fact with offset/provenance, records missing or inconsistent schedule facts as incompleteness, and commits only through the existing operation fence.

## Schedule Classification Algorithm

Given a verified active route-compatible voyage:

1. `missingFacts` is the approved order: `carrierVoyageNumber`, `estimatedDepartureAt`, `estimatedArrivalAt`, `cargoCutoffAt`, `documentationDeadlineAt`.
2. If any fact is null, classification is `PARTIAL`; temporal checks run only where both operands exist, and all detected inconsistencies are retained.
3. If ETD and ETA exist, require `ETD.instant < ETA.instant`.
4. If cargo cutoff and ETD exist, require `cargoCutoff.instant < ETD.instant`.
5. If documentation deadline and ETD exist, require `documentationDeadline.instant < ETD.instant`.
6. Equality fails each strict ordering rule. No ordering is invented between cargo cutoff and documentation deadline.
7. If all facts exist and any ordering or POL-zone offset check fails, classification is `TEMPORALLY_INCONSISTENT`.
8. If all facts exist and all checks pass, classification is `COMPLETE`.

The persisted safe reason codes are `VOYAGE_SCHEDULE_INCOMPLETE`, `VOYAGE_TEMPORAL_INCONSISTENCY`, and `VOYAGE_TIMEZONE_MISMATCH` with exact schedule field paths. U05 later adds current `REFERENCE_STALE`, `REFERENCE_INACTIVE`, or route outcomes against the exact revision; U03 save-time rejection uses those stable codes but does not create validation evidence.

## Requested-Date Variance

Variance is calculated only when requested departure, valid POL IANA zone, and ETD exist:

```text
etdPolDate = estimatedDepartureInstant at accepted POL ZoneId -> LocalDate
varianceDays = DAYS.between(requestedDepartureDate, etdPolDate)
```

- `0`: same local calendar date.
- positive: carrier ETD is N calendar days later.
- negative: carrier ETD is N calendar days earlier.

The value is explanatory and never changes completeness, selects a voyage, overwrites requested departure, or applies an unapproved tolerance. A missing or invalid timezone/ETD yields no variance and contributes its authority reason.

## Persisted Selected-Voyage Snapshot

U03 retains U01's `request.selectedVoyageSnapshot` response property and field names, adding authority metadata without renaming:

```json
{
  "voyageId": "voyage-id",
  "voyageVersion": "19",
  "voyageSource": "reference-data",
  "carrierVoyageNumber": "LC1042",
  "portOfLoadingTimeZoneId": "America/New_York",
  "estimatedDepartureAt": "2026-08-23T10:00:00-04:00",
  "estimatedArrivalAt": "2026-09-04T09:00:00+02:00",
  "cargoCutoffAt": "2026-08-22T08:00:00-04:00",
  "documentationDeadlineAt": "2026-08-21T16:00:00-04:00",
  "scheduleClassification": "COMPLETE",
  "missingScheduleFacts": [],
  "scheduleReasonCodes": [],
  "requestedDepartureVarianceDays": 3
}
```

For a verified partial result, every unavailable milestone is explicit null, classification is `PARTIAL`, and ordered missing fact/reason arrays name the gap. Instant-equivalent values are persistence/domain fields, not duplicate public JSON properties. The snapshot also retains the verified route/location identity/version through the U02 semantic location snapshots; it is not reconstructed from display labels.

## Completeness Integration

U03 appends schedule reasons after U02's selected-voyage missing reason. The reason order is carrier number, ETD, ETA, cargo cutoff, documentation deadline, then timezone/temporal pair rules in their algorithm order. Each entry is `{code, fieldPath, group:"ROUTE_AND_SCHEDULE", messageKey}` and contains no raw provider payload.

| Condition | Request completeness effect | Confirmation effect |
| --- | --- | --- |
| No selected voyage | U02 `REQUIRED_REFERENCE_MISSING` | Blocked |
| Verified complete schedule | No U03 missing reason | Still requires U05 current validation |
| Verified partial schedule | `VOYAGE_SCHEDULE_INCOMPLETE` per missing fact | Blocked |
| Verified temporal/zone inconsistency | Stable inconsistency reason | Blocked |
| Legacy snapshot with null voyage version | `VOYAGE_VERSION_MISSING` | Blocked until U04 re-resolution |
| Stale/inactive/route mismatch on attempted save | No new revision; linked command error | Existing record unchanged |
| Provider unavailable on attempted save | No new revision; operation `NOT_ACCEPTED` | Same-identity Retry when granted |

## Refresh and Revision Semantics

`GET /api/booking/voyage-options` and explicit schedule Refresh are queries. They may show a candidate different from the stored snapshot, but they never alter `revision`, persisted request, completeness, validation, or price. The UI labels persisted evidence separately from live candidate status.

Only explicit create or U04 correction may commit a new `SelectedVoyageSnapshot`. U04 supplies expected revision and full replacement semantics. U05 writes a separate validation result bound to the exact revision and validation fingerprint. A passive provider update cannot silently invalidate or rewrite Booking history.

### U04 correction carry-forward decision table

U03 defines the schedule boundary consumed by U04; U04 remains the mutation owner. "Unchanged" below means exact equality of submitted voyage ID and nonblank version, accepted POL/POD identity and versions, and requested departure date against the prior revision. Route label changes alone do not establish identity change. A legacy prior snapshot with null voyage version never qualifies for carry-forward.

| Prior snapshot and submitted change | Provider outcome | Snapshot/revision result | Completeness and validation result | Operation disposition |
| --- | --- | --- | --- | --- |
| No prior snapshot, changed voyage, changed route identity/version, or changed voyage identity/version | Verified active/version/route-compatible | Build a new immutable snapshot; recompute classification and variance from returned facts | Recompute completeness; no U05 result is created for the new revision | U04 normal success |
| Same nonblank voyage ID/version and same route identity/versions; requested date changed | Verified active/version/route-compatible | Build a new snapshot from current provider facts; recompute variance against the new requested date | Recompute completeness; any prior U05 result does not apply to the new revision | U04 normal success |
| Same nonblank voyage ID/version, same route identity/versions, and same requested date | Verified active/version/route-compatible | Build a new revision with the re-resolved snapshot, even if its facts equal the prior snapshot | Recompute completeness; any prior U05 result does not apply to the new revision | U04 normal success |
| Same nonblank voyage ID/version, same route identity/versions, and same requested date | Provider unavailable | Carry the prior accepted snapshot byte-for-byte into the new revision; do not claim current authority and do not recalculate stored facts or variance | Preserve stored schedule completeness; the new revision has no current U05 validation and confirmation remains blocked until U05 succeeds | U04 success with safe `UNAVAILABLE` observation |
| Any voyage ID/version or route identity/version changed | Provider unavailable | Do not create a revision and do not reuse the prior snapshot | Existing revision/completeness/validation remain unchanged | Fenced `NOT_ACCEPTED` |
| Requested date changed | Provider unavailable | Do not create a revision because stored variance would describe a different request | Existing revision/completeness/validation remain unchanged | Fenced `NOT_ACCEPTED` |
| Submitted selection matches a legacy null-version snapshot | Any non-verified outcome | Do not carry forward or create a revision | Legacy record remains readable with `VOYAGE_VERSION_MISSING` | `NOT_ACCEPTED` when unavailable; otherwise stable rejection |
| Any submitted state | Stale, inactive, not found, route mismatch, or malformed response | Do not create a revision and do not reuse the prior snapshot | Existing revision/completeness/validation remain unchanged | Fenced `REJECTED` or `REJECTED/INSPECT` |

The outage exception supports unrelated corrections without converting stored evidence into live authority. It is not a provider fallback and never applies when the requested date, route identity/version, voyage identity/version, or legacy null-version status changes. Every successful U04 correction creates a new Booking revision, so any earlier U05 validation remains bound only to its old revision even when the snapshot is carried forward unchanged.

## Failure and Recovery Model

| Outcome | Booking/journal result | UI recovery |
| --- | --- | --- |
| Complete verified voyage | Draft `SUCCEEDED` with complete snapshot | Show schedule and neutral variance |
| Partial/temporally invalid but identity/route verified | Draft `SUCCEEDED/INCOMPLETE` with truthful snapshot | Preserve draft; show exact reason and Refresh/Correct; confirmation blocked |
| New selection stale/inactive/not found | No Booking mutation; fenced `REJECTED` | Preserve form, select current active voyage |
| Route mismatch | No Booking mutation; fenced `REJECTED` + `VOYAGE_ROUTE_MISMATCH` | Preserve route/date; replace voyage |
| Provider unavailable/no acceptance | No Booking mutation; fenced `NOT_ACCEPTED` | U01 status then same-identity signed Retry |
| Malformed or over-bound provider response | No Booking mutation; fenced `REJECTED/INSPECT` | Safe correlated contract error |
| Passive Refresh unavailable | No mutation of any kind | Keep persisted snapshot visible; retry query |
| Existing accepted snapshot later stale | Persisted evidence remains readable | Show stale live status separately; U05 blocks lifecycle progression |
| Unchanged schedule inputs during U04 correction; provider unavailable | New revision may carry the prior non-legacy snapshot byte-for-byte; live authority remains unavailable | Preserve unrelated edits; run U05 before confirmation |
| Changed requested date/route/voyage during U04 correction; provider unavailable | No mutation; fenced `NOT_ACCEPTED` | Preserve form and retry the same corrected intent |
| Legacy null-version snapshot reopened | Historical evidence remains readable and non-current | U04 select/version/re-resolve; U05 reports `VOYAGE_VERSION_MISSING` until upgraded |

## Privacy, Security, and Observability

- Authorize create/correct/read before protected provider lookup or record disclosure.
- Propagate correlation across shell, BFF, Booking, and Reference Data.
- Safe telemetry may include subset, schedule classification, missing/reason code, latency, and opaque voyage/operation identifiers permitted by policy.
- Do not log requested dates with party/cargo context, raw provider payloads, customer/party/cargo facts, credentials, or exception messages.
- Denied/not-found responses remain existence-safe. Provider 403 is not converted to no-match.
- No cache or fallback may invent schedule facts. A prior accepted snapshot may be displayed as persisted evidence but is never represented as current provider authority.

## Verification Obligations

Live Compose evidence must cover complete/same-date/earlier/later variance, every missing schedule fact, strict equality failures, invalid offset/timezone, nonblank version acceptance, legacy null-version reopen/upgrade/rejection, stale/inactive/route mismatch, provider unavailable, every U04 correction decision-table row, malformed response, exact offset/instant persistence, reopen, passive Refresh immutability, safe correlation, one operation effect, and confirmation blocked without U05 authority. The current Reference Data contract's missing cutoff/deadline/timezone typed projection is BLOCKED until implemented; mocks or attributes parsing cannot satisfy the DoD.

## Upstream Traceability

- `unit-of-work.md`: U03 route/date form through VoyageSchedulePort, provenance, degraded recovery, and live DoD.
- `unit-of-work-story-map.md`: US-03 primary plus U03 contributions to correction, validation, detail, security, and evidence.
- `requirements.md`: FR-008 through FR-011, FR-026 through FR-030, AC-004/AC-005, and NFR integrity/degradation/privacy obligations.
- `components.md`: shared Booking form, `CarrierScheduleEvidence`, typed aggregate, and `VoyageSchedulePort` ownership.
- `component-methods.md`: voyage-option, create/reopen, validation separation, focus, and error contracts.
- `services.md`: Reference Data OHS, Booking anti-corruption/persistence boundary, synchronous failure handling, and Compose evidence.

## Review

**Verdict:** READY  
**Reviewer:** aidlc-architecture-reviewer-agent  
**Iteration:** 2 of 2  
**Date:** 2026-08-10

### Iteration 1 Resolution

| Previous finding | Status | Verification |
| --- | --- | --- |
| Accepted `voyageVersion` was simultaneously mandatory and nullable | Resolved | All four artifacts now require a nonblank opaque version exactly matching the submitted version for every newly accepted U03 snapshot. A legacy U01 null-version snapshot is read-compatible only, carries `VOYAGE_VERSION_MISSING`, is never current/confirmation-grade/carry-forward eligible, and has explicit U04 upgrade plus U05 rejection behavior. |
| U04 correction behavior during provider outage was undefined | Resolved | The primary model contains a deterministic table over prior snapshot, voyage ID/version, POL/POD ID/version, requested date, and provider outcome. Exact unchanged non-legacy tuples may copy prior evidence byte-for-byte into a new revision while remaining unvalidated; any schedule-tuple change, legacy null version, stale/inactive/mismatch, or malformed authority forbids reuse. Business rules and domain invariants mirror the same decision. |
| `#schedule-status` heading focus did not map to executable `StatusStrip` | Resolved | `frontend-components.md` now defines a Booking-owned `section` labelled by native `h3#schedule-status`, applies `tabIndex=-1` only for invoked focus, and keeps the shared strip inside as message/tone rendering rather than the heading. Passive, invoked, repeated, reopen, and carried-snapshot announcement behavior is explicit. |

### Final Findings

No unresolved architecture finding remains. A developer can implement the U03 domain, OHS adapter, persistence, operation outcomes, U04/U05 boundary, and UI focus/state behavior without further architectural choice.

### Validation Results

| Validation | Result | Evidence |
| --- | --- | --- |
| `required-sections` sensor | PASS | Passed for `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, and `frontend-components.md`. |
| `upstream-coverage` sensor | PASS | All four artifacts reference `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. |
| Cross-artifact version semantics | PASS | OHS, acceptance sequence, business rules, entity schema/invariants, completeness, UI state, and verification obligations agree on mandatory new versions and legacy null-version handling. |
| U04/U05 boundary and fencing | PASS | Carry-forward eligibility is an exact tuple rule; provider-derived facts remain outside the client fingerprint; unchanged-outage correction succeeds only under the fenced U04 command, while changed/unverified intent is `NOT_ACCEPTED` or rejected. Every successful new revision invalidates prior U05 authority. |
| Offset/instant, variance, and ordering | PASS | Canonical offset text plus instant-equivalent persistence, POL-IANA-zone calendar variance, strict `ETD < ETA`, cutoff/deadline `< ETD`, equality rejection, and no invented deadline ordering remain consistent. |
| Provider/state/privacy model | PASS | Partial, temporal, timezone, stale, inactive, route mismatch, unavailable, malformed, passive-refresh, denial, safe correlation, and no-raw-payload behavior have distinct non-fabricating outcomes. The typed Reference Data OHS remains an explicit construction blocker rather than a design ambiguity. |
| Executable UI and LinerCore governance | PASS | Shared exports were verified; the Booking-owned native heading composition is executable without a local primitive, authority order is correct, required states/responsive/a11y evidence remain BLOCKED until observed, and advisory marketing/font/palette/chart/spinner/dark-default recommendations remain rejected. |

### Summary

U03 is implementation-ready. Its accepted-version authority, legacy compatibility, correction-outage blast radius, immutable/passive refresh semantics, U05 validation separation, exact temporal rules, privacy posture, and LinerCore focus/announcement composition are now deterministic and cross-artifact consistent. Construction must still implement and observe the explicitly BLOCKED typed Reference Data and live UI dependencies; those are delivery evidence obligations, not unresolved Functional Design choices.
