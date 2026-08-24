# Interaction Spec — W3-04 Booking Request Completeness

## Navigation & Shell Context

W3-04 lives under the Booking entry of the single authenticated LinerCore shell. The shell owns top bar, module navigation, responsive navigation drawer, user/session controls, sign-out, breadcrumbs, skip link, and global status. Booking owns only the routed content and domain workflow.

Primary arrival paths:

- Booking queue → **New booking request**
- Booking queue → open an existing record
- Safe deep link to a permitted Booking record/view
- Legacy `/bookings...` compatibility link → equivalent `/booking...` location

Breadcrumbs are `Booking / New request`, `Booking / {booking reference}`, or `Booking / {booking reference} / Correct`. A validated `returnTo` preserves queue filter/page/sort context. Authentication and server authorization are real; no hardcoded user, role, or record existence hint is allowed.

Source authority: this specification refines `ideation/rough-mockups/wireframes.md` and `ideation/rough-mockups/user-flow.md`, covers `inception/user-stories/stories.md`, implements `inception/requirements-analysis/requirements.md`, and follows `inception/practices-discovery/team-practices.md`. Page interaction follows the approved `docs/ui-ux-design/25-booking-request-completeness.md` and LinerCore authority.

## Screens & Routes

Routes remain proposals for Application Design; this stage does not modify route contracts.

| Route | Type | Purpose |
| --- | --- | --- |
| `/booking` | List | Search/filter/sort/page Booking operations; open/new actions; retain list context |
| `/booking/new` | Create | Five-group W3-04 request form and explicit draft save |
| `/booking/{id}` or `?tab=overview` | Detail | Default operational overview, completeness, schedule, equipment request, one next action |
| `/booking/{id}/correct` | Correction proposal | Edit the same record/revision; Application Design may choose an explicit correction mode instead |
| `/booking/{id}?tab=charges` | Detail view | Current/prior pricing evidence and provider recovery |
| `/booking/{id}?tab=journey` | Detail view | Pending assignment and later real journey evidence |
| `/booking/{id}?tab=activity` | Detail view | Lifecycle and privacy-safe activity evidence |
| `/bookings...` | Compatibility | Redirect/thin-delegate to the equivalent canonical `/booking...` route |

Overview is the unknown-tab fallback. The stable view order is Overview, Charges, Journey, Activity. Views are links in a labeled navigation region with `aria-current="page"`, not a client-only ARIA tab widget. Preserve validated `returnTo` and known `tab` context across recovery.

## List Page Spec

The existing approved Booking queue remains the list pattern; W3-04 does not redesign it.

### Columns

- Booking reference
- Booking customer
- POL → POD
- Requested departure
- Lifecycle status
- Attention/completeness state
- Last updated where supported by the approved queue contract

### Controls

- Existing search/filter/sort/pagination behavior from design 10
- **New booking request** only for users with create permission
- Row/open link only where read authorization permits
- No W3-04 bulk cancel, allocation, roll, split, assignment, or export action

### W3-04 attention states

- Incomplete / legacy incomplete
- Reference attention
- Schedule incomplete/stale
- Pricing pending/manual/reprice required
- Confirmation-ready
- Confirmed / inspect

Status uses text plus semantic token/icon. Empty filtered results retain filters and offer Clear filters; an empty dataset offers New request only if authorized. Loading uses table-shaped Skeletons. Service/permission/not-found behavior follows approved Booking recovery design 13 and exposes no protected record facts.

## Detail Page Spec

### Record header

- Back link restores validated queue context.
- Booking reference is the `h1` once persisted.
- Completeness and lifecycle status are distinct labeled badges.
- Summary line: authorized customer label, POL → POD, requested departure, carrier ETD when current, equipment type × quantity.
- Exactly one authorized next action appears in the action region.

### One-next-action precedence

| Highest applicable condition | Primary behavior |
|---|---|
| Session/record denied | Sign in or return safely; no record facts |
| Confirmed/terminal | Inspect only |
| Save/price/confirm pending or outcome unknown | Refresh status with existing identity |
| Explicit unavailable/timeout and operation not accepted | Retry once with existing identity |
| Manual/no-rate/pricing validation | Correct |
| Malformed provider response | Inspect safe correlated error |
| Revision/provider conflict | Refresh latest |
| Incomplete/invalid/stale/legacy/reprice-required | Correct |
| Complete but not currently validated | Validate |
| Validated without authoritative current price | Price |
| Complete, validated, current price | Confirm |

If the user lacks permission for the selected mutation, that action is absent; no lower-precedence mutation is substituted. Safe read-only inspection remains.

### Stable detail views

**Overview**

- Completeness summary and missing/invalid reasons
- Booking customer/reference and party roles
- Cargo, commodity, packages, weight, optional volume
- Requested departure and derived schedule/provenance/variance
- Equipment request with physical assignment pending
- Reference validation status
- Collapsed privacy-safe Technical details

**Charges**

- Pricing readiness and exact current request context
- Current/prior immutable pricing snapshots
- Itemized quantity-scaled lines and authoritative total only when complete
- Pending, unknown, no-rate/manual, validation, commodity-ineligible, denied, unavailable/timeout, malformed, conflict, replay, and reprice-required behavior

**Journey**

- Before later assignment: requested equipment type/count and “Physical assignment pending”
- No container rows, IDs, or physical journeys are synthesized
- Later real evidence remains owned by CMM and later intent scope

**Activity**

- Persisted lifecycle events with meaningful label and timestamp
- Privacy-safe actor/outcome evidence according to authorization
- Correlation and technical details remain collapsed and safe

## States

Every state preserves permitted request, route, tab, and list context.

| State | Visible response | Focus/announcement | Recovery |
|---|---|---|---|
| Initial/untouched | Labeled empty form; no errors | Normal reading order | Begin entry |
| Queue empty dataset | EmptyState explains that no bookings exist; New booking request appears only when authorized | Normal reading order; no assertive announcement | Create or return safely |
| Queue filtered empty | EmptyState distinguishes no filter matches from no data | Results status is polite; focus remains on the invoking filter action | Clear or change filters |
| Routed loading | Stable PageHeader/section Skeletons | Region busy; completion polite, no focus theft | Await |
| Reference loading | Affected control Skeleton/disabled truthfully | `#reference-status` announces loading; focus does not move | Await |
| Partial reference failure | Affected sets named; other controls usable | Passive failure does not move focus; Retry result focuses `#reference-status` | Retry affected authority |
| All reference failure | Page strip plus exact groups unavailable | Passive failure does not move focus; Retry result focuses `#reference-status` | Retry or return safely |
| No matches | “No active matches” via Combobox `emptyLabel` | Existing listbox semantics; no custom option-count claim | Change search; no free-text commit |
| Stale/inactive reference | Stale evidence retained at field | Field is described by `#reference-status`; Refresh result focuses it | Refresh/Correct |
| Voyage mismatch | Voyage-linked route error | Error linked to control | Choose compatible voyage |
| Partial/invalid schedule | Missing facts and provenance state | Passive resolution does not move focus; Refresh result focuses `#schedule-status` | Save draft; refresh/Correct; confirm blocked |
| Client/server validation blocked | Linked summary plus fields | Focus `#booking-errors` heading after action | Correct |
| Save pending | Busy primary; duplicate disabled | “Saving draft” polite | Await |
| Save outcome unknown | No optimistic success | Focus `#save-status` | Refresh same identity; no resubmit |
| Save unavailable/timeout, not accepted | Recoverable state | Focus `#save-status` | Retry once, same identity |
| Saved | Authoritative reference and record link | After navigation, focus record `h1#booking-record-title` | Inspect |
| Duplicate replay | Existing recorded result | After navigation, focus `h1#booking-record-title` | Inspect existing record |
| Idempotency conflict | ConflictStrip | Programmatically focus `#record-conflict` | Refresh authoritative state |
| Revision/concurrent conflict | Latest-versus-edits safe context | Programmatically focus `#record-conflict` | Refresh; explicitly reapply |
| Legacy incomplete | Exact missing facts | Heading/status describes state | Correct same record |
| Read-only | Evidence only; no mutation | Normal reading order | Inspect/return |
| Denied/session boundary | Safe FailureState | Focus `h1#booking-page-status` | Sign in/return; no protected facts |
| Reference validation pending | Current facts and operation status | Focus stays on Validate; Refresh result focuses `#booking-completeness-status` | Await/Refresh existing operation |
| Commodity ineligible | Provider reason linked to commodity | Focus `#booking-errors` after attempted Validate/Price/Confirm | Correct; Validate before Price |
| Pricing pending/in progress | Request reference and no second command | Focus remains on Price while request starts; later Refresh focuses `#pricing-status` | Refresh/poll same identity |
| Pricing outcome unknown | Confirmation blocked | Focus `#pricing-status` | Refresh same identity |
| No rate/manual | Provider safe reason; no amount | Focus `#pricing-status` | Correct; no auto-retry |
| Pricing validation | Provider field/reason mapping | Focus `#booking-errors` | Correct, Validate, Price |
| Pricing denied | Safe permission boundary | Focus `#pricing-status` | No protected retry |
| Pricing unavailable/timeout, not accepted | Recoverable state | Focus `#pricing-status` | Retry once, same identity |
| Malformed pricing response | Safe correlated contract failure | Focus `#pricing-status` | Inspect; confirmation blocked |
| Pricing conflict | ConflictStrip | Focus `#record-conflict` | Refresh latest |
| Pricing replay | Recorded outcome | Focus `#pricing-status` | Follow recorded outcome |
| Reprice required | Prior snapshot marked historical | Status | Price current revision |
| Confirmation pending | Dialog/action busy; duplicate disabled | Focus remains on Confirm booking in the Dialog | Await |
| Confirmation outcome unknown | No optimistic confirmed state | Focus `#booking-confirmation-status` | Refresh same identity |
| Confirmation conflict | Current state retained | Focus `#record-conflict` | Refresh latest |
| Confirmed | Confirmed summary; assignment pending | Focus/announce `#booking-confirmation-status` heading | Inspect |
| Service unavailable | Current content plus safe correlation | Focus the status heading for the invoked command: `#reference-status`, `#schedule-status`, `#save-status`, `#pricing-status`, or `#booking-confirmation-status` | Bounded Retry/Refresh |
| Not found/protected absence | Existence-safe FailureState | Focus `h1#booking-page-status` | Return to Booking |

## Design System Usage

Reuse shared shell and `@erp/ui`:

- Navigation/framing: `Breadcrumbs`, `PageHeader`, `RecordHeader`, `RouteTabs`
- Layout: `Stack`, `Inline`, `Card`, `DefinitionList`
- Input: `Field`, `Input`, `Select`, `Combobox`, `Button`; required shared `TextArea`/count support is an explicit UI Platform dependency
- Feedback/evidence: `StatusStrip`, `Badge`, `StatusBadge`, `Skeleton`, `PartialDataNotice`, `ConflictStrip`, `FailureState`
- Confirmation/diagnostics: `Dialog`, `TechnicalDetails`, `IdentifierValue`, `CopyButton`
- Icons: shared `LucideIcon` mappings

Use `--erp-*` tokens only, including `--erp-font-sans` (IBM Plex Sans/system stack) and `--erp-focus-ring`. No local hardcoded color, shadow, type scale, shell, copied primitive, emoji icon, or dark-default theme.

Existing shared behavior used by W3-04 and required shared dependencies:

- Cargo description requires a shared multiline `TextArea` plus token-consistent visible count/guidance. Executable `@erp/ui` does not currently expose that primitive, so this is a W2-02/UI Platform implementation dependency. W3-04 must not fork it locally or silently substitute a single-line `Input`.
- `Combobox` supplies query filtering, committed options, visible `emptyLabel`, invalid/described-by wiring, keyboard operation, full-Field width, long-label wrapping, and a 240px vertically scrollable list. Booking composes loading/authority status with `Skeleton`/`StatusStrip`, stale evidence with `DefinitionList`/`StatusStrip` plus a replacement Combobox, Field-width horizontal containment, and at least 256px block-end page space below the final reference field. No collision/flip or custom option-count/selection announcement is claimed.

Booking-owned compositions remain in Booking: RequestForm, ReferenceFieldState, CarrierScheduleEvidence, CompletenessSummary, NextAction, ConfirmationImpact, and route-backed domain views.

## Domain-True Forms

### Booking and parties

| Canonical field | Interaction |
|---|---|
| `bookingCustomerPartyId` | Required active Party/Customer combobox |
| `customerBookingReference` | Required 1–64 NFC text input |
| `shipperPartyId` | Required role-aware party combobox |
| `consigneePartyId` | Optional role-aware party combobox |
| `notifyPartyId` | Optional role-aware party combobox |

### Cargo

| Canonical field | Interaction |
|---|---|
| `cargoDescription` | Required 1–500 NFC text in the shared multiline `TextArea`; control characters rejected; visible Field guidance/count is adjacent and is not announced on every keystroke |
| `commodityId`, `commodityCode` | Required canonical Commodity combobox |
| `packageCount` | Integer input 1–999,999 |
| `packageTypeId`, `packageTypeCode` | Required controlled package-type combobox |
| `grossWeight.value`, `.unit` | Positive decimal 18,3 with fixed KGM |
| `volume.value`, `.unit` | Optional positive decimal 18,3 with fixed MTQ; both null or both present |

### Route and schedule

| Canonical field | Interaction |
|---|---|
| `portOfLoadingUnLocode`, `portOfDischargeUnLocode` | Required distinct active location comboboxes |
| `requestedDepartureDate` | Required POL-local date input |
| `voyageId`, `voyageVersion` | Required compatible active voyage combobox |
| Carrier voyage, ETD, ETA, cargo cutoff, documentation deadline | Read-only derived evidence with source/version; never guessed |

POL/POD constrains voyage options. Requested departure informs explanation/order without an unapproved tolerance. The UI shows requested date and carrier ETD together and explains calendar variance.

### Equipment request

| Canonical field | Interaction |
|---|---|
| `equipmentTypeCode` | Required active canonical equipment-type combobox |
| `quantity` | Integer input 1–9,999 |
| `equipmentId` | No initial control; null until later physical assignment |
| `currency` | Fixed read-only USD |
| Cargo mode/indicators | Fixed FCL dry, non-reefer, non-DG |

### Review and actions

New primary: **Save draft**. Correction primary: **Save corrections**. Secondary: **Cancel**. Dirty Cancel uses the shared discard dialog. Server errors preserve all permitted entries. Any pricing-basis edit visibly creates Reprice required.

## Accessibility & Responsiveness

WCAG 2.1 AA is the binding LinerCore and approved-requirements baseline. Individual WCAG 2.2 techniques may be used as advisory good practice only; they do not add acceptance scope. The detailed checklist is `accessibility-checklist.md`.

- One `h1`; logical group headings/legends and landmarks; shell skip link to main.
- Persistent labels; active hint/error IDs only; native HTML first.
- Keyboard-complete combobox, link navigation, actions, disclosure, and Dialog behavior.
- Failed validation focuses `#booking-errors`; conflicts focus `#record-conflict`; save navigation focuses `h1#booking-record-title`; confirmation success focuses `#booking-confirmation-status`. Normal async completion does not steal focus.
- Dedicated polite regions for option/schedule/save/price/confirm progress; assertive only for blocking action failures. Never put `aria-live` on the entire form.
- Text/icon/semantic tone for every status; no color-only meaning.
- 44x44px mobile targets, reduced motion, unclipped `--erp-focus-ring`, 200% zoom/reflow, forced-colors and light/dark contrast verification.

| Width | Behavior |
|---|---|
| 375/390 | One column, 16px gutter, full-width in-flow actions, scrollable view links if localized |
| 768 | One column; two-up fields only when each remains at least 260px; inline Review |
| 1024 | Form/rail grid only if form remains at least 640px; otherwise stack |
| 1440 | Main about 760px plus 280–340px review rail inside 1180px |

No page-level horizontal scroll. Each Combobox list is the width of its in-gutter Field, long labels wrap, and the 240px list scrolls vertically. Booking reserves at least 256px of document space below the final reference field so the page can scroll the below-input list into view; automatic collision/flip behavior is not part of the shared contract. Meaningful codes/quantities remain visible.

## Component specifications

### BookingRequestForm

| Field | Value |
|---|---|
| Component | `BookingRequestForm` |
| Description | Booking-owned five-group create/correct composition |
| Category | Input/layout |

**States:** untouched, dirty, reference-loading, validation-blocked, save-pending, outcome-unknown, recoverable-error, conflict, saved, read-only.  
**Inputs:** mode (new/correct), permitted actions, canonical current record/revision, governed option state, server field/state results. Exact props are Application Design work.  
**Responsive:** rail at usable 1024/1440; inline Review at 375/390/768.  
**Accessibility:** form/fieldset semantics, linked summary, no whole-form live region, dirty-discard focus restoration.

### ReferenceFieldState

| Field | Value |
|---|---|
| Component | `ReferenceFieldState` |
| Description | Booking composition around shared Field/Combobox and Reference Data authority |
| Category | Input/feedback |

**States:** loading, available, no-match, stale, inactive, unavailable, invalid role/version.  
**Inputs:** canonical set/role, current ID/version, search state, governed options/failure.  
**Responsive:** list inherits the in-gutter Field width, caps at 240px with vertical scrolling, and wraps long labels. Booking provides block-end page space; no collision/flip claim.
**Accessibility:** existing combobox keyboard/listbox contract; unmatched text is not committed. `emptyLabel` is visible for no-match. Booking-owned `#reference-status` announces loading, stale/authority failure, and explicit Retry/Refresh results; no custom option-count or selection-change live announcement is required.

### CarrierScheduleEvidence

| Field | Value |
|---|---|
| Component | `CarrierScheduleEvidence` |
| Description | Read-only requested-versus-derived schedule and provenance panel |
| Category | Display/feedback |

**States:** unselected, loading, complete/same-date, complete/variance, partial, stale, inactive, route-mismatch, temporal-invalid.  
**Inputs:** requested POL-local date, voyage/version/source, derived instants, authority state.  
**Responsive:** two-column definition rows when usable; label-over-value stack on mobile.  
**Accessibility:** machine-readable datetimes, visible timezone, concise resolution announcement, no warning solely for variance.

### BookingNextAction

| Field | Value |
|---|---|
| Component | `BookingNextAction` |
| Description | Renders exactly one server-authorized lifecycle action or safe inspection state |
| Category | Navigation/action/feedback |

**States:** inspect, refresh, retry, correct, validate, price, confirm, unavailable/read-only.  
**Inputs:** authoritative record/provider condition, permission result, operation identity.  
**Responsive:** action remains visible in header/readiness composition and stacks without becoming fixed on mobile.  
**Accessibility:** explicit action label, busy/disabled semantics, result focus, same-identity recovery copy.

### BookingConfirmationImpact

| Field | Value |
|---|---|
| Component | `BookingConfirmationImpact` |
| Description | Shared Dialog composition summarizing confirmation scope and pending assignment |
| Category | Feedback/action |

**States:** closed, review, pending, outcome-unknown, error.  
**Inputs:** booking reference/revision, customer, route/schedule, equipment type/quantity, pricing authority, permitted confirm.  
**Responsive:** Dialog content reflows without nested modal or horizontal scroll.  
**Accessibility:** on open, the shared Dialog focuses its container labeled by the dialog `h2`; focus remains trapped and returns to the invoking trigger on safe close. Escape is available only when safe, duplicate commands are disabled, and progress/results are announced. Confirmation success closes/navigates and focuses `#booking-confirmation-status`.

## Open Questions

1. Confirm the detail-page view set.
   - A. Overview · Charges · Journey · Activity (approved for W3-04)
   - B. A reduced set
   - X. Other
   - `[Answer]: A — stable route-backed links on canonical `/booking/{id}`.`
2. Confirm correction navigation in Application Design.
   - A. Dedicated `/booking/{id}/correct` route sharing the same form composition
   - B. Explicit correction mode on the Overview route sharing the same form composition
   - X. Other
   - `[Answer]: Deferred to Application Design; either choice must preserve one implementation and same-record revision semantics.`
3. Confirm live visual evidence status.
   - A. Evidence captured during Refined Mockups
   - B. Environment unavailable; retain as a pre-implementation verification dependency
   - X. Other
   - `[Answer]: B — no browser backend and no Docker API access were available in this session.`
