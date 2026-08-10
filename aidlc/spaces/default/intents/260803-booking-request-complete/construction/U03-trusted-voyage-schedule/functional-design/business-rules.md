# Business Rules - U03 Trusted Voyage Schedule

## Rule Scope

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They extend U01 operation/snapshot rules and U02 request/reference/completeness rules. U04 owns revisioned correction; U05 owns current validation; U08 owns final action precedence.

## Authority and Selection Rules

| ID | Rule | Outcome |
| --- | --- | --- |
| BR-U03-001 | `requestedDepartureDate` is the operator's POL-local preference and is never derived from or overwritten by ETD. | Persist unchanged |
| BR-U03-002 | Voyage search requires committed POL/POD and requested date; unmatched text is never canonical. | No selection commit |
| BR-U03-003 | The create/correction command carries voyage ID/version only, never schedule facts as browser authority. | Reject unapproved schedule command fields |
| BR-U03-004 | Booking authorizes before protected voyage lookup and re-resolves the selected voyage through `VoyageSchedulePort`. | Denial causes zero provider work |
| BR-U03-005 | A newly accepted voyage must be found, active, version-compatible, and match both accepted POL/POD identities/codes. | Otherwise no Booking mutation |
| BR-U03-006 | Provider display labels or generic attributes are not the Booking schedule contract. | Typed OHS projection required |
| BR-U03-007 | A prior persisted snapshot remains readable as historical accepted-revision evidence even when a live query reports stale/inactive/unavailable. | No silent history rewrite |
| BR-U03-008 | Every newly accepted U03 snapshot requires a nonblank opaque provider version exactly equal to the submitted version. | Otherwise `VOYAGE_VERSION_MISSING` or stale-version rejection; no snapshot |
| BR-U03-009 | A legacy/U01 null-version snapshot is readable but incomplete and non-current; only U04 successful versioned re-resolution upgrades it. | U05 rejects the legacy revision with `VOYAGE_VERSION_MISSING` |

## Schedule Fact Rules

The five confirmation-grade facts are `carrierVoyageNumber`, `estimatedDepartureAt`, `estimatedArrivalAt`, `cargoCutoffAt`, and `documentationDeadlineAt`.

| ID | Rule | Stable reason |
| --- | --- | --- |
| BR-U03-010 | Carrier voyage number must be nonblank and match the provider's typed voyage code contract. | `VOYAGE_SCHEDULE_INCOMPLETE` or contract error |
| BR-U03-011 | Each non-null milestone is strict RFC 3339 with explicit offset or `Z`. | `VOYAGE_SCHEDULE_INCOMPLETE` for typed partial; `REFERENCE_CONTRACT_ERROR` for malformed non-null value |
| BR-U03-012 | Canonical offset-aware text and instant-equivalent typed value are both persisted. | No offset loss or local-time inference |
| BR-U03-013 | ETD instant must be strictly before ETA instant. | `VOYAGE_TEMPORAL_INCONSISTENCY` |
| BR-U03-014 | Cargo cutoff instant must be strictly before ETD instant. | `VOYAGE_TEMPORAL_INCONSISTENCY` |
| BR-U03-015 | Documentation deadline instant must be strictly before ETD instant. | `VOYAGE_TEMPORAL_INCONSISTENCY` |
| BR-U03-016 | Equality fails every strict ordering rule. | Same inconsistency code |
| BR-U03-017 | No ordering is imposed between cargo cutoff and documentation deadline. | No invented rule |
| BR-U03-018 | POL IANA timezone must resolve and ETD offset must be valid for that zone at the ETD instant. | `VOYAGE_TIMEZONE_MISMATCH` |
| BR-U03-019 | Missing provider facts are explicit null; Booking never guesses from duration, another voyage, port defaults, browser zone, or requested date. | Persist truthful partial snapshot |

## Classification Rules

| ID | Condition | Classification / mutation |
| --- | --- | --- |
| BR-U03-020 | Identity/route verified; all five facts present; ordering/zone valid | `COMPLETE`; draft may commit |
| BR-U03-021 | Identity/route verified; one or more facts null | `PARTIAL`; draft may commit with reasons |
| BR-U03-022 | Identity/route verified; all facts present; temporal/zone rule fails | `TEMPORALLY_INCONSISTENT`; draft may commit with reasons |
| BR-U03-023 | Partial facts also expose a checkable temporal inconsistency | `PARTIAL` plus all applicable reason codes; no inconsistency is hidden |
| BR-U03-024 | Submitted version stale, voyage inactive/not found, or route mismatch | No new snapshot/revision; fenced `REJECTED` |
| BR-U03-025 | Provider unavailable with no accepted operation | No Booking mutation; fenced `NOT_ACCEPTED` |
| BR-U03-026 | Provider response malformed/over-bound | No Booking mutation; fenced `REJECTED` with `INSPECT` |
| BR-U03-027 | Passive query returns any state | No Booking/journal mutation |
| BR-U03-028 | U04 correction keeps voyage ID/version, route identity/versions, and requested date unchanged, prior version is nonblank, and provider is unavailable | Carry prior snapshot byte-for-byte into the new revision; preserve completeness; no current U05 validation |
| BR-U03-029 | U04 correction changes voyage ID/version, route identity/version, or requested date and provider is unavailable | No snapshot reuse or new revision; fenced `NOT_ACCEPTED` |

Draft-save success for `PARTIAL` or `TEMPORALLY_INCONSISTENT` does not imply confirmation readiness. U05 must later validate current authority; confirmation requires a complete current result.

## Variance Rules

| ID | Rule |
| --- | --- |
| BR-U03-030 | Convert ETD instant to the accepted POL IANA `ZoneId`, then take its local calendar date. |
| BR-U03-031 | `varianceDays = DAYS.between(requestedDepartureDate, etdPolDate)`. |
| BR-U03-032 | Positive means later, negative earlier, zero same date. |
| BR-U03-033 | Variance is explanatory, never a warning/error by itself and has no tolerance threshold. |
| BR-U03-034 | Missing requested date, ETD, or valid POL zone yields null variance and the underlying completeness/authority reason. |
| BR-U03-035 | UI locale formatting does not alter calculation or machine-readable date-time values. |

## Snapshot and Completeness Rules

| ID | Rule |
| --- | --- |
| BR-U03-040 | Preserve U01 response property `request.selectedVoyageSnapshot` and its existing names/null semantics. |
| BR-U03-041 | Snapshot includes voyage ID/version/source, carrier voyage number, POL timezone, four milestone strings, classification, missing facts, reason codes, and nullable signed variance. |
| BR-U03-042 | Persist instant-equivalent values for all present milestone strings; the public response need not duplicate them. |
| BR-U03-043 | U03 reasons follow U02 selected-voyage absence and are ordered carrier number, ETD, ETA, cargo cutoff, documentation deadline, timezone, then temporal relationships. |
| BR-U03-044 | Each completeness reason contains only stable code, canonical field path, group, and message key. |
| BR-U03-045 | A complete U03 snapshot removes schedule-missing reasons but does not create U05 validation evidence. |
| BR-U03-046 | Provider source/version/route facts are accepted-revision evidence, not a copied Reference Data master. |
| BR-U03-047 | Carry-forward during an unchanged-input U04 outage never relabels the snapshot as current and never recomputes facts or variance. |
| BR-U03-048 | Every successful U04 correction creates a new revision; an earlier U05 validation never transfers to it, including byte-identical snapshot carry-forward. |

## Operation and Transaction Rules

- Shape validation and request fingerprinting remain before C1. Provider-derived schedule facts are excluded from the client-intent fingerprint because the command carries only selected identity/version.
- Voyage resolution occurs after C1. Verified complete/partial/inconsistent snapshot plus Booking projection, completeness, activity, and `SUCCEEDED` operation result commit atomically in fenced C2.
- Stale/inactive/not-found/route mismatch uses fenced journal-only C2 `REJECTED`; explicit unavailability uses `NOT_ACCEPTED`; malformed contract uses `REJECTED/INSPECT`.
- A stale owner that loses the fence commits neither Booking nor journal disposition.
- Same operation and fingerprint replays the recorded result. Outcome-unknown Refresh is read-only; proven non-acceptance uses the U01 signed/version-bound retry with the same identity.
- Passive option/schedule Refresh is not an operation command and cannot increment revision, change completeness, or invalidate persisted price/validation.
- U04 may carry a prior non-legacy snapshot only for the exact unchanged schedule tuple `(voyageId, voyageVersion, polId, polVersion, podId, podVersion, requestedDepartureDate)` when the provider is unavailable. Any tuple change, null prior voyage version, or authoritative rejection forbids reuse.

## UI Interaction Rules

| ID | Rule |
| --- | --- |
| BR-U03-060 | Requested departure and carrier ETD are always separately labeled and shown together when ETD exists. |
| BR-U03-061 | Carrier schedule facts are read-only evidence with visible source/version and timezone/offset. |
| BR-U03-062 | Loading reserves schedule-panel dimensions; passive completion never steals focus. |
| BR-U03-063 | Same-date/earlier/later variance uses plain text and is not color-only or automatically warning-styled. |
| BR-U03-064 | Partial/invalid states name exact missing/inconsistent facts and state that draft work is preserved while confirmation is blocked. |
| BR-U03-065 | Explicit Refresh result focuses `#schedule-status`; passive resolution leaves focus on the voyage control. |
| BR-U03-066 | Changing POL/POD invalidates an incompatible transient voyage choice but preserves unrelated form values. |
| BR-U03-067 | Changing requested date never auto-selects or clears a route-compatible voyage; it recalculates explanatory variance. |
| BR-U03-068 | A previously accepted stale/inactive snapshot remains visible as read-only evidence while replacement uses a separate shared Combobox. |
| BR-U03-069 | Status combines text with shared token/icon; no whole-form live region or repeated unchanged announcement. |
| BR-U03-070 | Dirty Cancel and U01/U02 save recovery remain unchanged. |

## Responsive and Accessibility Rules

- Use the canonical shell and shared `DefinitionList`, `StatusStrip`, `PartialDataNotice`, `Skeleton`, `Field`, `Combobox`, and `Button` primitives.
- On desktop, schedule evidence may use two-column label/value rows; at 375/390 it stacks without hiding codes, offsets, source, or reasons.
- Machine-readable `<time dateTime>` values use canonical offset strings; visible copy includes unambiguous date, time, and offset/timezone.
- The status heading has stable `id="schedule-status"` and `tabIndex=-1` only when programmatic focus is required after an invoked action.
- Verify 375, 390, 768, 1024, and 1440 px, 200% zoom, keyboard, reduced motion, forced colors, and light/dark themes with no page-level overflow.
- Shared focus ring remains unclipped. Icons are shared Lucide mappings and decorative icons are hidden from assistive technology.

## Security, Privacy, and Failure Rules

- Authorization precedes protected provider work and protected record/voyage disclosure.
- Provider denial is distinct from no-match/not-found and reveals no protected detail.
- Logs/errors/evidence contain safe classification/reason/correlation only, not raw provider payloads or customer/party/cargo facts.
- No automatic retry occurs on malformed, stale, inactive, route-mismatch, or denied results.
- Provider unavailability never clears the form or replaces a persisted accepted snapshot with nulls.
- An unavailable prerequisite is `BLOCKED`, not PASS; no mock or current generic attributes parsing satisfies the typed OHS contract.

## Ownership and Deferral Rules

- Reference Data owns typed voyage schedule projection, IANA location timezone, active/version/route truth, and additive cutoff/deadline fields.
- Booking owns snapshot capture, variance, completeness, UI composition, and operation result.
- U04 owns explicit post-save snapshot replacement under expected revision.
- U05 owns batch/current validation and lifecycle-validity fingerprint.
- W2-02 owns `@erp/ui`; U03 adds no local shared primitive, token, page override, or shell behavior.
- U08 owns final canonical action precedence and integrated route behavior.

## Verification Rules

Unit/component/contract tests and live Compose evidence must cover complete and every degraded classification, offset/DST parsing, strict ordering/equality, earlier/same/later variance, required nonblank version, legacy null-version read/upgrade/rejection, route/version/status rejection, partial save/reopen, every U04 correction carry-forward decision, passive Refresh immutability, same-identity provider recovery, focus/announcement, responsive/a11y behavior, privacy, and one operation effect. At least 80% changed executable-line coverage applies per touched module.

## Upstream Traceability

- `unit-of-work.md`: U03 vertical schedule seam and observed Definition of Done.
- `unit-of-work-story-map.md`: US-03 primary and cross-cutting U03 story contributions.
- `requirements.md`: FR-008 through FR-011, FR-026 through FR-030, AC-004/AC-005, and NFRs.
- `components.md`: `CarrierScheduleEvidence`, Booking aggregate, `VoyageSchedulePort`, and ownership boundaries.
- `component-methods.md`: voyage-option/refresh/create/read method and stable focus/error behavior.
- `services.md`: typed Reference Data OHS, Booking persistence, degradation, security, and evidence seams.
