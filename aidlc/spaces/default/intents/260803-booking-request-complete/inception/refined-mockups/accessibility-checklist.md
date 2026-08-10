# Accessibility Checklist — W3-04 Booking Request Completeness

Binding target: WCAG 2.1 AA, as required by approved NFR-007 and LinerCore. Selected WCAG 2.2 techniques may be applied as advisory good practice but do not add acceptance scope. A checked design item means it is specified, not that running implementation evidence already exists.

## Source and authority

This checklist refines `ideation/rough-mockups/wireframes.md` and `ideation/rough-mockups/user-flow.md`, covers `inception/user-stories/stories.md`, implements `inception/requirements-analysis/requirements.md`, and follows `inception/practices-discovery/team-practices.md`.

It applies `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, executable `@erp/ui`, and the approved `docs/ui-ux-design/25-booking-request-completeness.md`. Detailed surfaces and states are in `mockups.md` and `interaction-spec.md`.

## Structure and semantics

- [x] The canonical shell provides banner/navigation/main landmarks and a skip link to Booking main content.
- [x] Each screen has one `h1`; form groups and detail regions use logical heading/legend order without skipped levels.
- [x] Native elements are used first: links for navigation, buttons for commands, fieldset/legend for meaningful form groups, `dl` for label/value evidence, table only for tabular data.
- [x] Route-backed Overview/Charges/Journey/Activity is a labeled `nav` of links with `aria-current="page"`, not an ARIA tab widget.
- [x] Status and error summaries use headings/lists; visual layout does not replace document structure.
- [x] Technical details uses a native disclosure and remains collapsed by default.
- [x] Page language is provided by the shared shell.

## Forms and instructions

- [x] Every control has a persistent visible label; placeholders are examples/search prompts only.
- [x] Optional party/volume fields are visibly labeled optional; required meaning is available to assistive technology.
- [x] `aria-describedby` references exactly the active hint and/or error; IDs are unique and stable.
- [x] Cargo description is specified as a shared multiline `TextArea` with visible length guidance/count and without announcing every keystroke; executable verification remains pending the W2-02 primitive dependency.
- [x] Package count and equipment quantity use numeric input modes and remain operable without browser spinner controls.
- [x] Weight/volume labels and suffixes name fixed KGM/MTQ units; no unit is conveyed by position alone.
- [x] Requested departure label/help explicitly says POL-local calendar date.
- [x] Derived schedule facts expose visible timezone/offset and machine-readable datetimes.
- [x] The equipment section explicitly says container numbers are assigned later; no empty equipment-ID field suggests missing work.
- [x] Fixed USD/FCL dry/non-reefer/non-DG facts are readable text, not disabled unexplained controls.

## Canonical combobox behavior

- [x] Tab enters/leaves the control in normal order.
- [x] Typed text filters options but is not committed as a canonical value.
- [x] Arrow keys move the active option; Enter commits; Escape closes without destructive clearing.
- [x] Code plus label gives each option a meaningful accessible name.
- [x] Booking-owned `#reference-status` announces loading, stale/inactive or authority failure, and explicit Retry/Refresh results; messages are coalesced.
- [x] No-match uses the visible Combobox `emptyLabel`; native listbox/value semantics expose navigation and the committed value. No custom option-count or selection-change live announcement is claimed.
- [x] Long labels wrap; the list inherits the in-gutter Field width, caps at 240px, and scrolls vertically. Booking reserves at least 256px block-end page space below the final reference field; automatic collision/flip is not claimed.
- [x] Stale/inactive selected evidence remains understandable and has an explicit Refresh/Correct path.

## Keyboard and focus order

### New/correct request

1. Shell skip link and shell navigation
2. Breadcrumb/back context
3. Page status/error summary when programmatically focused after a failed action
4. Booking and parties fields
5. Cargo fields
6. Route and schedule fields
7. Carrier schedule interactive recovery, if present
8. Equipment request fields
9. Review and save content
10. Save draft/Save corrections
11. Cancel

- [x] Desktop review rail does not move focus order away from semantic form order.
- [x] Mobile visual order equals DOM/focus order.
- [x] No positive `tabIndex`; programmatic `tabIndex=-1` is limited to result/error/conflict headings.
- [x] Sticky regions never clip `--erp-focus-ring`.
- [x] Cancel discard dialog returns focus to Cancel after Keep editing/close.

### Detail and actions

1. Back to Booking
2. Record header and one next action
3. Overview/Charges/Journey/Activity links
4. Active view content
5. Current view actions/recovery
6. Collapsed Technical details

- [x] View navigation uses standard link keyboard behavior and browser Back/Forward.
- [x] Every Validate/Price/Refresh/Retry/Confirm outcome follows the exact focus table below; passive async updates never move focus.
- [x] Read-only or denied states do not leave disabled phantom commands in the tab order.

### Deterministic programmatic focus targets

| Event | Exact target |
|---|---|
| Confirmation or discard dialog opens | Shared Dialog container (`tabIndex=-1`) labeled by its `h2` |
| Failed save or validation | `#booking-errors` summary heading (`tabIndex=-1`) |
| Validate success or reference-validation Refresh | `#booking-completeness-status` heading (`tabIndex=-1`) |
| Reference Retry/Refresh result | `#reference-status` heading (`tabIndex=-1`) |
| Schedule Refresh result | `#schedule-status` heading (`tabIndex=-1`) |
| Save unknown/unavailable or Save Refresh/Retry result | `#save-status` heading (`tabIndex=-1`) |
| Save success after navigation | Record `h1#booking-record-title` (`tabIndex=-1`) |
| Price starts | Focus remains on the Price button |
| Price terminal result, including unknown, no-rate/manual, denial, unavailable, malformed, replay, or Refresh/Retry | `#pricing-status` heading (`tabIndex=-1`) |
| Idempotency, revision, pricing, or confirmation conflict | `#record-conflict` heading/container (`tabIndex=-1`) |
| Confirmation pending | Focus remains on Confirm booking in the Dialog |
| Confirmation outcome unknown or confirmation Refresh | `#booking-confirmation-status` heading (`tabIndex=-1`) |
| Confirmation success | `#booking-confirmation-status` heading (`tabIndex=-1`) |
| Denied/session-boundary/not-found route | `h1#booking-page-status` (`tabIndex=-1`) |
| Dialog closes safely | The invoking trigger, restored by shared Dialog behavior |

## Validation and errors

- [x] Untouched fields show no validation noise.
- [x] Format/range checks occur on blur/save; canonical and cross-field checks occur on save/validate.
- [x] Errors are text plus semantic styling; no red-border-only failure.
- [x] Failed save/validate focuses a summary heading; summary links focus exact controls.
- [x] Inline error text names the problem and correction, not only a code or field number.
- [x] Correcting one field removes only that obsolete error.
- [x] Server field paths and stable recovery class remain authoritative.
- [x] User entries and permitted route/tab/list context remain after errors.
- [x] Raw provider exceptions, credentials, party/customer/cargo payloads, and protected existence facts are never announced or shown.

## Async status and live regions

| Event | Live behavior | Focus behavior |
|---|---|---|
| Routed loading | Region `aria-busy`; Skeletons hidden | No focus theft |
| Passive reference options resolved/failed | `#reference-status` announces loading/failure; no count/selection announcement | Stay on current control |
| Reference Retry/Refresh result | `#reference-status` announces exact result | Move to `#reference-status` |
| Passive voyage schedule resolved/partial | `#schedule-status` names complete or missing authority | Stay on voyage |
| Schedule Refresh result | `#schedule-status` announces exact result | Move to `#schedule-status` |
| Save started | “Saving draft” polite; primary busy/disabled | Remain on primary |
| Save validation failure | Alert/linked summary | Move to `#booking-errors` |
| Save outcome unknown/unavailable or Refresh/Retry result | `#save-status` announces exact state and recovery | Move to `#save-status` |
| Save success | Concise success status and authoritative reference | Move to `h1#booking-record-title` after navigation |
| Price started | `#pricing-status` announces pending; duplicate disabled | Remain on Price |
| Price terminal result | `#pricing-status` announces outcome; malformed/denied may use alert semantics | Move to `#pricing-status`; conflict instead moves to `#record-conflict`, validation to `#booking-errors` |
| Confirmation pending | Polite progress; duplicate disabled | Remain in dialog/action context |
| Confirmation outcome unknown/Refresh | `#booking-confirmation-status` announces exact state | Move to `#booking-confirmation-status` |
| Confirmation conflict | Conflict alert | Move to `#record-conflict` |
| Confirmation success | Concise confirmed summary | Focus `#booking-confirmation-status` |

- [x] The entire form is never an `aria-live` region.
- [x] Assertive announcements are limited to blocking action failures needing immediate attention.
- [x] Repeated polling/refresh does not repeatedly announce unchanged state.
- [x] Outcome-unknown states do not announce success before authoritative confirmation.

## Dialogs and disclosures

- [x] Confirm and dirty-discard dialogs have an accessible name/description.
- [x] Focus enters the shared Dialog container labeled by its `h2`, remains trapped, and returns to the invoking trigger.
- [x] Escape closes only when no protected command is pending and closure is safe.
- [x] No nested dialog.
- [x] Confirm impact includes booking reference/revision, customer, route/schedule, equipment type x quantity, no physical assignment, and pricing authority.
- [x] Button labels are explicit: Confirm booking, Keep reviewing, Keep editing, Discard draft.
- [x] Technical disclosure summary describes its safe content; correlation copy action has a meaningful accessible label/result.

## Perceivable and non-color meaning

- [x] Text contrast target is at least 4.5:1 for normal text and 3:1 for approved large text.
- [x] UI component, focus, and meaningful graphical contrast target is at least 3:1.
- [x] Status combines readable text with token tone and/or Lucide icon.
- [x] Complete, pending, warning, blocked, stale, denied, and success remain distinguishable in forced-colors mode.
- [x] Reference/schedule provenance and pricing authority are text, not tooltip-only or icon-only.
- [x] Loading uses stable Skeletons plus region text; animation is not the only loading signal.
- [x] Light and dark themes use shared tokens, not local values.

## Responsive, reflow, and touch

| Viewport | Required evidence |
|---|---|
| 375px | One-column form, 16px gutter, full-width in-flow actions, no clipping/overflow |
| 390px | Approved Booking mobile baseline and long-option behavior |
| 768px | Stacked Review; safe two-up threshold; compact shell/drawer behavior |
| 1024px | Conditional form/rail and focus-safe sticky behavior |
| 1440px | Dense full shell, long content, main/rail and detail workbench |

- [x] Mobile interactive targets are at least 44x44 CSS px with safe separation.
- [x] At 200% zoom, every field, error, schedule fact, status, view link, and action remains available.
- [x] Text spacing override does not clip labels/buttons or hide status.
- [x] No page-level horizontal scrolling; route links/combobox popups use intentional contained overflow where necessary.
- [x] No fixed mobile action bar covers validation or review evidence.
- [x] Orientation changes preserve content and operation identity.

## Motion and timing

- [x] `prefers-reduced-motion` removes non-essential transition/pulse behavior.
- [x] No flashing or parallax.
- [x] Helpful transitions are 150–300ms and do not shift layout.
- [x] No user input timeout is introduced.
- [x] Pending provider work exposes Refresh rather than hidden endless waiting.
- [x] Repeated commands are disabled and idempotent recovery is explicit.

## Authorization and privacy

- [x] Read, create, correct, validate, price, and confirm permissions are independently reflected.
- [x] Server authorization precedes protected lookup/mutation; the UI does not imply client visibility is security.
- [x] Denied users receive no record/customer/cargo/provider existence detail.
- [x] A missing selected mutation permission does not reveal or substitute a lower-precedence action.
- [x] Diagnostics show safe stable code/correlation only and remain collapsed.
- [x] Evidence/screenshots/tests use safe data and do not capture raw sensitive payloads.

## Verification checklist

- [ ] Automated axe scan has no serious/critical findings on each required state.
- [ ] Keyboard-only new/correct/validate/price/confirm/recovery journey passes.
- [ ] NVDA on Windows verifies labels, combobox, summary links, schedule, route links, Dialog, and live regions.
- [ ] Browser zoom at 200% and 400% is inspected where applicable.
- [ ] Forced-colors and text-spacing overrides pass.
- [ ] Light/dark contrast is measured, including focus and semantic surfaces.
- [ ] Screenshots at 375/390/768/1024/1440 show no overlap, clipped focus, or page overflow.
- [ ] Reduced-motion behavior is observed.

## Evidence status and open questions

The specifications above are complete; live evidence is not. No browser backend was available and Docker API access was denied during this Refined Mockups run. Before implementation approval, capture the unchecked running-route evidence rather than converting these design checks into assumed passes.
