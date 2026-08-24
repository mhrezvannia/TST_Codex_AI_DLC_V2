# LinerCore Booking Request Completeness — Design Candidate

Status: **Advisory candidate awaiting user approval.** This document does not authorize production code, route, API, contract, shared-package, infrastructure, or AI-DLC state changes.

Intent: W3-04 Booking Request Completeness  
Canonical experience: authenticated LinerCore shell → `/booking`  
Target: one commercially usable FCL-dry booking request, one routing leg, one requested-equipment line, USD, no initial physical container assignment.

## Executive decisions

1. `/booking` remains the only canonical Booking composition. `/bookings` is a compatibility redirect or thin delegate and must not evolve a second form or detail experience.
2. The request uses five semantic groups: **Booking and parties**, **Cargo**, **Route and schedule**, **Equipment request**, and **Review and save**.
3. Initial creation and confirmation capture an equipment request of ISO type × positive quantity. They do not ask for, require, display as assigned, or fabricate `equipmentId`.
4. `requestedDepartureDate` remains the user's POL-local preference. Carrier voyage number, ETD, ETA, cargo cutoff, and documentation deadline are Reference Data-derived, read-only schedule facts. A mismatch is explained; neither value overwrites the other.
5. Canonical values come only from active Reference Data options. Typed search text is never silently accepted as a canonical party, commodity, package type, location, voyage, or equipment type.
6. Draft saving is permitted when recoverable reference or schedule authority is unavailable, but completeness, validation, pricing, and confirmation gates remain truthful. Confirmation never proceeds on guessed schedule, reference, or price data.
7. Booking detail exposes exactly one authorized lifecycle action according to the approved precedence. Lower-precedence mutations are not substituted when the selected action is unavailable or unauthorized.
8. Pricing evidence stays on the route-backed Charges view. Overview may summarize price readiness and the one next action, but it does not duplicate the detailed pricing workbench.
9. The design consumes the existing shell and `@erp/ui`. It adds no local palette, typography system, copied primitive, second shell, marketing composition, or dark-default theme.
10. The candidate targets WCAG 2.2 AA interaction behavior, which strengthens and includes the LinerCore WCAG 2.1 AA baseline.

## Evidence and authority

### Decision order

1. Approved W3-04 intent, Requirements, and User Stories
2. Security, privacy, accessibility, and enterprise technical standards
3. LinerCore `MASTER.md`, executable `@erp/ui`, and `SESSION-PROMPT.md`
4. Approved Booking queue/create/detail/recovery designs 10–13
5. UI/UX Pro Max advisory output

UI/UX Pro Max's data-dense operational-console, recovery, persistent-label, focus, Skeleton, and Next.js loading-boundary recommendations were retained. Its marketing gateway, hero/video, logo carousel, sales CTA, replacement palette, replacement font, decorative chart, and spinner-led suggestions were rejected as incompatible with LinerCore.

### Repository findings that shape this candidate

- The canonical shell currently owns `/booking`, `/booking/new`, and `/booking/[bookingId]`, plus Booking BFF routes.
- A parallel `/bookings` implementation still exists in `apps/booking`; W3-04 must converge behavior instead of extending both.
- Both current create forms still include a required physical `equipmentId`; the Booking domain also enforces quantity `1` and a valid ISO 6346 identifier. Those are brownfield gaps, not design authority.
- The shell form has `requestedDepartureDate`, but both forms expose only customer, location, voyage, and equipment option sets. W3-04 additionally needs governed party-role, commodity, package-type, and enriched voyage schedule projections.
- Current pricing and action panels already preserve idempotent retry identities, focus result messages, show Skeletons, and distinguish several provider outcomes. W3-04 extends the state vocabulary and single-next-action rule rather than discarding those behaviors.
- `@erp/ui` already provides the canonical shell-facing primitives listed later in this document.

### Live evidence limitation

The repository's browser surface reported no available browser, and the local Docker API was not accessible to this session. No live route, authenticated state, or screenshot could therefore be inspected. This candidate makes no claim of live visual verification. Live Compose, browser, keyboard, responsive, and contrast evidence remains a required pre-implementation/refined-mockup verification item.

## 1. Roles, tasks, and ownership

### Primary roles

| Role | Primary task | Permission-sensitive actions |
|---|---|---|
| Booking Desk Agent | Create, correct, validate, price, and prepare a request for confirmation | Create, correct, validate, price |
| Customer Service Agent | Reopen, explain, and correct incomplete or legacy requests | Read, correct, validate where granted |
| Booking Supervisor | Review commercial readiness, exceptions, and confirmation impact | Price, confirm where granted |
| Operational Auditor | Inspect persisted facts, lifecycle, and privacy-safe evidence | Read only |

### Ownership boundary

| Concern | Owner | W3-04 rule |
|---|---|---|
| Top bar, navigation rail/drawer, session, user menu, global status | Shared shell | Reuse unchanged; Booking does not recreate chrome |
| Request form, completeness, lifecycle composition, detail views | Booking | Domain-specific composition inside canonical shell |
| Tokens and general primitives | `packages/ui` / W2-02 | Reuse first; shared changes are dependencies, not W3-local copies |
| Party, commodity, package, location, voyage, equipment options | Reference Data | Live governed options, versions, active state, and schedule authority |
| Pricing request/result authority | Charge | Booking displays captured authoritative outcome; never guesses a total |
| Pending physical assignment | CMM | W3-04 shows requested type/count and “Pending assignment”; no container journey is invented |

## 2. Route proposal for Application Design review

These routes are proposals, not approved implementation contracts.

| Route | Purpose | Notes |
|---|---|---|
| `/booking` | Operations queue | Preserve approved design 10 and list context |
| `/booking/new` | New request | Five-group W3-04 form |
| `/booking/{bookingId}` or `?tab=overview` | Overview | Default view; completeness, request, schedule, equipment request, one next action |
| `/booking/{bookingId}/correct` | Same-record correction | Proposed explicit edit route; must preserve revision and all accepted facts |
| `/booking/{bookingId}?tab=charges` | Charges | Canonical-base adaptation of approved route-backed view; authoritative pricing workbench and history |
| `/booking/{bookingId}?tab=journey` | Journey | Canonical-base adaptation of approved route-backed view; pending assignment until later physical evidence exists |
| `/booking/{bookingId}?tab=activity` | Activity | Canonical-base adaptation of approved route-backed view; lifecycle and safe audit evidence |
| `/bookings...` | Compatibility | Redirect/delegate to matching canonical `/booking...` location |

Application Design must confirm whether correction is a dedicated route or an explicitly modeled mode of Overview. It must not become a replacement draft or a second form implementation. The four detail views remain stable link navigation in the order Overview, Charges, Journey, Activity; preserve validated `returnTo` and `tab` context, and fall back to Overview for an unknown tab.

## 3. End-to-end task flow

```text
Booking queue
  → New booking request OR open existing incomplete request
  → Enter Booking and parties
  → Enter Cargo
  → Select route and requested departure
  → Select a compatible voyage; inspect derived schedule and variance
  → Enter equipment type × quantity; observe USD / FCL dry constraints
  → Review and save draft
  → Reopen the same persisted record
  → Correct missing/stale facts when required
  → Validate canonical current facts
  → Price the exact current request on Charges
  → Review confirmation impact
  → Confirm once
  → Inspect confirmed record with equipment assignment still pending
```

The journey returns to the same record after every recoverable failure. Queue query/page/filter context is retained when the user returns to `/booking`.

### One-next-action precedence on detail

1. Sign in or return safely when session/record access is denied.
2. Inspect when confirmed or terminal.
3. Refresh status when save, price, or confirm acceptance is pending/unknown.
4. Retry once with the same identity only after explicit unavailable/timeout with no accepted operation.
5. Correct after manual/no-rate/pricing validation.
6. Inspect the safe correlated error after malformed provider response.
7. Refresh latest after revision/provider conflict.
8. Correct when incomplete, invalid, stale, legacy-incomplete, or pricing-basis changed.
9. Validate when complete but not current.
10. Price when validated without an authoritative current price.
11. Confirm when complete, current, validated, and authoritatively priced.

Only the first applicable authorized action is presented as the primary lifecycle command.

## 4. Request form specification

### Group 1 — Booking and parties

| Field | Control | Required | Behavior |
|---|---|---:|---|
| Booking customer | Canonical searchable `Combobox` | Yes | Active `PARTY_CUSTOMER`; persist ID plus minimum governed snapshot |
| Customer booking reference | `Input` | Yes | NFC, trim outer whitespace, preserve case/internal whitespace, 1–64 characters, reject controls |
| Shipper | Canonical searchable `Combobox` | Yes | Role-aware `SHIPPER` validation |
| Consignee | Canonical searchable `Combobox` | No | Blank remains null and is not validated as missing |
| Notify party | Canonical searchable `Combobox` | No | Blank remains null and is not validated as missing |

Party results show code and display name. Sensitive detail beyond the approved minimum snapshot is neither copied into Booking nor exposed in errors/evidence.

### Group 2 — Cargo

| Field | Control | Required | Behavior |
|---|---|---:|---|
| Cargo description | Shared multiline text primitive dependency | Yes | NFC, 1–500 characters, controls rejected; visible counter near maximum |
| Commodity | Canonical searchable `Combobox` | Yes | Store canonical ID/code/version; typed text is not a value |
| Package count | `Input` with numeric mode | Yes | Integer 1–999,999; no spinner-only interaction dependency |
| Package type | Canonical searchable `Combobox` | Yes | Controlled package-type set and version |
| Gross weight | Numeric `Input` + fixed `KGM` suffix | Yes | Positive decimal, maximum storage precision 18,3; no conversion |
| Volume | Numeric `Input` + fixed `MTQ` suffix | No | Both value/unit absent or value with `MTQ`; no conversion |

### Group 3 — Route and schedule

| Field/fact | Control | Required | Behavior |
|---|---|---:|---|
| Port of loading | Canonical location `Combobox` | Yes | Active UN/LOCODE and governed label/version |
| Port of discharge | Canonical location `Combobox` | Yes | Active, distinct from POL |
| Requested departure | Date `Input` | Yes | POL-local calendar date; label and help name the POL-local basis |
| Voyage | Compatible-voyage `Combobox` | Yes | Options depend on POL/POD and active authority; shows carrier voyage and useful dates |
| Carrier voyage number | Read-only evidence | Derived | Reference Data authority |
| ETD / ETA | Read-only evidence | Derived | Timezone-aware instants; ETD before ETA |
| Cargo cutoff | Read-only evidence | Derived | Must precede ETD |
| Documentation deadline | Read-only evidence | Derived | Must precede ETD |

Selecting POL/POD/date does not auto-select a voyage. Selecting a voyage populates a stable **Carrier schedule** panel. The panel displays:

- “Requested departure” as the user's POL-local date.
- “Carrier ETD” with timezone and local date.
- A neutral “Differs by N calendar days” explanation when the dates differ; no warning solely because they differ.
- Carrier voyage, ETA, cargo cutoff, documentation deadline, reference version, and last-known authority status.
- “Derived from Reference Data voyage {code/version}” as provenance.

If schedule enrichment is loading, reserve the panel dimensions with Skeletons. If partial, stale, inactive, route-incompatible, or temporally invalid, retain the selected value and draft work, mark the exact problem, and block confirmation—not draft saving.

### Group 4 — Equipment request

| Field/fact | Control | Required | Behavior |
|---|---|---:|---|
| Equipment type | Canonical equipment-type `Combobox` | Yes | Active ISO size/type code, version, and label |
| Quantity | `Input` with numeric mode | Yes | Integer 1–9,999 |
| Cargo mode | Read-only fact | Fixed | `FCL dry` |
| Currency | Read-only fact | Fixed | `USD` |
| Reefer | Read-only fact | Fixed | `No` |
| Dangerous goods | Read-only fact | Fixed | `No` |
| Physical equipment ID | No control | Not applicable | Persist/event value is null until later assignment |

The section copy says: “Request equipment by type and quantity. Container numbers are assigned later.” It must never show a fake `TBD`, `UNKNOWN`, sample ISO number, or quantity-expanded set of container rows.

### Group 5 — Review and save

The review summarizes the user's current entries without claiming server validation or persistence:

- Booking customer and customer reference
- Party roles
- Cargo, commodity, package, weight, and optional volume
- POL/POD, requested departure, selected voyage, derived schedule status, and variance
- Equipment type × quantity with “Physical assignment pending”
- Fixed USD / FCL dry / non-reefer / non-DG scope

Primary label is **Save draft** for new records and **Save corrections** for same-record correction. Secondary action is **Cancel**. Cancel with dirty data opens the established discard dialog; cancel without changes returns safely to the originating queue/detail context.

The review rail must say “Not yet saved” before persistence, “Saving draft” while pending, and show an authoritative booking reference only after a successful response.

## 5. Dependency and validation behavior

### Reference loading

- Load independent option sets concurrently without collapsing the form.
- Keep section geometry stable with labeled Skeleton rows.
- A failed set disables only controls that cannot be truthfully completed from authority; unaffected fields remain editable.
- An all-reference failure presents one page-level recovery strip plus exact affected groups.
- Retry reloads governed options and preserves user-authored text/numbers/dates.
- Typed but unmatched text remains search input only and cannot pass save as a canonical value.

### Dependent selection

- POL/POD constrain voyage options; requested departure informs ordering/explanation but does not introduce an unapproved tolerance gate.
- Changing POL or POD invalidates an incompatible selected voyage and schedule snapshot visibly.
- Changing any canonical choice re-checks its current ID/version/active state.
- Changing any pricing-determining field marks an existing price **Reprice required** without erasing prior immutable evidence.

### Validation timing

- Untouched controls show no error noise.
- Format and range checks occur on blur and save; cross-field/canonical checks occur on save/validate.
- Server errors are authoritative. Map stable field paths to their controls and preserve every other entry.
- On failed save/validate, focus the error-summary heading. Each summary item links to its control; activating it focuses the control.
- Correcting a field removes only its own obsolete error and any superseded form error.

## 6. Wireframes

### Desktop — 1440px

```text
┌ Canonical shell: top bar / navigation / user / global status ───────────────┐
│ Breadcrumbs  Booking / New booking                                          │
│ New booking request                                      [Draft · not saved]│
│ Complete the commercial request. Container assignment happens later.        │
│                                                                              │
│ ┌ Main form · minmax(0,760) ──────────────┐ ┌ Review rail · 280–340 ──────┐ │
│ │ 1 Booking and parties                    │ │ Review and save              │ │
│ │ [Booking customer      ][Customer ref  ] │ │ Customer        Not selected │ │
│ │ [Shipper               ][Consignee opt.] │ │ Cargo           Incomplete   │ │
│ │ [Notify party optional]                  │ │ Route/schedule  Incomplete   │ │
│ │                                          │ │ Equipment       Incomplete   │ │
│ │ 2 Cargo                                  │ │ USD · FCL dry                │ │
│ │ [Cargo description.....................] │ │ Assignment pending           │ │
│ │ [Commodity             ][Package type  ] │ │                              │ │
│ │ [Package count][Gross KGM][Volume MTQ]   │ │ [Save draft] [Cancel]        │ │
│ │                                          │ └──────────────────────────────┘ │
│ │ 3 Route and schedule                     │                                  │
│ │ [POL][POD][Requested departure]          │                                  │
│ │ [Voyage search........................]  │                                  │
│ │ ┌ Carrier schedule · derived/read-only ┐ │                                  │
│ │ │ Voyage · ETD · ETA · cutoffs · source│ │                                  │
│ │ └───────────────────────────────────────┘ │                                  │
│ │ 4 Equipment request                      │                                  │
│ │ [Equipment type][Quantity]               │                                  │
│ │ USD · FCL dry · Reefer No · DG No        │                                  │
│ └──────────────────────────────────────────┘                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

The review rail may be sticky only within the content viewport and only when it does not hide errors or actions at shorter heights.

### Desktop detail — 1440px

```text
Booking / BK-…              [Completeness] [Lifecycle]      [One next action]
Customer · route · requested departure · carrier ETD · equipment type × qty
[Overview] [Charges] [Journey] [Activity]
┌ Overview ────────────────────────────────┐ ┌ Readiness ────────────────────┐
│ Booking and parties                     │ │ References  Current            │
│ Cargo                                   │ │ Schedule    Complete           │
│ Route and requested/derived schedule    │ │ Price       Current            │
│ Equipment request · Assignment pending  │ │ Next        Confirm            │
└─────────────────────────────────────────┘ └────────────────────────────────┘
<collapsed> Audit and support evidence · safe correlation only
```

### Tablet — 768px

```text
Canonical compact shell
Breadcrumbs
Header + status + one next action
[Overview] [Charges] [Journey] [Activity]  (intentional horizontal tab scroll)
Form or detail sections — one column
Carrier schedule — inline below voyage
Review and save — inline final section
Actions — in flow; stack when labels need space
```

### Mobile — 375px and 390px

```text
Canonical mobile shell / drawer trigger
Booking / New
New booking request
[page-level recovery or error summary]

1 Booking and parties
[full-width controls]
2 Cargo
[full-width controls]
3 Route and schedule
[POL]
[POD]
[Requested departure]
[Voyage]
[derived schedule rows; labels above values]
4 Equipment request
[Type]
[Quantity]
[fixed commercial facts]
5 Review and save
[summary rows]
[Save draft — full width]
[Cancel — full width]
```

No fixed mobile action bar is introduced. The primary action remains in document flow so it does not obscure validation, schedule, or review evidence.

## 7. High-fidelity visual and interaction rules

### Tokens and typography

- Use only `--erp-*` tokens from `packages/ui/src/styles.ts`; no hardcoded module palette.
- Use `--erp-font-sans`, currently the IBM Plex Sans/system stack. The older design 11 reference to Inter is superseded by the LinerCore master and executable token source.
- Page title: the established 28/36, weight 700 treatment where the shared PageHeader applies.
- Section legends: 18/26, weight 700; labels/body follow shared dense operational typography.
- Codes, quantities, currency, and timestamps use tabular numerals where the shared token/class supports them.
- Use semantic text + Lucide icon + token color for statuses; never color alone.

### Geometry and density

- Content maximum: 1180px within the canonical shell.
- At 1024/1440, use a form/review grid only when the main form retains usable control widths; target main 760px and review 280–340px.
- At 768 and below, Review and save is inline.
- Horizontal gutters: 32px at 1440, 24px at 768–1024 where shell permits, 16px at 375/390.
- Control height: 40px desktop and at least 44px touch target on mobile.
- Field gap: 16px desktop, 14px mobile; section separation comes from spacing/border, not nested decorative cards.
- Error summary uses the shared danger surface and strong leading edge; do not rely on red text alone.

### Content behavior

- Persistent labels; placeholders are examples/search prompts, never labels.
- Long party/commodity names wrap; canonical codes and quantities remain visible.
- Schedule timestamps show local timezone abbreviation/offset and an unambiguous accessible value.
- A concise StatusStrip carries recoverable state. Detailed technical evidence stays in a collapsed `TechnicalDetails` disclosure.
- Async transitions reserve space and use 150–300ms non-layout-shifting feedback where motion is useful. Respect reduced motion.

### Confirmation impact dialog

The Confirm action opens the shared `Dialog` with:

- Booking reference and expected revision
- Booking customer
- POL/POD, requested departure, carrier voyage, ETD, and schedule authority
- Equipment type × quantity, explicitly “No physical container assigned”
- Current authoritative price total/basis/request identity
- Consequence: confirm the current request and publish its current routing/equipment request state

Primary: **Confirm booking**. Secondary: **Keep reviewing**. The dialog traps focus, Escape closes when no request is pending, and focus returns to Confirm. While pending, duplicate confirm is disabled. Unknown acceptance closes no optimistic success path; the detail's sole next action becomes Refresh status using the existing identity.

## 8. State and recovery matrix

| State | Presentation | Permitted recovery / next action | Preserve |
|---|---|---|---|
| Initial / untouched | Empty labeled controls; no errors | Begin entry | N/A |
| Routed loading | Stable PageHeader/section Skeletons | Await; announce completion politely | Shell and route context |
| Reference set loading | Skeleton in affected control/panel | Await affected set | Other inputs |
| Partial reference failure | Warning names affected sets | Retry affected authority; edit unaffected fields | All user-authored values |
| All reference failure | Page-level degraded strip; canonical controls unavailable | Retry references or return safely | User-authored text/numbers/dates |
| No canonical matches | “No active matches” inside combobox | Change search; no free-text commit | Search text |
| Stale/inactive selected reference | Exact field status, previous label retained as stale evidence | Refresh option or Correct | Draft and prior snapshot |
| Voyage route mismatch | Voyage-linked error; derived panel invalid | Select compatible voyage | POL/POD/date and other fields |
| Schedule partial/inconsistent | Incomplete schedule strip with missing facts | Save draft; later Correct/refresh; confirm blocked | Selected voyage and entries |
| Client validation blocked | Focused linked error summary + inline errors | Correct fields | All other inputs |
| Server completeness blocked | Stable code/reason mapped to fields/section | Correct, then Validate | Same record/revision context |
| Save pending | Primary busy; duplicate submit disabled | Await | Inputs and command identity |
| Save outcome unknown | Neutral/warning status | Refresh status with same identity; do not resubmit | Inputs, identity, list context |
| Save unavailable/timeout, not accepted | Recoverable danger/warning strip | Retry once with same identity | Inputs and identity |
| Draft saved | Success summary with authoritative reference | Inspect persisted record | Saved values |
| Duplicate replay | Existing recorded result, not a second success | Inspect existing record | Original result identity |
| Idempotency conflict | Conflict strip; no overwrite | Refresh authoritative state | Unsaved edits separately identified |
| Revision/concurrent conflict | `ConflictStrip` with safe change context | Refresh latest, then explicitly reapply | User edits are not silently merged/discarded |
| Legacy incomplete | Missing-facts summary on same record | Correct booking | Legacy attributes and record identity |
| Read-only | Fields render as evidence; mutations absent | Inspect / return | Permitted record facts |
| Denied/session boundary | Access-safe failure state; no record facts | Sign in or return to Booking | Safe return target only |
| Reference validation pending | StatusStrip with affected facts | Await / Refresh status when unknown | Record and revision |
| Commodity ineligible | Charges/Overview blocker with provider reason | Correct commodity/request; Validate before reprice | Draft and prior price evidence |
| Pricing pending/in progress | Charges status + request reference; no second request | Refresh/poll same request identity | Current/prior price evidence |
| Pricing outcome unknown | Warning, confirmation blocked | Refresh same identity; no retry | Request and price history |
| No rate / manual required | Provider reason, no guessed amount | Correct request; no automatic retry | Request and prior snapshots |
| Pricing validation | Linked provider field/reason | Correct, Validate, then Price | Request context |
| Pricing denied | Safe permission/session boundary | No protected retry | Non-sensitive context only |
| Explicit pricing unavailable/timeout, not accepted | Recoverable strip | Retry once with same identity | Request/prior price evidence |
| Malformed pricing response | Correlated contract-error block; no amount | Inspect safe evidence; confirmation blocked | Prior authoritative price only |
| Pricing conflict | ConflictStrip | Refresh latest pricing/booking state | Current context |
| Pricing replay | Previously recorded outcome | Follow outcome's next action | Same request identity |
| Reprice required | Prior snapshot labeled historical; current not confirmable | Price current revision | Immutable prior evidence |
| Confirmation pending | Dialog/action busy; duplicates disabled | Await; if unknown, Refresh same identity | Record, revision, identity |
| Confirmation conflict | No optimistic success | Refresh latest record | Current inspection context |
| Confirmed success | Focused/announced status; lifecycle Confirmed | Inspect | Full request; assignment remains pending |
| Service unavailable | Preserve permitted content; safe correlation | Bounded Retry/Refresh | Route/tab/list context |
| Not found / protected absence | Existence-safe terminal state | Return to Booking | Safe list context |

## 9. Responsive matrix

| Width | Form | Review/action | Detail | Verification emphasis |
|---|---|---|---|---|
| 375px | One column, 16px gutter, 44px controls | Inline, full-width in-flow buttons | Stacked facts; scrollable route tabs | No clipping at exact project breakpoint |
| 390px | Same as 375 with slightly wider option rows | Inline | Same | Preserve approved Booking mobile baseline |
| 768px | One column; two-up only when each control ≥260px | Inline; right-aligned or stacked | Stacked content/readiness | 200% zoom and drawer interaction |
| 1024px | Form + compact rail only if main ≥640px; otherwise stacked | Rail may stick when height permits | Two-column overview/readiness | No shell/content collision |
| 1440px | Main 760px + 280–340px rail within 1180px | Sticky within content only | Dense two-column workbench | Full shell, long labels, status density |

At all widths: no page-level horizontal scroll; combobox popup stays within viewport; codes are not meaninglessly truncated; localized labels can wrap; route tabs use an intentional accessible horizontal scroll below their minimum width; 200% zoom retains every field, error, status, and action.

## 10. Accessibility specification

- Target WCAG 2.2 AA while retaining all LinerCore 2.1 AA requirements.
- One `h1`; section legends/headings follow a logical hierarchy. Use fieldsets for semantic groups when they do not create nested verbosity.
- The shell skip link lands on the Booking main region.
- Every input has a persistent label, required text available to assistive technology, and `aria-describedby` references to exactly the active hint/error.
- Canonical comboboxes follow the existing `@erp/ui` keyboard contract: Tab enters/leaves, arrows move active option, Enter commits, Escape closes without destructive clearing, typed text filters, and active option is announced.
- Error summary is focusable only programmatically after a failed action. Links move focus to the erroneous control.
- Do not set `aria-live` on the entire form. Use dedicated polite regions for option-load completion, schedule resolution, save/price/confirm progress, and successful completion; use assertive alerts only for blocking failures that require immediate attention.
- Debounce/coalesce reference and schedule announcements so one selection produces one meaningful message.
- Loading Skeletons are hidden from the accessibility tree; their region has a concise busy label.
- Status always includes readable text and, where useful, an icon; no color-only or position-only meaning.
- Date labels name the POL-local calendar semantics. Derived instants expose a full machine-readable datetime and visible timezone.
- Numeric fields use suitable `inputMode`; validation does not depend on browser spinner controls.
- Dialog focus is trapped and restored. Pending irreversible actions cannot be dismissed into an ambiguous optimistic state.
- Touch targets are at least 44×44px on mobile. Focus uses `--erp-focus-ring` and is never clipped by sticky containers.
- Respect `prefers-reduced-motion`; no flashing, parallax, or ornamental animation.
- Light and dark theme contrast, forced-colors, text spacing, reflow, and 200% zoom must be verified on the running page.

## 11. `@erp/ui` mapping and platform dependencies

### Reuse without local copies

| Need | Shared primitive |
|---|---|
| Page/record framing | `Breadcrumbs`, `PageHeader`, `RecordHeader`, `RouteTabs` |
| Layout | `Stack`, `Inline`, `Card`, `DefinitionList` |
| Form controls | `Field`, `Input`, `Select`, `Combobox`, `Button` |
| State/evidence | `StatusStrip`, `Badge`, `StatusBadge`, `Skeleton`, `PartialDataNotice`, `ConflictStrip`, `FailureState` |
| Confirmation/recovery | `Dialog`, `TechnicalDetails`, `IdentifierValue`, `CopyButton` |
| Icons | `LucideIcon` through shared mappings |

### Booking-owned compositions

- `BookingRequestForm` and its five semantic sections
- `ReferenceFieldState` composition around shared Field/Combobox
- `CarrierScheduleEvidence`
- `BookingCompletenessSummary`
- `BookingNextAction`
- `BookingConfirmationImpact`
- Route-backed Overview/Charges/Journey/Activity composition

These compositions may use shared primitives but do not belong in `packages/ui` because they encode Booking rules.

### Shared-platform dependencies to resolve before implementation

| Dependency | Owner | Why required |
|---|---|---|
| Shared multiline `TextArea` primitive and token-consistent character counter | W2-02 / `packages/ui` | Cargo description; avoid a one-off local primitive |
| Combobox loading, empty, stale/invalid-option, long-label, and mobile popup behavior confirmed or extended | W2-02 / `packages/ui` | Canonical reference states across all governed sets |
| Reference Data role-aware party, Commodity, package type, equipment type, location, and enriched Voyage projections | Shared Platform | Approved field dictionary and schedule authority |
| Booking create/read/correct/completeness contract with revision and stable field errors | Booking | Same-record correction and UI truth |
| Exact pricing request/result state contract | Booking + Charge | Quantity/date-aware current pricing and recovery semantics |
| Nullable equipment ID and quantity >1 through confirmation/CMM | Booking + CMM | Pending assignment without synthetic containers |

No dependency authorizes W3-04 to edit `packages/ui`, the master design system, or another domain's page contract directly.

## 12. Traceability and test evidence

### Requirements and stories

| Surface/behavior | Requirements | User stories |
|---|---|---|
| Complete five-group create/reopen/correct form | FR-001–FR-005, FR-011–FR-014, FR-025 | US-01, US-02, US-04 |
| Live canonical reference and derived schedule | FR-006–FR-010 | US-03, US-05 |
| One next action and exact pricing recovery | FR-015–FR-019 | US-06, US-07 |
| Confirm once; pending physical assignment | FR-020–FR-023 | US-08 |
| One canonical operational record and all states | FR-024–FR-027 | US-09 |
| Authorization, privacy, stable errors/evidence | FR-028–FR-030 | US-10, US-12 |
| Integrated live proof | AC-001–AC-014, NFR-001–NFR-010 | US-11 |

### Playwright acceptance checklist

- [ ] `/bookings...` delegates/redirects to the equivalent canonical `/booking...` journey and cannot expose a second form.
- [ ] Authorized user creates and reopens a request containing every required/optional field, quantity `3`, and no equipment ID.
- [ ] Dirty cancel dialog keeps/discards correctly and restores focus.
- [ ] Each canonical field supports loading, search, keyboard selection, no matches, stale/inactive, and partial/all service failure.
- [ ] Typed unmatched text cannot be saved as a canonical value.
- [ ] POL/POD constrain voyage options; requested departure and derived carrier schedule remain distinct.
- [ ] Partial/stale/route-incompatible/invalid schedule allows draft recovery and blocks confirmation.
- [ ] Boundary values, decimal precision, unit pairing, text normalization, control rejection, and linked server errors preserve other input.
- [ ] Save pending/outcome unknown/timeout/replay/idempotency conflict/revision conflict use the exact identity and recovery behavior.
- [ ] Legacy-incomplete correction edits the same record and preserves unmapped evidence.
- [ ] Price request matches customer, commodity, POL/POD, equipment type, date, quantity, USD, and required trade-lane authority exactly.
- [ ] Priced, pending, manual/no-rate, commodity-ineligible, validation, denied, outcome-unknown, unavailable/timeout, malformed, conflict, and replay states each expose only the approved next action.
- [ ] Confirmation dialog has the approved impact facts, no equipment ID, keyboard trap/restore, duplicate prevention, and unknown-outcome recovery.
- [ ] Confirmed detail shows equipment type × quantity and pending assignment without container rows or journeys.
- [ ] Permission combinations independently hide/block create, correct, validate, price, and confirm while preserving safe inspection.
- [ ] Errors and diagnostics expose stable safe codes/correlation but no raw party/customer/cargo payload.
- [ ] Queue filters/page context and detail tab context survive back/retry/refresh/recovery.
- [ ] Keyboard-only journey passes with visible unclipped focus and meaningful announcements.
- [ ] Automated accessibility checks plus manual screen-reader checks cover form, combobox, error summary, dialog, route tabs, and async states.

### Visual-regression checklist

- [ ] Light and dark screenshots at 375, 390, 768, 1024, and 1440px.
- [ ] Initial, reference-loading, partial/all reference failure, validation summary, schedule variance/incomplete, saved, legacy incomplete, conflict, every pricing class, confirming, and confirmed states.
- [ ] Long party/commodity/package/voyage labels, maximum numeric values, timezone strings, and translated-length action labels.
- [ ] 200% zoom, forced colors, reduced motion, and text-spacing override.
- [ ] No overlap, clipped focus, page-level horizontal scroll, hidden error/action, layout shift, copied shell, or local palette.

## 13. Proposed LinerCore page override content

Proposed future file: `design-system/linercore/pages/booking-request-completeness.md`. Do not create or edit it during this design run.

```markdown
# Booking Request Completeness

- `/booking` is canonical; `/bookings` is compatibility only.
- Use five groups: Booking and parties, Cargo, Route and schedule, Equipment request, Review and save.
- Initial draft/confirmation uses equipment type × quantity with nullable `equipmentId`; never fabricate a container.
- Requested departure is a POL-local user preference. Voyage schedule is read-only Reference Data evidence and must show provenance and variance.
- Preserve user input across reference, validation, save, pricing, conflict, and service failures.
- Detail exposes exactly one authorized next lifecycle action by W3-04 precedence.
- Charges owns detailed pricing evidence; Overview summarizes readiness only.
- At 1024/1440 a compact review rail is allowed when the form remains usable; at 768/390/375 Review is inline and actions stay in flow.
- Use only LinerCore tokens and `@erp/ui`; Booking-specific compositions remain in Booking.
```

## 14. Unresolved questions and evidence gaps

### Product and field/schedule questions

None blocking. The field dictionary, requested-departure meaning, required derived schedule facts, and nullable initial equipment assignment were resolved and approved before this stage.

### Application Design decisions

1. Confirm `/booking/{id}/correct` versus an explicitly modeled correction mode while preserving one implementation and same-record revision semantics.
2. Define the REST/BFF representation and stable field paths without renaming approved canonical concepts.
3. Confirm which `@erp/ui` Combobox behaviors already satisfy the state contract and route any general extensions to W2-02.
4. Sequence tolerant readers/writers for enriched Booking snapshots and `booking.confirmed` before implementation.

### Evidence gap

Live visual/interactive review remains **blocked in this session** because no browser backend was available and Docker access was denied. Before implementation approval, verify the running authenticated route and capture the responsive/accessibility evidence listed above.

## 15. Design review checklist

- [x] Scope is one FCL-dry leg, one equipment-request line, USD, non-reefer, non-DG.
- [x] No cancellation, rolls/splits, allocation, multi-leg, multi-currency, special equipment, reefer/DG depth, or eBL action was added.
- [x] No physical equipment ID is required or fabricated.
- [x] Approved field dictionary and schedule distinction are preserved.
- [x] `/booking` and shared-shell ownership remain canonical.
- [x] Route changes are proposals for Application Design, not implementation claims.
- [x] Required initial, loading, reference, validation, pricing, permission, conflict, legacy, save, confirmation, and success states are specified.
- [x] 375, 390, 768, 1024, and 1440px behavior is explicit.
- [x] Keyboard, focus, async announcements, non-color status, reduced motion, zoom, and contrast verification are specified.
- [x] Reuse versus Booking composition versus platform dependency is explicit.
- [x] No invented API response, unsupported action, shell change, alternate palette/font, marketing treatment, or production-code edit is authorized.
- [ ] Running-demo and screenshot evidence must be completed when the environment is accessible.

## Approval statement

Approval of this advisory candidate authorizes the AI-DLC Refined Mockups handoff to translate it into the intent's binding stage artifacts. It does not approve production implementation or design-system changes.
