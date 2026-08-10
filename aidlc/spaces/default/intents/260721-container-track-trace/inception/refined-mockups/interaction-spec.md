<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces product-grade UX, not a disposable standalone workbench. -->

# Interaction Spec - W2-04 Container Movement

This specification refines `wireframes.md` and `user-flow.md`, implements
`stories.md` and `requirements.md`, and follows the PB-01/risk practices in
`team-practices.md`.

## Navigation & Shell Context

Container Movement is the fourth business-module entry in the one authenticated
LinerCore shell, after Charge Agreements and before Reference Data. The shell
owns top bar, navigation, user/session menu, breadcrumbs, global status, skip
link, and theme. W2-04 provides routed content only.

Users arrive from the module nav, a canonical Booking related-journey link, or a
stable copied detail URL. All routes require the real HttpOnly-cookie session and
BFF authorization; no query/body actor or hardcoded local user grants authority.
The list has no journey ribbon. Detail may use the shared contextual journey
ribbon only when route metadata explicitly supplies the state.

## Screens & Routes

| Route | Type | Purpose |
| --- | --- | --- |
| `/container-movement` | List | Search/filter/paginate journeys and open a named record |
| `/container-movement/journeys/[id]` | Detail (master-detail) | Identity, route/equipment facts, one expected/actual timeline, capture action, related Booking link, collapsed evidence |

There is no create route because `booking.confirmed` creates journeys. There is
no standalone capture/result/audit route in this slice. Cross-module navigation
uses `/booking/[bookingId]` inside the same shell.

## List Page Spec

The page uses one h1 (`Container journeys`), a brief task description, Refresh,
search, lifecycle filter, Reset, stable result count, and pagination. Search
matches equipment reference, Booking reference, or journey ID. Table sort is
limited to stable supported columns and announces direction.

Columns at 768+: Equipment, Booking, POL to POD, Lifecycle, Next movement, and
Updated. Equipment is a descriptive link; rows are not click-only controls.
At 375 the same facts become a semantic record list with one named detail link.
Filters and page position persist through detail/back navigation.

### JourneyResults

| Field | Value |
|---|---|
| Component | `JourneyResults` |
| Description | Responsive journey results composition |
| Category | display / navigation |

**States:** loading Skeleton; populated; filtered empty; retryable error;
permission denied; degraded last-known results. Hover never shifts layout.

**Inputs:** journeys, total/range, current filters/sort/page, freshness,
permission result, and named callbacks/links. It never calls an API directly.

**Responsive behavior:** Table plus inner overflow at 768/1024/1440; semantic
list at 375. No hidden route or next-action content.

**Accessibility:** native Table/list/link semantics, caption or accessible name,
announced sort, 44px mobile targets, logical focus order, and non-color status.

## Detail Page Spec

The master-detail layout uses an equipment-reference h1 and lifecycle identity
header; route/equipment summary; one ordered timeline; width-adaptive capture;
canonical Booking link; and collapsed audit/event evidence. No unrelated tabs
are introduced: the thin journey has no charges, fleet registry, condition,
lease, depot, M&R, D&D, EDI, or public-DCSA section.

At 1024/1440, timeline and capture action panel form two columns. At 768, detail
is one column and capture uses a Drawer. At 375, capture expands in flow after
its trigger. Degraded freshness disables capture with explanation and Retry.

### MovementTimeline

| Field | Value |
|---|---|
| Component | `MovementTimeline` |
| Description | Canonical ordered expected/actual journey evidence |
| Category | display / disclosure |

**States:** Allocated through Returned-empty; loading; partial expected-only;
actual accepted; next/planned; retryable error; degraded last-known; ordering
warning. Actual items may expand for evidence.

**Inputs:** journey identity, lifecycle, expected moves, accepted actual moves,
next legal move, freshness, and evidence disclosure. Sequence is explicit; DOM
order equals business order.

**Responsive behavior:** Same ordered list at all widths; spacing/details adapt,
but no tabs or reordering. Long locations/identifiers wrap.

**Accessibility:** native ordered list, h2 label, expandable buttons with
`aria-expanded`, code plus readable label, occurred/received terms stated, and
no decorative timeline graphics required for meaning.

### CaptureMovementForm

| Field | Value |
|---|---|
| Component | `CaptureMovementForm` |
| Description | Records one ACT GTOT/LOAD/DISC/GTIN attempt |
| Category | input / feedback |

**States:** default with suggested next code; dirty; client validation; submitting;
accepted; duplicate; out of sequence; reference error; forbidden; retryable
service failure; degraded-disabled.

**Inputs:** journey/equipment identity, permitted code set, suggested code and
location, lifecycle/next move, active reference lookup results, session-derived
permission, and submit/cancel behavior. Inputs are code, location, occurred time,
and empty indicator; ACT/equipment/MANUAL are visible read-only facts.

**Responsive behavior:** persistent action panel at 1024/1440; focus-trapped and
focus-restoring Drawer at 768; `aria-expanded` in-flow section at 375.

**Accessibility:** fieldset/legend or named form, persistent labels, descriptions,
`aria-invalid`/`aria-describedby`, summary links to fields, visible focus, 44px
targets, Enter does not bypass validation, and reduced motion. Busy state keeps
button dimensions and prevents double submission.

### CaptureOutcomeSummary

| Field | Value |
|---|---|
| Component | `CaptureOutcomeSummary` |
| Description | Persistent accepted/rejected result and recovery actions |
| Category | feedback |

**States:** accepted/publication-pending/Booking-applied; duplicate; out of
sequence; validation; authorization; retryable error.

**Inputs:** stable outcome code, readable summary, lifecycle before/after,
original/next-move evidence, correlation for disclosure, field targets, and
recovery actions.

**Responsive behavior:** full available width above the form/timeline update; no
toast-only variant. Content wraps without horizontal scrolling.

**Accessibility:** error summary uses alert semantics where appropriate and is
programmatically focused after submit; success/pending uses a polite live region.
Links have descriptive names. Focus does not jump on background pending-to-applied
poll updates.

### AuditEvidenceDisclosure

| Field | Value |
|---|---|
| Component | `AuditEvidenceDisclosure` |
| Description | Secondary operational evidence without raw transport clutter |
| Category | disclosure |

**States:** collapsed, expanded, loading, empty, retryable error, denied.

**Inputs:** event/audit outcomes, actor/source, occurred/received time,
correlation, consumer/outbox state, and safe evidence references. Raw payloads,
tokens, and secrets are excluded.

**Accessibility:** native details/summary or Button/region semantics; state is
announced, keyboard toggle works, and expanded content follows the timeline in
DOM order.

## States

| State | Entry condition | Visible response | Recovery / focus |
|---|---|---|---|
| Loading | Route/query pending | Stable-size Skeleton matching final regions | Focus remains on route/main heading |
| Empty | No list matches | Active filters, no-match message, Reset | Reset restores results and announces count |
| Not found | Unknown journey ID | No leaked data; return to list | Named list link |
| Error/retry | Read/reference/service failed | Plain-language affected region and Retry | Retry retains filters/form values |
| No permission | Read or capture denied | Read denial blocks data; capture denial keeps allowed read | Safe return or request-access guidance |
| Success | Accepted movement | Inline code/lifecycle/next move; timeline updated | Summary focused, then normal reading order |
| Pending | Status not yet observed by Booking | Accepted CMM state plus `Booking update pending` | Background poll; no focus theft |
| Applied | Booking receipt/projection observed | Applied text and observed time | Canonical Booking link |
| Validation | Field/business input invalid | Summary plus field messages; all values retained | Summary focused; links target fields |
| Duplicate | HTTP 409 duplicate | Original evidence and unchanged-state statement | Review original / correct attempt |
| Out of sequence | HTTP 409 illegal next code | Required next code and unchanged-state statement | Event-code link / correct attempt |
| Degraded | Freshness/authority unavailable | Last-known data labelled; capture disabled | Retry; never fake fresh success |

## Design System Usage

Use existing `@erp/ui` Shell-integrated page layout, Button, Input, Select,
Combobox, Table, Badge, Panel, Drawer, Toast, EmptyState, Skeleton, Stack, Inline,
StatusStrip, and form/error primitives. Lucide supplies icons. Toast is optional
supplementary success feedback only.

All color, space, typography, border, shadow, focus, and semantic background
values come from `--erp-*` tokens. No local hex, inline `CSSProperties`, CSS
Modules, alternate fonts, nested card wall, scale-hover, or module-local shell.
No new shared primitive is required by the design. If implementation reveals a
missing capability in an existing primitive, record it for W2-02 and integrate
through the Wave A merge protocol; do not edit `packages/ui` here.

## Domain-True Forms

The capture form records one real movement attempt against a real journey:

- event code is exactly GTOT, LOAD, DISC, or GTIN; next legal code is suggested
  but alternatives remain selectable for observable server authority;
- classifier is fixed ACT and source is fixed MANUAL for this path;
- equipment is the assigned ISO 6346 reference, visible but not re-keyed;
- location is an active UN/LOCODE from the live Reference Data lookup;
- occurred time is explicit and distinct from received time;
- empty indicator is LADEN for GTOT/LOAD/DISC and EMPTY for GTIN in the thin
  journey, with the expected value preselected and server-validated;
- correlation/idempotency are request-boundary evidence, not free-text operator
  fields;
- duplicate and out-of-sequence responses preserve form values and accepted
  journey state.

No form captures EDI, public DCSA subscriptions, multi-leg routing, fleet/depot,
condition/lease, M&R, D&D, or predictive ETA data.

## Accessibility & Responsiveness

Design target is WCAG 2.2 AA intent, meeting at least the LinerCore WCAG 2.1 AA
floor. Each route has one h1, ordered h2 sections, real shell landmarks/skip
link, native controls, persistent labels, visible `--erp-focus-ring`, and
non-color status. Dynamic capture outcomes are announced as specified without
repeated poll noise. All actions work by keyboard; Drawer focus is trapped and
restored; 375 in-flow capture is not trapped. Reduced motion disables nonessential
transitions.

Verify 375, 768, 1024, and 1440 in light/dark themes, browser zoom, long values,
and service/error states. There is no page-level horizontal scroll; the 768
table has an intentional labelled inner scroll region. See
`accessibility-checklist.md` for the evidence matrix.

## Open Questions

None. Q1-Q6 in `refined-mockups-questions.md` are answered and internally
consistent. W2-02 synchronization and exclusive live-stack reservation are
execution gates, not unresolved interaction design.

## Review

**Verdict: READY**

- Q1-Q6 are carried through exactly: desktop panel/table, tablet Drawer/inner
  overflow, mobile in-flow capture/record list, one ordered timeline, suggested
  but selectable DCSA code, persistent inline outcomes, and freshness-gated
  capture.
- The two owned routes cover the UI-bearing story and requirement outcomes,
  including expected/actual progression, GTOT/LOAD/DISC/GTIN ACT capture,
  duplicate and sequence rejection, publication pending, Booking applied, and
  the explicit absence of a UI create route for broker-created journeys.
- The design is implementable within the shared shell and existing `@erp/ui`
  contract, preserves DCSA/load-state truth, and neither redesigns shared
  assets nor adds a third Container Movement route.
- Loading, empty/not-found, error, denied, populated, validation, duplicate,
  sequence, accepted, pending/applied, and degraded states are specified across
  375/768/1024/1440, with keyboard, focus, live-region, reduced-motion, zoom,
  and light/dark WCAG evidence obligations.
- `ui-ux-pro-max` operational recommendations are adopted selectively and its
  marketing/decorative conflicts are explicitly rejected. Live visual/a11y and
  audit PASS claims remain correctly pending implementation and W2-02 sync.
- Required-sections and upstream-coverage passed for all five produced outputs;
  `git diff --check` passed.
