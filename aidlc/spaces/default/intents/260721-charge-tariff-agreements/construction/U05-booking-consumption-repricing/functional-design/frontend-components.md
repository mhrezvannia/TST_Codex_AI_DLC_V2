# Frontend Components — U05 Booking Consumption and Repricing

## UI boundary and design-system application

This UI design covers only the existing Booking detail pricing region required
by U05 in `unit-of-work.md` and its US-06–US-11 mapping in
`unit-of-work-story-map.md`. It consumes the Booking-visible requirements in
`requirements.md`, C14 in `components.md`, the Booking frontend/BFF contract in
`component-methods.md`, and the explicit pricing sequence in `services.md`.

`ui-ux-pro-max` was invoked for this Booking detail region. Its applicable
guidance is a dense but readable item table, summary-to-detail provenance,
accessible names, preserved context, and explicit loading/error announcements.
Dashboard charts, KPIs, export tools, decorative/3D treatments, marketing
patterns, and a page-level drill-down redesign are rejected.

`design-system/linercore/MASTER.md` and
`design-system/linercore/SESSION-PROMPT.md` remain binding. The implementation
reuses the existing shared shell/tokens/primitives unchanged. It does not modify
`packages/ui`, Booking routes, shell, navigation, typography, palette, or the
Charge page record. This is the minimum Booking consumer seam needed to prove a
Booking-visible real price.

## Component hierarchy

The existing Booking detail page and `BookingValidationPanel` retain ownership.
Their current pricing subsection becomes:

- `BookingPricingRegion`
  - `RequestedDepartureAmendment`
  - `PricingAction` (Price or Reprice)
  - `PricingStatusMessage`
  - `PricingHistorySelector`
  - `BookingPricingBreakdown`
    - `PricingLineTable`
    - `PricingTotal`
    - `PricingProvenance`
  - `LegacyPricingEvidence` (conditional)
  - `ManualPricingEvidence` or `PricingFailureEvidence` (conditional)

No component is promoted into a shared package. Existing local styles and
LinerCore tokens are used.

## View model and props

`BookingPricingRegion` receives one server-owned view model:

| Field group | Values |
| --- | --- |
| Booking input | booking ID/number, persisted requested departure, revision, pricing amendment sequence, editable/capability flags |
| Current state | existing general Booking status, additive pricing status, canPrice, canReprice, canConfirm/canReconfirm, busy/in-progress and bounded retry guidance |
| Typed history | request ID, amendment/revision, priced time, basis/ref, agreement version, exact ordered lines, total/currency, correlation |
| Legacy history | stored flattened labels/values and original timestamp/correlation when available; explicit unavailable fields |
| Failure evidence | exact reason code/text, request/case IDs when present, correlation, attempts, circuit/next-probe when local |

Amounts arrive as authoritative strings/numbers from the Booking API view model.
The browser formats them for display only and performs no pricing calculation.
Component state is limited to selected history ID, date-form draft/error, busy
flag, and announcement text. RTK is absent and is not introduced.

## Interaction flows

### Persist requested departure

1. The region shows the stored date or “Required before pricing”.
2. An authorized operator activates Edit, enters an ISO calendar date, and
   submits through the existing Booking amend BFF/API route.
3. Invalid/missing input is associated with the control and first error receives
   focus. Price/Reprice remains unavailable.
4. Success reloads current Booking state. If the fingerprint changed, the
   returned sequence/status exposes Reprice; the edit itself never calls Charge.

For `VALIDATED`, the edit returns general status `VALIDATED`, so a missing date
can be corrected before first Price. For `CONFIRMED`/`RECONFIRMED`, the existing
amend route returns `AMENDED`; non-pricing edits retain current price and allow
Reconfirm, while pricing edits require Reprice first. Disallowed lifecycle
states render the date read-only with the server reason.

### Price or Reprice

1. The label is “Price booking” when no typed current result exists and
   “Reprice booking” only when `REPRICE_REQUIRED`.
2. Activation calls the existing Booking price BFF. The service derives the
   provider key; no browser-generated value is displayed as authority.
3. The button disables during the operation, keeps focus, and a polite live
   region announces “Pricing booking…” or “Repricing booking…”.
4. Success reloads the view, selects the new current snapshot, and announces the
   update without moving focus.
5. Failure preserves operator context and renders the exact state-specific
   recovery message. Duplicate activation is impossible while busy.

### Select history

The selector options have stable IDs and labels such as
“Current — amendment 2 — 2026-07-22 10:15 UTC”, “Previous — amendment 1…”, and
“Legacy snapshot”. Selection is local display state and retains focus. It does
not call Price/Reprice or mutate currentness. The first 20 entries load with the
detail view; “Load older pricing history” requests the next stable cursor page,
up to the service maximum of 100 per request.

## Itemisation and provenance

`PricingLineTable` renders provider order without sorting:

| Header | Content |
| --- | --- |
| Charge | code plus category/rate category |
| Basis | exact provider basis |
| Quantity | exact provider quantity |
| Unit rate | exact provider unit rate and currency |
| Amount | exact provider line amount and currency |
| Source version | exact immutable rate-version ID |

The table has a visible caption identifying the selected amendment. The total is
outside the row body but programmatically labeled “Pricing total” and associated
with the selected history entry. `PricingProvenance` displays pricing basis,
pricing ref, optional agreement-version ID, pricing-request ID, requested
departure, priced time, and correlation ID. Missing legacy provenance says
“Unavailable in legacy snapshot”; it is never guessed.

At narrow widths, the existing region uses a labeled horizontal overflow
container or equivalent local stacked line records. Every field remains
available and keyboard reachable. No breakpoint changes the business order or
hides source identities.

## State-specific rendering

| State | Region presentation | Actions |
| --- | --- | --- |
| `PRICED` | selected exact breakdown, total, provenance, history | no Reprice unless later input change |
| `LEGACY_PRICED` | exact stored legacy key/value evidence and unavailable provenance labels | Confirm/Reconfirm allowed for compatibility; not presented as W2 proof |
| `REPRICE_REQUIRED` | previous snapshot clearly historical; current inputs/date; no current authoritative total | Reprice |
| `MANUAL_PRICING_REQUIRED` / `NO_RATE` | reason, request/case/correlation evidence; no current total | amend relevant input/authority then explicit Reprice |
| ambiguity | exact ambiguity reason and Charge case evidence; no current total | no no-rate relabel |
| timeout/503 exhausted | Booking-local outage, attempts/correlation; no Charge case/total | explicit retry/Reprice |
| circuit open | local circuit state and next-probe time; no provider-call claim | disabled until policy permits |
| denied | permission message; no manual label/total | authorization recovery |
| malformed provider | support-safe error and correlation; no total | explicit retry after correction |
| Booking/provider validation | field/domain reason; no manual relabel | amend Booking input |
| conflict/Booking changed | reload instruction; no overwrite/total | reload then explicit action |
| in progress | pending status and validated Retry-After | duplicate action disabled |

Historical totals may remain viewable through history in non-priced current
states, but are visibly tagged Previous and never presented as the confirmation
total.

Existing Confirm/Reconfirm controls consume server `canConfirm`/`canReconfirm`.
They are disabled with an associated reason for `REPRICE_REQUIRED`,
`MANUAL_PRICING_REQUIRED`, validation, outage, denied, malformed, conflict,
changed, or in-progress. Reconfirm stays lifecycle-only; the UI never chains a
hidden price call.

## Accessibility and responsive behavior

- The pricing region has one stable heading and status association.
- Date input, selector, buttons, overflow region, table caption/headers, total,
  and evidence IDs have accessible names.
- Errors use text and semantic status in addition to color; focus moves only to
  invalid fields, not on asynchronous completion.
- Pending, success, and failure announcements use the existing polite live
  region and avoid repeated duplicate messages.
- Keyboard order follows date amendment → Price/Reprice → history → breakdown.
- 375/768/1024/1440 and light/dark evidence is owned by U06; this design creates
  no PASS claim before Playwright observation.
- DS-01/DS-02/DS-03 remain exactly as recorded by W2-02/W1 evidence; no local
  wording upgrades a waiver or dependency to a real PASS.

## API integration

- Booking detail GET returns the typed current/prior/legacy view model and exact
  failure evidence.
- Existing amend BFF/API accepts optional typed `requestedDepartureDate` in
  addition to retained legacy attributes.
- Existing price BFF/API remains `POST /api/bookings/{id}/price`; it carries
  session identity/correlation while Booking derives the Charge key.
- HTTP 200 is used for persisted `PRICED`, `LEGACY_PRICED`, and
  `MANUAL_PRICING_REQUIRED` Booking views. The BFF treats manual-required as a
  completed command state, not a generic error.
- HTTP 403 `FORBIDDEN`, 502 provider-denied/invalid, 422 validation, 409
  idempotency/in-progress/snapshot-conflict/`BOOKING_CHANGED` remain distinct;
  the BFF forwards the stable code/body and never synthesizes a manual state.
- `PRICING_IN_PROGRESS` forwards only Booking's normalized integer
  `Retry-After` (1–30 seconds); invalid raw provider values are never forwarded.
- Existing reconfirm route invokes no pricing action, but its additive server
  eligibility guard and returned `canReconfirm` prevent stale/manual bypass.

## UI evidence obligations

Playwright coverage must prove first price, tariff price, Reprice/history,
legacy history, no-rate, ambiguity, exhausted timeout/503, circuit-open, denied,
malformed, validation, conflict, and in-progress states. Assertions include
exact line order/value/source IDs, total presence only for a selected priced
snapshot, current/previous labeling, no invented legacy fields, focus retention,
live announcements, keyboard traversal, and the required width/theme matrix.
