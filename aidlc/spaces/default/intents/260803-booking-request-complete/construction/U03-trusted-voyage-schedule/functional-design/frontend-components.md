# Frontend Components - U03 Trusted Voyage Schedule

## Purpose and UI Authority

U03 extends the one Booking-owned `/booking/new` and canonical Overview composition with route-compatible voyage search, read-only carrier schedule evidence, requested-date variance, provenance, and truthful degraded recovery. It does not add a page, route family, shell, theme, shared primitive, or design-system override.

This design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus approved `mockups.md`, `interaction-spec.md`, `design-system-mapping.md`, and `accessibility-checklist.md`.

Authority order is approved W3-04 scope/requirements; security/accessibility/technical standards; LinerCore master plus executable `@erp/ui`; approved page override (none exists); approved Refined Mockups; advisory UI/UX Pro Max. Retained advice is unambiguous date formatting, announced errors, server-rendered reads, focused client state, stable loading geometry, visible focus, and responsive operational density. Rejected advice includes Enterprise Gateway/hero/sales framing, Fira font/palette replacement, charts, decorative effects, spinner-only loading, and a dark-default theme.

## Current Shared and Provider Findings

The current Reference Data `Voyage` model exposes only departure/arrival UTC-style instants through generic attributes. It lacks cutoff, documentation deadline, IANA timezone, and a typed Booking-facing schedule projection. U03 live evidence remains BLOCKED until the provider OHS supplies the approved typed fields.

The full create form also inherits U02's BLOCKED shared `TextArea`/counter dependency. U03 adds no local substitute. Executable `--erp-font-sans` currently resolves to Inter/system while approved prose describes IBM Plex Sans; U03 consumes the token and leaves this UI Platform drift to W2-02.

## Component Composition

```text
BookingRequestForm (existing focused client composition)
└── RouteAndScheduleSection
    ├── ReferenceFieldState (POL)
    ├── ReferenceFieldState (POD)
    ├── RequestedDepartureField
    ├── VoyageReferenceField
    │   └── shared Field + Combobox
    └── CarrierScheduleEvidence
        ├── ScheduleStatusRegion
        ├── RequestedAndCarrierDates
        ├── ScheduleFactsDefinitionList
        ├── ScheduleProvenance
        └── ScheduleRefreshAction

BookingDetailPage / Overview (server)
└── RouteAndScheduleSummary
    └── CarrierScheduleEvidence (persisted snapshot + live observation)
```

Text fallback: existing route fields drive one shared voyage combobox; a Booking-owned evidence composition shows persisted requested/schedule facts and a separate live authority observation.

## `RouteAndScheduleSection` Contract

| Prop/state | Type | Behavior |
| --- | --- | --- |
| `portOfLoading` | committed U02 location option/null | Supplies ID, UN/LOCODE, version, IANA timezone |
| `portOfDischarge` | committed U02 location option/null | Supplies route destination authority |
| `requestedDepartureDate` | ISO local-date string/null | Operator-owned POL-local preference |
| `selectedVoyage` | committed option/null | Client intent ID/version only |
| `voyageOptionState` | discriminated state | Loading/available/no-match/unavailable/stale/inactive/mismatch |
| `scheduleCandidate` | query-only candidate/null | Never persisted by query |
| `persistedSnapshot` | accepted U01/U03 projection/null | Immutable current-revision evidence |
| `errors` | canonical field-path map | Linked server/client errors |

POL/POD changes immediately mark an incompatible transient voyage selection invalid and clear only its query candidate; unrelated parties/cargo/equipment remain untouched. Requested-date changes retain a route-compatible voyage and recompute candidate variance without auto-selection. The server still re-resolves on save.

## `VoyageReferenceField` Contract

The field composes shared `Field` and `Combobox`. Query prerequisites are committed POL/POD plus requested departure. The option label shows carrier voyage number, vessel label where supplied, and route/date evidence without treating display text as authority.

| State | Visible behavior | Permitted action | Focus/live behavior |
| --- | --- | --- | --- |
| `prerequisitesMissing` | Help names required route/date inputs | Complete prerequisites | No announcement |
| `loading` | Dimension-reserving Skeleton; prior safe input retained | Await | Polite `#schedule-status`; no focus move |
| `available` | Active route-compatible options | Search/commit | Native Combobox semantics |
| `noMatch` | Shared `emptyLabel` | Change search/date/route | No custom count announcement |
| `unavailable` | Exact safe provider status | Retry query | Passive no focus move; invoked result focuses status |
| `stale` | Prior snapshot visible separately | Refresh/choose current option | Status describes stale evidence |
| `inactive` | Prior snapshot read-only | Choose active replacement | Linked status/error |
| `routeMismatch` | Selection incompatible with current route | Choose compatible voyage | Failed save focuses linked summary |
| `contractError` | Safe correlated provider-contract block | Inspect | Focus status after invoked action |

Search text is separate from committed ID/version. A stale or inactive persisted snapshot is never fed into the selectable active list as if current.

## `CarrierScheduleEvidence` Contract

| Prop | Type | Rendering rule |
| --- | --- | --- |
| `requestedDepartureDate` | local date/null | Label explicitly says POL-local requested departure |
| `snapshot` | persisted selected-voyage snapshot/null | Accepted revision evidence; source/version visible |
| `candidate` | query-only typed schedule/null | Clearly labeled live candidate before save |
| `authority` | live observation/null | Current/stale/inactive/mismatch/unavailable/contract error |
| `classification` | absent/complete/partial/inconsistent | Drives safe text/status, never guessed fact |
| `varianceDays` | signed integer/null | Same date, N days earlier, or N days later; neutral |
| `missingFacts/reasons` | ordered safe arrays | Exact operator-readable gaps and blocking consequence |
| `refreshState` | idle/pending/succeeded/failed | Explicit query only; never revision mutation |

Schedule facts render with `DefinitionList`, not a decorative timeline or chart. Each date-time shows an unambiguous visible date/time/offset and a `<time dateTime="canonical-offset-value">`. Source and version are visible text. Requested departure and ETD are adjacent but separately labeled.

### Visual states

- **Unselected:** explain that selecting a voyage reveals carrier schedule; no empty fabricated rows.
- **Loading:** reserve final label/value dimensions with Skeleton and concise status.
- **Complete same date:** show all facts and "Same POL-local calendar date".
- **Complete variance:** show signed plain-language difference; do not warning-style variance alone.
- **Partial:** show returned facts, em dash/Unavailable for null facts, exact incompleteness notice, and confirmation-blocked explanation.
- **Temporally inconsistent/timezone mismatch:** show facts as provider evidence, name the inconsistency, and block confirmation without rewriting values.
- **Stale/inactive/route mismatch:** keep persisted snapshot readable and show a separate replacement/Refresh path.
- **Unavailable:** retain persisted evidence/form; show safe correlation and explicit Refresh.
- **Contract error:** show safe inspection state; never raw provider response.
- **Legacy version missing:** keep historical snapshot readable, label it non-current, show `VOYAGE_VERSION_MISSING`, and require Correct to select and re-resolve a versioned voyage.

## Candidate Versus Persisted Evidence

The create form may show a live candidate before save. It is labeled "Carrier schedule - not yet saved". On authoritative create success, canonical Overview shows `request.selectedVoyageSnapshot` as persisted evidence. A later option/schedule Refresh may show a current observation alongside that snapshot but cannot overwrite it.

The client never POSTs a passive query result. Create/correction submits only voyage ID/version in the canonical request. A new U03 selection requires a nonblank version. Booking re-resolves and returns the accepted snapshot. U04 correction is the only later explicit replacement path; U05 validation status is separate. If an unrelated U04 correction preserves the exact schedule tuple and Reference Data is unavailable, the response may show the byte-identical persisted snapshot beside a distinct unavailable live-authority observation; it must not imply that the carried snapshot was freshly verified.

## Variance Presentation

| Value | Copy pattern |
| --- | --- |
| `0` | `Carrier ETD is on the requested POL-local date.` |
| positive `N` | `Carrier ETD is N calendar days later.` |
| negative `-N` | `Carrier ETD is N calendar days earlier.` |
| null | No variance claim; show the missing timezone/ETD/requested-date reason |

The visible requested date uses locale-appropriate long/medium formatting, never ambiguous numeric-only copy. Machine values remain ISO. No badge color, warning icon, or acceptability threshold is applied solely because variance is non-zero.

## API Integration

| Browser call | Contract |
| --- | --- |
| `GET /api/booking/voyage-options?polId={id}&polVersion={v}&podId={id}&podVersion={v}&requestedDepartureDate={date}&query={q}&limit={1..50}` | Authenticated create/correct list query; BFF validates/bounds and maps typed Reference Data candidates; no generic attributes |
| `GET /api/booking/voyage-options?...&voyageId={id}&voyageVersion={v}` | Same approved route in exact-observation mode for a transient or persisted selection; returns safe current/stale/inactive/mismatch/unavailable status and never writes |
| `POST /api/booking/bookings/drafts` | Existing U01/U02 command with selected voyage ID/version only; server resolves schedule |
| `PUT /api/booking/bookings/{bookingId}` | U04 explicit full replacement under expected revision; same form composition |
| `GET /api/booking/bookings/{bookingId}` | Canonical persisted `selectedVoyageSnapshot`, completeness, and separate live observation when requested |
| U01 operation status/retry routes | Same-identity save recovery; schedule unavailability never triggers blind resubmit |

The candidate envelope carries typed voyage/version/status/source, origin/destination identity/code/version/timezone, and nullable five schedule facts. OHS denied, unavailable, not-found, mismatch, partial, inactive, and malformed results map to distinct stable envelopes. No-match is successful empty results; provider 403 is denied, not empty.

`CarrierScheduleEvidence` renders its own semantic wrapper and heading before the shared strip: a Booking-owned `section` is labelled by a native `h3` with `id="schedule-status"`; that heading receives `tabIndex=-1` only when focus is programmatically requested. The existing shared `StatusStrip` remains inside the section for tone/icon/message rendering and does not own the heading or focus target. This composition uses the primitive as shipped and creates no W2-02 platform dependency.

For passive query changes, the strip is either static or uses one coalesced polite status message only when human-readable content changes; focus never moves. For an operator-invoked Refresh or Inspect result, the heading is focused once after rendering and the result message is announced once. Repeated identical observations, reopen rendering, and carried historical snapshots are static and are not re-announced.

## Focus and Announcement Contract

| Event | Target | Rule |
| --- | --- | --- |
| Passive option/schedule resolution | Current control | Polite coalesced status; no focus theft |
| Explicit Refresh result | `#schedule-status` | Programmatically focus heading with `tabIndex=-1` |
| Voyage/route field error on save | `#booking-errors` then linked control | Preserve every other entry |
| Save success/replay | `h1#booking-record-title` | U01 one-time navigation notice |
| Provider contract error after action | `#schedule-status` | Safe code/correlation and Inspect |
| Dirty Cancel | Shared Dialog | Existing trap and trigger restoration |

The whole form and schedule panel are not broad live regions. The focusable `#schedule-status` is the Booking-owned native `h3`, not the shared `StatusStrip` root or its internal heading. Repeated unchanged observations are not announced. Status is text plus shared semantic tone/icon, never color alone.

## Responsive Contract

| Width | Behavior |
| --- | --- |
| 375/390 | One-column route controls; schedule label over value; source/offset wrap; in-flow Refresh; no horizontal page scroll |
| 768 | Stacked form/Review; schedule may use two columns only if each remains readable |
| 1024 | Form/rail only when main remains >=640px; schedule focus/status not obscured by rail |
| 1440 | Dense main/rail composition; compact definition rows inside existing content maximum |
| 200% zoom | All facts, offsets, reasons, provenance, and actions reflow without loss |

Combobox lists retain shared full-Field width, wrapping, 240px vertical cap, and page block-end scroll space. U03 claims no collision/flip extension.

## Accessibility Contract

- Persistent labels for POL, POD, requested departure, and voyage; help explains POL-local meaning.
- Native date input/value semantics and canonical machine-readable `<time>` values.
- Logical heading order; schedule facts use `dl` semantics rather than layout-only rows.
- Missing/inconsistent facts are explicit text, not empty color-coded cells.
- Source/version/offset are visible, not tooltip-only.
- Shared Combobox keyboard behavior; no free-text commit.
- Refresh has explicit label and pending/disabled semantics; no duplicate query storms.
- Visible shared focus ring, reduced motion, forced-color meaning, WCAG 2.1 AA contrast, and at least 44px mobile targets.

## UI Governance Conformance

Current evidence status only:

| Surface/behavior | Status | Evidence / blocker |
| --- | --- | --- |
| Canonical shell and shared form | BLOCKED | U03 running route has not been constructed/observed |
| Typed provider schedule and provenance | BLOCKED | Current OHS lacks cutoff/deadline/timezone typed projection |
| Shared primitive/token reuse | BLOCKED | Must be observed; full form also inherits missing shared TextArea dependency |
| Requested/ETD separation and variance | BLOCKED | Design specified, live behavior not captured |
| Loading/partial/stale/inactive/mismatch/unavailable states | BLOCKED | Requires real provider and browser evidence |
| Keyboard/focus/live-region behavior | BLOCKED | Requires browser/assistive verification |
| Required viewports/themes/zoom | BLOCKED | Live visual evidence unexecuted |
| W3-04 master/page override edit | NOT APPLICABLE | No override is authorized or created |
| Local shared primitive or theme | NOT APPLICABLE | Explicitly prohibited and not designed |

## Verification Matrix

Construction must observe the complete candidate/save/reopen journey; earlier/same/later variance; every null fact; strict ordering and timezone failures; nonblank and legacy null-version states; stale/inactive/mismatch/unavailable/malformed states; U04 unchanged-snapshot outage carry-forward versus changed-tuple rejection; passive Refresh immutability; same-identity command recovery; exact native-heading focus and passive/invoked announcement behavior; persisted versus live labeling; 375/390/768/1024/1440; 200% zoom; keyboard; reduced motion; forced colors; light/dark contrast; and no page overflow. Source review, mocks, or screenshots alone are not PASS.

## Upstream Traceability

- `unit-of-work.md`: U03 UI-provider-domain-persistence vertical slice and live schedule DoD.
- `unit-of-work-story-map.md`: US-03 primary and U03 detail/security/evidence contributions.
- `requirements.md`: FR-008 through FR-011, FR-025 through FR-030, AC-004/AC-005, accessibility and degradation requirements.
- `components.md`: one shared Booking form, `CarrierScheduleEvidence`, route-backed Overview, and UI/platform ownership.
- `component-methods.md`: form refresh/save/read methods, schedule query, focus, and error mapping.
- `services.md`: Booking BFF/adapter and Reference Data OHS boundaries, security, degradation, and Compose evidence.
