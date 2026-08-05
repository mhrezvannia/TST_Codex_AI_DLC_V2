# Refined Mockups — Booking Reference Closure

## Authority, Traceability, and Fidelity

These implementation-ready annotations refine `wireframes.md` and `user-flow.md`; realize US-001 through US-006 from `stories.md`; satisfy FR-001 through FR-012 and NFR-001 through NFR-009 in `requirements.md`; and retain the canonical-live/testing posture in `team-practices.md`. They preserve existing Booking behavior and the one authenticated shell. They are not a new frontend or visual redesign.

Shared contract: `MASTER.md`, `SESSION-PROMPT.md`, and executable `@erp/ui` tokens/primitives. ui-ux-pro-max guidance on density, filtering, focus, keyboard access, reduced motion, and responsive checks is retained. Gateway marketing, remote fonts, alternate colors, generic spinners, and page-level horizontal overflow are rejected.

## Frame Invariant — Every Canonical Booking Route

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Skip to main content                                                    │
├──────────────────────────────────────────────────────────────────────────┤
│ LinerCore │ global status │ theme │ user menu │ sign out                │
├───────────────┬──────────────────────────────────────────────────────────┤
│ Overview      │ Breadcrumbs                                             │
│ Booking ●     │ [contextual Booking journey ribbon when applicable]     │
│ Agreements    ├──────────────────────────────────────────────────────────┤
│ Movement      │ <main id="main-content">                                │
│ Reference     │   one page h1 + routed Booking content                  │
│ Data          │ </main>                                                 │
└───────────────┴──────────────────────────────────────────────────────────┘
```

Annotations:

- `apps/shell` retains banner, navigation, breadcrumbs, theme, identity, and sign-out ownership.
- Booking owns only routed domain content; no nested header/navigation/theme landmark is rendered.
- Focus enters at the skip link, then shell navigation, then the page’s first command.
- The workflow ribbon is contextual to transactional Booking routes and derives state from route metadata or explicit context.

## Screen A — Booking List

### Wide layout: 1024 and 1440

```text
Bookings                                      [Create booking]
Search bookings [________________]  Status [All ▼]  [Reset]   24 results
┌──────────────────────────────────────────────────────────────────────────┐
│ Reference ↕ │ Customer │ Route │ Departure │ Status │ Updated │ Action │
├──────────────────────────────────────────────────────────────────────────┤
│ BK-10482    │ Acme     │ IRBNDK→DEHAM │ … │ Confirmed ✓ │ … │ Open  │
│ BK-10483    │ North    │ …            │ … │ Draft      │ … │ Open  │
└──────────────────────────────────────────────────────────────────────────┘
Showing 1–20 of 24                                      [Previous] [Next]
```

- Compact page header; one primary command.
- Filters have persistent labels, preserve values through retry/pagination, and expose a textual active-filter summary.
- Table identity/status columns remain stable; status always includes text, not color alone.
- The row link has an accessible name containing the Booking reference. No row requires pointer-only activation.

### Narrow layout: 375 and 768

```text
Bookings
[Create booking]
[Search bookings________________]
[Status: All ▼] [Reset]
24 results
┌── contained table viewport ──────────┐
│ Reference │ Status │ Action │ … →    │
│ BK-10482  │ Confirmed ✓ │ Open │     │
└───────────────────────────────────────┘
[Previous] 1–20 of 24 [Next]
```

- Commands stack in visual/tab order.
- Only the table viewport may scroll horizontally; `body`, shell, header, filters, and pagination remain overflow-free.
- Essential reference, textual status, and row action remain available; additional columns are reachable within the contained scroller.

### State variants

| State | Visual/semantic treatment | Focus and announcement | Evidence hook |
|---|---|---|---|
| Loading | Header/filter geometry retained; 5 shared Skeleton rows | `aria-busy=true`; one polite “Loading bookings” update | `booking-list-loading` |
| Populated | Shared Table, Badge, result count, pagination | Filtering announces result count without moving focus | `booking-list-populated` |
| Empty dataset | EmptyState with “No bookings yet” and Create action | Heading and action are keyboard reachable | `booking-list-empty` |
| No filter match | EmptyState retains filters and offers Reset | Reset returns focus to search | `booking-list-no-match` |
| Error/retry | StatusStrip with plain-language cause and Retry Button | Alert announced once; retry retains filters | `booking-list-error` |
| Denied | Explicit denied state and safe shell navigation | Focus lands on state heading; no fake disabled table | `booking-list-denied` |
| Degraded | Available rows remain; unavailable evidence is labelled | Polite status; no repeated alert loop | `booking-list-degraded` |

## Screen B — Create Booking

### Layout and hierarchy

```text
Create booking                                             [Cancel]
[Validation summary — appears only after blocked submit]

Booking parties
  Customer [lookup________________________]

Route and voyage
  Origin [________]  Destination [________]
  Voyage [________]  Departure [________]

Equipment and cargo
  Equipment [______] Quantity [__] Cargo [________________]

[Secondary evidence ▸]

                                            [Cancel] [Create booking]
[polite status / error / success region]
```

- One semantic form and one h1; sections use ordered h2 headings or fieldsets/legends where appropriate.
- Persistent labels sit outside controls. Help and error text are programmatically associated.
- Reference lookups use shared Combobox behavior with inline Skeleton/error/retry limited to the dependent field.
- Secondary evidence uses progressive disclosure; it does not hide required fields or validation.
- The action area remains visible in normal document flow; no floating promotional action.

### Interaction states

| State | Treatment | Focus/data behavior | Evidence hook |
|---|---|---|---|
| Initial | Grouped shared Field/Input/Select/Combobox | First invalid-free control follows page commands | `booking-create-initial` |
| Lookup loading | Inline Skeleton within dependent control region | Existing form values and focus remain | `booking-lookup-loading` |
| Lookup empty/error | Specific EmptyState/StatusStrip and Retry | Retry affects only lookup; other values persist | `booking-lookup-error` |
| Validation blocked | Summary links plus inline field errors | Focus moves to summary, then links target invalid fields | `booking-validation` |
| Submission pending | Primary Button disabled; textual pending state | Duplicate submit blocked; polite announcement | `booking-pending` |
| Service error/degraded | Actionable message; values preserved | Focus moves to message only after response; retry available | `booking-submit-error` |
| Dirty cancel | Shared Dialog names unsaved scope | Focus trapped; Escape closes when safe; trigger restored | `booking-dirty-dialog` |
| Success | Success Toast/StatusStrip, then canonical detail | Creation announced before route transition; detail h1 receives logical focus | `booking-success` |

### Responsive behavior

- 375: one column; controls and actions use available width; validation links wrap; no page overflow.
- 768: short related fields may form two columns only when DOM/tab order remains row-major and logical.
- 1024/1440: form uses a bounded readable width; additional space does not create decorative panels.

## Screen C — Booking Detail and Lifecycle

### Layout and hierarchy

```text
BK-10482  [Confirmed ✓]                    [Validate] [Price] [Confirm]
Route: IRBNDK → DEHAM     Customer: Acme     Voyage: LC-220
[workflow/status strip: current step and actionable exception]

Summary
  booking facts in compact definition grid

Lifecycle
  ● Created      2026-07-21  source…
  ● Validated    2026-07-21  evidence…
  ● Priced       amount + currency + agreement/rate source
  ● Confirmed    timestamp + actor

[Technical audit evidence ▸]
[polite action status / error / success region]
```

- Identity, textual status, and permitted actions precede secondary evidence.
- Lifecycle shows readable labels plus codes/timestamps/source where business-relevant.
- Shared Tabs may group existing long content only when all panels have meaningful labels and arrow-key semantics; they are not required merely for decoration.
- Raw event payloads, Kafka/schema details, and technical identifiers remain inside a collapsed audit disclosure.

### State variants

| State | Treatment | Focus and recovery | Evidence hook |
|---|---|---|---|
| Loading | Identity, facts, and lifecycle Skeleton blocks reserve space | `aria-busy=true`; heading remains stable | `booking-detail-loading` |
| Populated | Badge, StatusStrip, semantic facts, lifecycle | Actions follow identity in tab order | `booking-detail-populated` |
| Not found | Distinct state with canonical return to list | Focus on state heading, then return action | `booking-detail-not-found` |
| Denied | Permission explanation without record leakage | Safe shell navigation remains | `booking-detail-denied` |
| Partial/degraded | Available sections remain; failed section has retry | Retry scoped to section; identity remains | `booking-detail-degraded` |
| Action pending | Affected command disabled; other safe navigation retained | Announcement identifies action and record | `booking-action-pending` |
| Action error | Plain-language recovery and preserved record context | Focus to error summary; trigger remains reachable | `booking-action-error` |
| Action success | Status/lifecycle update plus confirmation | Polite update; focus stays stable unless route changes | `booking-action-success` |

## Cross-Screen Responsive and Proof Matrix

| Width | Shell | Page content | Table/form/detail | Required proof |
|---:|---|---|---|---|
| 375 | Canonical narrow navigation; skip link intact | Commands stack; no hidden primary action | Contained table scroll; one-column form/facts | light/dark screenshots, overflow assertion, keyboard path |
| 768 | Compact shell and wrapping commands | Two-column fields only where reading order holds | Table remains primary; facts use constrained grid | state screenshot, focus order, label association |
| 1024 | Full operational shell | Dense command bars | Stable table columns; bounded form; aligned lifecycle | happy-path and difficult-state evidence |
| 1440 | Same shell; no ornamental expansion | Content max-width preserves density | No stretched controls or nested card grid | theme/contrast and layout screenshot |

Every screenshot/result must record route, state-generation method, theme, viewport, commit, and Playwright assertion. Source review is not visual proof; these annotations become complete only when observed on `linercore-wave-a` with manager-demo guards before and after.

## Review

- Verdict: READY
- Findings: The artifacts faithfully implement the answered decisions for annotated existing list/create/detail routes, contained narrow-width table scrolling, a grouped create form, and operational detail hierarchy. Required states, responsive widths, focus and announcement behavior, component-spec structure, shared `@erp/ui` mapping, bounded semantic-native exceptions, one-shell ownership, live-proof hooks, manager-demo safety, and the historical W1 evidence boundary are explicit. No redesign, new route, local theme, second frontend, or unsupported PASS claim is introduced.
- Mandatory corrections: None.
