# Rough Wireframes — W3-04 Booking Request Completeness

## Purpose and authority

These low-fidelity concepts translate `intent-statement.md`, `scope-document.md`, and `intent-backlog.md` into one coherent Booking request experience. They extend the reviewed LinerCore Booking queue, New Booking, operational record, and recovery patterns without replacing the shared shell or pre-deciding the detailed field rules that Requirements Analysis must freeze.

Binding authority order: approved W3-04 outcome and scope → existing LinerCore Booking patterns → LinerCore master and executable shared UI → advisory UI/UX Pro Max guidance. Applicable skill guidance is retained for persistent labels, visible focus, nearby announced errors, explicit recovery, stable loading space, and responsive reflow. Marketing/hero composition, generic palettes/fonts, KPI cards/charts, spinners, amber primary calls to action, decorative effects, and alternate navigation are rejected.

## Information architecture

```text
Shared authenticated LinerCore shell
|
+-- Bookings queue (/bookings)
|   +-- New booking -> Request form (/bookings/new)
|   +-- Existing record -> Booking detail (/bookings/{id})
|
+-- Request form: create or correct the same record
|   +-- Booking and parties
|   +-- Cargo
|   +-- Route and schedule
|   +-- Equipment request
|   +-- Review and save
|
+-- Booking detail: stable route-backed views
    +-- Overview: request, completeness, reference status, schedule provenance
    +-- Charges: pricing basis, itemised charges, retry/manual state
    +-- Journey: unchanged approved movement surface
    +-- Activity: lifecycle and correction evidence
```

The form contains no physical container identifier. Consignee, notify party, and volume are visibly optional. Requested departure is editable; carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline are read-only facts from the selected voyage.

## Screen A — New Booking, desktop concept

```text
+--------------------------------------------------------------------------------------------------+
| Skip to main content                                                                             |
+------------------+-------------------------------------------------------------------------------+
| LinerCore        | Top bar: environment | global status | help | user                             |
| Overview         +-------------------------------------------------------------------------------+
| Booking *        | Home / Bookings / New booking                                                  |
| Charge Agreements|                                                                               |
| Container Move.  | New booking                                                     Draft outcome |
| Reference Data   | Enter a commercially complete FCL-dry booking request.                          |
|                  |-------------------------------------------------------------------------------|
|                  | FORM (two-thirds)                              REVIEW (one-third, sticky)       |
|                  |                                                                               |
|                  | Booking and parties                            Completeness                    |
|                  | Booking customer* [Search canonical party v]   0 required items missing        |
|                  | Customer reference* [______________________]   or linked missing-item list     |
|                  | Shipper*         [Search canonical party v]                                    |
|                  | Consignee        [Optional party v]            Parties                         |
|                  | Notify party     [Optional party v]            Customer / shipper / optional   |
|                  |-------------------------------------------------------------------------------|
|                  | Cargo                                         Cargo                           |
|                  | Description*      [________________________]   Commodity / packages / measures |
|                  | Commodity*        [Code — name v]                                              |
|                  | Packages* [___]  Type* [v]                                                     |
|                  | Gross weight* [_______] Unit* [v]              Route and schedule               |
|                  | Volume [_______] Unit [v] (optional)           POL -> POD / requested date      |
|                  |-------------------------------------------------------------------------------|
|                  | Route and schedule                              Voyage schedule                 |
|                  | POL* [UN/LOCODE — name v]  POD* [v]            Carrier voyage / ETD / ETA      |
|                  | Requested departure* [POL-local date]          Cutoff / documentation deadline |
|                  | Voyage* [carrier voyage — route v]             Source: selected live voyage    |
|                  | Derived schedule (read-only, source labelled)                                   |
|                  | Carrier voyage | ETD | ETA | Cargo cutoff | Documentation deadline             |
|                  |-------------------------------------------------------------------------------|
|                  | Equipment request                              Equipment                       |
|                  | Equipment type* [ISO type — name v]            Quantity x type; unassigned     |
|                  | Quantity*       [positive number]                                               |
|                  | No container number is assigned at this stage.                                  |
|                  |-------------------------------------------------------------------------------|
|                  | Review and save                                                                 |
|                  | [Cancel]                                                     [Save draft]      |
+------------------+-------------------------------------------------------------------------------+
```

Interaction notes:

- Canonical controls commit only a selected option; typed but unselected text is not a value.
- Selecting a voyage derives and labels schedule facts. Changing POL/POD or requested departure makes incompatible voyage/pricing evidence visibly stale and requires reselection or repricing.
- The desktop summary links missing items back to their fields. At smaller widths it becomes an inline Review and save section.
- `Save draft` remains available when recoverable provider checks fail if the server can safely persist the entered request; confirmation completeness is enforced later.

Accessibility note: one `h1` inside `main`; shell `header`/`nav` remain outside the page form; five labelled semantic groups; keyboard entry starts at Booking customer after the skip link and page heading; linked error summary receives focus only after a blocked submit.

## Screen B — New Booking, mobile concept

```text
+------------------------------------------+
| Skip to main content                     |
| [Menu] LinerCore            [Status][User]|
+------------------------------------------+
| Bookings / New booking                   |
| New booking                              |
| Draft outcome                            |
|------------------------------------------|
| Booking and parties                      |
| Booking customer*                        |
| [Search canonical party.............. v] |
| Customer reference*                      |
| [......................................] |
| Shipper*                                 |
| [Search canonical party.............. v] |
| [Show optional parties]                  |
|------------------------------------------|
| Cargo                                    |
| Description* [........................]  |
| Commodity*   [Code — name............ v] |
| Packages* [....]  Type* [............ v] |
| Gross weight* [....] Unit* [.......... v]|
| Volume [........] Unit [.............. v]|
|------------------------------------------|
| Route and schedule                       |
| POL* [code — name..................... v]|
| POD* [code — name..................... v]|
| Requested departure* [YYYY-MM-DD]        |
| Voyage* [carrier voyage — route....... v]|
| Derived schedule                         |
| ETD / ETA                                |
| Cargo cutoff / Documentation deadline   |
| Source: selected live voyage             |
|------------------------------------------|
| Equipment request                        |
| Type* [ISO type — name................ v]|
| Quantity* [............................] |
| No container is assigned yet.            |
|------------------------------------------|
| Review and save                          |
| Missing: none / linked missing list      |
| [Cancel]                                 |
| [Save draft                            ] |
+------------------------------------------+
```

Responsive notes: one column at 375/390 px; touch targets at least 44 px; no sticky action that can cover the software keyboard; optional parties use an accessible disclosure, not hidden meaning; schedule values wrap without truncating zone/authority information.

Accessibility note: one `h1`, `main` and semantic form groups; mobile menu follows shared-shell focus trapping; natural keyboard order follows visual order; every input retains a persistent label and error association.

## Screen C — Booking detail Overview, desktop concept

```text
+--------------------------------------------------------------------------------------------------+
| Shared LinerCore shell                                                                            |
+------------------+-------------------------------------------------------------------------------+
| Booking *        | Bookings / BKG-...                         [Draft] Revision 2                   |
|                  | Northstar Retail                                                               |
|                  | Next: References must be validated   [Validate references] [More actions]     |
|                  | Overview | Charges | Journey | Activity                                        |
|                  |===============================================================================|
|                  | Completeness and blocker                                                        |
|                  | Ready for validation / 3 items need correction    [Correct booking]             |
|                  |-------------------------------------------------------------------------------|
|                  | Commercial request                                                            |
|                  | Customer + reference | Shipper | Consignee (optional) | Notify (optional)       |
|                  | Description | Commodity | Packages | Gross weight | Volume (optional)          |
|                  |-------------------------------------------------------------------------------|
|                  | Route and requested schedule                                                   |
|                  | [POL] -------- carrier voyage -------- [POD]                                    |
|                  | Requested departure: POL-local date                                             |
|                  | Derived snapshot: ETD | ETA | Cargo cutoff | Documentation deadline            |
|                  | Authority: live voyage / snapshotted at confirmation / stale warning            |
|                  |-------------------------------------------------------------------------------|
|                  | Equipment request                         Reference validation                   |
|                  | 3 × 22G1 — unassigned                     [Valid / Blocked / Degraded]            |
|                  | No physical container assigned.           Checked time; show individual checks  |
|                  |-------------------------------------------------------------------------------|
|                  | Pricing summary                                                             >  |
|                  | Not requested / Pending / Itemised total + authority / Provider error           |
|                  | [Open Charges]                                                                  |
|                  |-------------------------------------------------------------------------------|
|                  | Technical details (collapsed)                                                   |
+------------------+-------------------------------------------------------------------------------+
```

Only one primary next action appears. The Overview answers whether the request is complete and trustworthy; Charges owns detailed money; Journey remains the approved movement view; Activity owns lifecycle and migration/correction evidence. Technical transport identifiers stay collapsed.

Accessibility note: record identity is the `h1`; Overview is an `h2`; route-backed views are a labelled navigation list with `aria-current`; keyboard entry reaches Back, the primary next action, view links, then Overview sections in DOM order.

## Screen D — Booking detail Overview, mobile concept

```text
+------------------------------------------+
| [Menu] LinerCore            [Status][User]|
+------------------------------------------+
| Bookings / Booking                       |
| [Back to bookings]                       |
| BKG-...                                  |
| Northstar Retail                         |
| [Legacy incomplete] Revision 1           |
| 5 required facts need correction         |
| [Correct booking                       ] |
| [More actions]                           |
| Overview Charges Journey Activity        |
|==========================================|
| Completeness                             |
| [!] Booking customer missing             |
| [!] Commodity missing                    |
| [!] Voyage deadline unavailable          |
|------------------------------------------|
| Commercial request                       |
| Shipper / cargo facts / optional values  |
|------------------------------------------|
| Route and schedule                       |
| o USNYC — New York                       |
| | Requested 2026-08-20 (POL local)       |
| | Voyage/schedule needs selection        |
| o NLRTM — Rotterdam                      |
|------------------------------------------|
| Equipment request                        |
| 3 × 22G1 — unassigned                    |
|------------------------------------------|
| Reference validation [Blocked]           |
| [Show checks]                            |
| Pricing [Unavailable until complete]     |
| Technical details (collapsed)            |
+------------------------------------------+
```

Accessibility note: one `h1` and one `main`; status never relies on color; missing-item links name the target field; the full-width primary recovery appears before secondary disclosures and remains reachable without horizontal scrolling.

## Screen E — Same-record correction checkpoint

```text
+--------------------------------------------------------------------------------+
| Correct booking BKG-...                                      [Revision 1]       |
| Your existing facts are preserved. Complete the items below before validation. |
|--------------------------------------------------------------------------------|
| Error summary / completeness links                                               |
| 1. Booking customer is required.                                                 |
| 2. Select a canonical commodity.                                                 |
| 3. Select a voyage with complete schedule facts.                                 |
|--------------------------------------------------------------------------------|
| The same five form sections appear with authoritative legacy values prefilled.   |
| Unknown legacy values are labelled "Needs review"; no value is invented.        |
|--------------------------------------------------------------------------------|
| [Cancel and keep current revision]                           [Save correction]   |
+--------------------------------------------------------------------------------+
```

Correction edits the existing record; it never routes to an empty New Booking form. On optimistic conflict, entered changes remain visible, the latest revision is offered for review, and the command is not silently replayed.

Accessibility note: the correction heading is `h1`; status message is associated with the form; on blocked save, focus moves to the linked summary; on conflict, focus moves to the conflict heading and the original command is not resubmitted.

## Screen F — Confirmation checkpoint

```text
+--------------------------------------------------------------+
| Confirm this booking?                                        |
|--------------------------------------------------------------|
| Confirming commits the reviewed request and pricing snapshot |
| and publishes the approved route/equipment state downstream. |
|                                                              |
| Booking        BKG-...                                       |
| Customer       Northstar Retail                              |
| Route          USNYC -> NLRTM / LC002E                       |
| Schedule       Requested date + derived snapshot             |
| Equipment      3 × 22G1 — no container assigned              |
| Pricing        Authoritative itemised total and basis         |
|                                                              |
| [Cancel]                                    [Confirm booking] |
+--------------------------------------------------------------+
```

Confirmation is unavailable if required facts, live reference validity, schedule authority, or pricing evidence are incomplete. The downstream explanation never claims party/cargo expansion of `booking.confirmed`.

Accessibility note: dialog has a labelled heading, descriptive summary, trapped focus, Escape-to-cancel before submission, initial focus on Cancel, and restored focus to the trigger; progress and final result are announced once.

## State inventory and presentation matrix

| State | Request form | Detail / command surface | Recovery and preservation |
|---|---|---|---|
| Loading | Stable field and summary Skeletons | Stable record header and active-view Skeleton | No blank page or spinner-only state |
| Empty/untouched | Grouped empty form; Save disabled until minimally safe | N/A | Cancel returns to validated queue context |
| Permission denied | No editable protected form | Approved denial composition; no protected facts | Return/request access only when supported |
| Local validation blocked | Linked summary plus nearby errors | Completeness blocker with Correct booking | Preserve all entries; focus summary |
| Canonical reference invalid/stale | Committed value remains visible and marked | Confirmation blocked; last check and affected facts shown | Reselect/retry without clearing unrelated data |
| Reference provider degraded | Affected selectors unavailable; other entry remains usable | Degraded warning; dependent lifecycle action blocked | Retry only affected reference read; preserve values |
| Draft save pending | Frozen submitted values; stable busy button | N/A until response | Ignore duplicates; preserve request identity |
| Draft save outcome uncertain | Inline warning | Existing draft found or check remains pending | Check using same request identity; never create blindly |
| Draft saved | Redirect to same record | Draft status and Validate next action | Polite success and focused record heading |
| Legacy incomplete | Existing authoritative facts prefilled; missing facts explicit | Legacy incomplete blocker and Correct booking | Same-record correction; no invented defaults |
| Optimistic conflict | Current edits remain visible | Conflict heading; latest revision available | Review latest; never auto-replay state change |
| Validation pending | Form unavailable for simultaneous conflicting edit as policy requires | Draft badge retained; one busy action | One announcement; no duplicate activation |
| Validation blocked | Correction fields retain values | Specific blocker and Correct booking | Link to same-record fields |
| Pricing pending | Request form unchanged | Charges state and Refresh status, not a second request | Preserve exact pricing basis and request identity |
| Pricing no-rate/manual | Request facts remain available | Charges explains manual state and real next owner/action | No dead action or guessed price |
| Pricing provider error | Request facts remain available | Inline error near pricing action | Retry when safe; preserve record/tab/list context |
| Priced | N/A | Itemised basis in Charges; Confirm as sole next action | No browser-calculated authoritative total |
| Confirmation pending | N/A | Dialog closes into stable Confirming action state | Reuse same command identity after uncertainty |
| Confirmation conflict/rejection | N/A | Focused command error or revision conflict | Preserve reviewed record; do not republish blindly |
| Confirmed | N/A | Success status; schedule/pricing snapshot visible | View/check Journey; Activity records transition |
| Not found/unavailable | N/A | Approved terminal/retry composition | Preserve validated return context; hide unsafe details |

## Responsive and accessibility contract

| Width | Form | Detail | Evidence expectation |
|---:|---|---|---|
| 375/390 px | One column, inline summary, stacked actions, 44 px targets | One-column facts, vertical route, scrollable view labels only if localized | No page overflow; labels/errors/status retain meaning |
| 768 px | One column; paired fields only when each remains usable | Two-column facts where stable | Keyboard order matches reflow |
| 1024 px | Form/summary split when summary has adequate width | Two/three-column operational facts | No clipped schedules, money, or commands |
| 1440 px | Two-thirds form plus sticky one-third review | Compact record header and dense Overview | Content remains operational, not decoratively stretched |

Across all widths: one `h1`, skip link and `main`, persistent labels, visible shared focus ring, semantic status text, error associations, controlled live regions, reduced motion, light/dark WCAG 2.1 AA contrast, and no sensitive values in diagnostics.

## Scope guardrails

- No shipping instructions, reefer/DG, multi-leg route, allocation, cancellation, physical assignment, or external portal surface.
- No party/cargo widening of the downstream confirmation event is implied by the detail view.
- No new shared primitive, shell behavior, token, or page override is approved by this rough concept; cross-domain gaps route to W2-02/LinerCore ownership later.
- Refined visual treatment, exact copy, field lengths/precision, authorization rules, and component specifications remain for approved Requirements Analysis, User Stories, and Refined Mockups.

