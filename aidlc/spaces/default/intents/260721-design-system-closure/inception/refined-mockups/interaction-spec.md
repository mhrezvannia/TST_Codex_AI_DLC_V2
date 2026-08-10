# Interaction Specification — Booking Reference Closure

## Inputs and Interaction Contract

This specification refines `wireframes.md` and `user-flow.md`, implements `stories.md`, satisfies `requirements.md`, and follows `team-practices.md`. Existing Booking business behavior and the authenticated shell/BFF/service path are preserved. Component names below refer to `@erp/ui` exports or domain compositions built from them; they do not authorize a local component library.

## Canonical Shell Seam

| Field | Value |
|---|---|
| Component | Existing authenticated shell plus Booking route content |
| Category | layout / navigation |
| Description | Shell owns banner, navigation, breadcrumbs, theme, user controls, and main landmark; Booking supplies only routed domain content. |

### States and inputs

| State/input | Behavior |
|---|---|
| Booking route active | Booking navigation item is current; route metadata supplies active state. |
| Transactional journey | Workflow ribbon appears only where applicable and uses explicit journey context. |
| Denied/not found | Shell remains available; routed content presents the state without duplicate chrome. |

### Responsive and accessibility

- Shell behavior is reused unchanged at 375, 768, 1024, and 1440.
- Skip link targets the single main landmark.
- No second banner/navigation/main landmark is introduced by Booking.
- Page transition focus follows existing shell policy; route h1 is the logical content target when focus movement is required.

## Booking List Command Bar

| Field | Value |
|---|---|
| Component | Stack, Inline, Input or Combobox, Select, Button, StatusStrip |
| Category | input / feedback |
| Description | Search, status filter, reset, result count, and service context above the shared table. |

### States

| State | Trigger | Behavior |
|---|---|---|
| default | route populated | Current filters and result count visible. |
| filtering | query/filter change | Preserve focus; announce settled result count, not every keystroke. |
| loading | request pending | Controls retain size; results use Skeleton. |
| error/degraded | request fails partly or fully | StatusStrip names impact and recovery. |

### Inputs and events

| Input/event | Contract |
|---|---|
| Search value | Controlled string; visible label; retained on retry and pagination. |
| Status filter | Shared Select with textual option names. |
| Reset | Clears active filters and returns focus to search. |
| Create | Navigates to canonical create route inside shell. |

### Responsive and accessibility

- 375: Stack; primary Create remains before filters in visual and tab order.
- 768+: Inline may wrap without changing DOM order.
- Labels remain visible; status updates use a polite live region.

## Booking Results

| Field | Value |
|---|---|
| Component | Table, Badge/StatusBadge, Skeleton, EmptyState, Button |
| Category | data display / feedback |
| Description | Dense, semantic Booking result set with contained narrow-screen scrolling. |

### States

Default, hover, focus, loading, populated, empty dataset, no filter match, error/retry, denied, and degraded are required. Loading reserves header/row dimensions. Empty dataset and no-match copy/actions differ. Denied does not render a misleading disabled table.

### Inputs and events

| Input/event | Contract |
|---|---|
| Rows | Booking reference, customer, route, departure, textual status, updated time, canonical action. |
| Sort | If existing behavior supports it, header exposes direction in accessible name/state. |
| Row open | Link/Button accessible name includes Booking reference; no click-only row. |
| Retry | Reissues failed request with filters retained. |

### Responsive and accessibility

- The Table wrapper uses `max-inline-size: 100%` and contained `overflow-x: auto`; page overflow is forbidden.
- Reference, status, and action remain available at narrow widths; other columns remain scroll-reachable.
- Native table semantics are retained through the shared primitive.
- Focus uses `--erp-focus-ring`; status includes text/icon, never color alone.

## Booking Create Form

| Field | Value |
|---|---|
| Component | Field, Input, Select, Combobox, Stack, Inline, Button, Skeleton, StatusStrip |
| Category | input / feedback |
| Description | One grouped form preserving existing create behavior with async lookup, validation, and submission recovery. |

### States

| State | Trigger | Behavior |
|---|---|---|
| initial | route ready | Grouped labelled fields and explicit create/cancel. |
| lookup loading | dependent options requested | Inline Skeleton affects only the lookup region. |
| lookup empty/error | no options or request failure | Plain-language state and scoped Retry; other values remain. |
| validation blocked | submit with invalid values | Summary links and inline errors; no values cleared. |
| submitting | create request pending | Submit disabled, duplicate action blocked, pending announced. |
| service error/degraded | backend response | Values retained; action-specific recovery. |
| success | booking created | Success announced before canonical detail transition. |

### Inputs and events

| Input/event | Contract |
|---|---|
| Field value | Existing Booking form mapping/type is preserved. |
| Blur | May reveal field-specific validation; no disruptive per-keystroke errors. |
| Submit | Explicit action; validates, focuses summary when blocked, calls existing BFF once. |
| Cancel clean | Returns safely to canonical list/detail context. |
| Cancel dirty | Opens shared confirmation Dialog naming unsaved scope. |

### Responsive and accessibility

- One column at 375; optional two-column groups at 768+ only with logical DOM order.
- Persistent labels and `aria-describedby` connect help/errors.
- Validation summary receives programmatic focus on blocked submit and links to fields.
- Busy, error, and success messages use appropriate polite/assertive live-region priority without duplicate announcements.

## Dirty-State Confirmation Dialog

| Field | Value |
|---|---|
| Component | Dialog, Button |
| Category | overlay / feedback |
| Description | Confirms navigation only when unsaved Booking input would be lost. |

### States and events

Closed → open on dirty cancel → discard or continue editing. Escape and secondary action continue editing when safe. Confirming discard returns to canonical context.

### Responsive and accessibility

- Focus enters the dialog heading or first meaningful control, remains trapped, and returns to Cancel on dismissal.
- The dialog has an accessible name/description and identifies the consequence.
- No nested dialog; background is inert and cannot scroll.

## Booking Detail and Lifecycle

| Field | Value |
|---|---|
| Component | Badge/StatusBadge, StatusStrip, Stack, Inline, Tabs when justified, Button, Skeleton |
| Category | data display / feedback |
| Description | Identity, status, actions, facts, lifecycle, and secondary audit evidence. |

### States

Loading, populated, not found, denied, partial/degraded, action pending, action error, and action success are required. Section-level failure preserves identity and unaffected facts.

### Inputs and events

| Input/event | Contract |
|---|---|
| Validate/price/confirm | Existing permitted action and state-transition rules; pending blocks duplicate command. |
| Tabs | Used only when existing content grouping benefits; arrow keys move tabs and Tab enters panel. |
| Audit disclosure | Native/shared disclosure semantics; collapsed initially; raw payload stays secondary. |
| Retry | Scoped to failed action or section where possible. |

### Responsive and accessibility

- Identity/actions stack at 375; facts become one column; long identifiers wrap or expose full accessible value.
- One h1; ordered h2 hierarchy; definition/list semantics for facts and lifecycle.
- Lifecycle status includes readable text, time, and source; no color-only milestone.
- Action feedback is announced without stealing focus unless an error summary requires it.

## Focus and Announcement Sequence

| Event | Focus result | Announcement |
|---|---|---|
| Filter settles | Remains in active filter | Result count, polite |
| List retry succeeds | Remains on Retry or moves only by explicit navigation | Results available, polite |
| Blocked form submit | Validation summary | Error count and summary, assertive once |
| Lookup retry | Remains in lookup region | Lookup result, polite |
| Submission starts | Remains on disabled submit or stable status target | Creating booking, polite |
| Submission succeeds | Canonical detail h1 after navigation | Created reference/status |
| Dialog opens/closes | Dialog initial focus / original trigger | Dialog name / no duplicate close message |
| Lifecycle action fails | Error summary near action | Specific recoverable error, assertive once |

## Motion and Timing

- Hover/focus visual transitions use shared 150–250ms tokenized behavior and never scale or shift layout.
- `prefers-reduced-motion` removes non-essential transition.
- Skeletons are static or use the shared reduced-motion-safe implementation.
- No new time limit, auto-submit, auto-dismiss dependency, or forced focus churn is introduced.

## Live Verification Hooks

Each state identifier from `mockups.md` must be addressable by stable role/name assertions or documented test identifiers only where semantic queries are insufficient. Playwright records canonical route, state-generation method, viewport, theme, keyboard sequence, focus target, announcement text, and screenshot. Detached component harnesses may support unit tests but cannot replace live-route acceptance.
