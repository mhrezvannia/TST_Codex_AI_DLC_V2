# Interaction Spec - W2-01 App Shell and Auth

## Source Context

This interaction spec consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It describes product-grade shell behavior for W2-01 and assumes a real authenticated session; protected Booking paths must not rely on a hardcoded user.

## Navigation & Shell Context

W2-01 lives in the single authenticated LinerCore shell. The active primary navigation entry is Booking. Breadcrumb examples:

- Shell landing: `Home`
- Booking list: `Home / Booking`
- Booking detail/action: `Home / Booking / <booking-reference>`
- Denied path: `Home / Booking`

Auth/session requirement:

- All shell and Booking routes require an authenticated session unless they are explicit auth routes.
- The user menu displays the session subject summary from server-side session state.
- Booking BFF calls derive actor subject from the session and must not default to `local-user` on protected shell paths.

## Screens & Routes

| Route | Type | Purpose |
| --- | --- | --- |
| `/` or `/app` | Shell landing | Authenticated entry, global navigation, module availability |
| `/booking` or `/app/booking` | Booking list | Mounted Booking list, search/filter/create entry |
| `/booking/[id]` or `/app/booking/[id]` | Booking detail | Mounted Booking detail/action/evidence surface |
| `/access-denied` or shell-local denied state | Feedback | Access denied within shell frame |
| `/signed-out` | Feedback | Signed-out confirmation and sign-in again action |

Application design shall choose the final route namespace, but must preserve list and detail routes for Booking.

## List Page Spec

Desktop:

- Page title: `Booking`.
- Controls row: `New booking`, search input, filter trigger, refresh if already present in Booking.
- Table columns: booking reference, status, origin/destination summary if available, updated timestamp, row actions.
- Pagination or recent-list behavior follows preserved Booking app behavior.

Mobile:

- Controls stack vertically.
- Booking rows render as cards with booking reference, status, route summary, and primary action.
- Filters open in a drawer or inline disclosure; no nested modals.

States:

- Loading: skeleton rows/cards with text "Loading bookings".
- Empty: message plus create action if allowed.
- Error: retry action plus correlation id.
- No permission: render access denied inside shell.

## Detail Page Spec

Desktop:

- Header: booking reference, status badge, primary action area.
- Summary: key preserved Booking fields only; W2-01 does not expand Booking domain depth.
- Evidence panel: subject, actor-header source, authorization result, correlation id.
- Action feedback: inline success/error status, announced politely.

Mobile:

- Header and primary action stack above summary.
- Evidence panel collapses under a labelled section.
- Breadcrumb truncates middle segments but keeps current booking visible.

## Component Specifications

### Shell Frame

| Field | Value |
|---|---|
| Component | Shell Frame |
| Description | Authenticated layout with top bar, navigation, breadcrumbs, and main content |
| Category | layout / navigation |

#### States

| State | Description | Trigger |
|---|---|---|
| loading-session | Checking session before protected content renders | route load |
| authenticated | Session present and shell can render | session resolved |
| unauthorized | Session present but module action denied | identity/Booking decision |
| signed-out | Session cleared | sign-out completes |
| error | Shell cannot resolve session or route state | auth/session failure |

#### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| session | SessionSummary | yes | none | Server-derived subject, display name, roles |
| activeNav | string | yes | `home` | Active shell nav item |
| breadcrumbs | array | yes | empty | Breadcrumb labels and hrefs |
| children | ReactNode | yes | none | Mounted module content |

#### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Top bar plus drawer navigation; drawer closes after selection |
| tablet (768-1024px) | Collapsed rail or drawer; breadcrumbs remain visible |
| desktop (>1024px) | Expanded side navigation and full breadcrumbs |

#### Accessibility

| Requirement | Implementation |
|---|---|
| Landmarks | `header`, `nav`, `main` |
| Keyboard interaction | Skip link first; Tab reaches nav, user menu, and main content |
| Label / aria-label | Navigation labelled `Primary`; user menu has visible display name |
| Contrast ratio | WCAG AA |
| Screen reader | Route changes update `h1` and document title |
| Focus management | Focus moves to `h1` on route change and signed-out heading after sign-out |

### Booking Module Mount

| Field | Value |
|---|---|
| Component | Booking Module Mount |
| Description | Shell-mounted Booking list/detail/action area |
| Category | layout / display |

#### States

| State | Description | Trigger |
|---|---|---|
| loading | Booking data request in progress | list/detail load |
| populated | Booking data available | request success |
| empty | No records available | request success with empty list |
| denied | User lacks Booking permission | authz deny |
| error | Backend or BFF error | request failure |

#### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| sessionSubject | string | yes | none | Subject used for BFF/backend calls |
| correlationId | string | yes | generated | Request/evidence correlation |
| routeContext | object | yes | none | List or detail route context |

#### Accessibility

| Requirement | Implementation |
|---|---|
| Table/card semantics | Use table headers on desktop and labelled card groups on mobile |
| Keyboard interaction | Row actions and create action are keyboard reachable |
| Screen reader | Loading, success, denied, and error states use text and `aria-live` where dynamic |
| Focus management | Denied state focuses the denied heading |

### User Menu

| Field | Value |
|---|---|
| Component | User Menu |
| Description | Session-aware menu with sign-out |
| Category | navigation / feedback |

#### States

| State | Description | Trigger |
|---|---|---|
| closed | Menu hidden | default |
| open | Menu actions visible | user activates menu |
| signing-out | Sign-out request pending | sign-out click |
| signed-out | Session cleared | sign-out success |

#### Accessibility

| Requirement | Implementation |
|---|---|
| Keyboard interaction | Enter/Space opens; Escape closes; arrow keys optional if menu pattern supports them |
| Label | Button labelled with visible user name or `User menu` |
| Focus management | Focus returns to trigger when closed; moves to signed-out heading after sign-out |

## States

No screen may show only a raw status string.

| State | Required behavior |
| --- | --- |
| Loading | Skeleton or status text; no protected module data before session validation |
| Empty | Explain empty Booking state and show allowed next action |
| Error | Text explanation, retry/back action, correlation id when available |
| No permission | Access denied inside shell with request-access/back actions |
| Success | Inline confirmation with `aria-live=polite`; evidence panel updated |
| Signed out | Session cleared and protected routes redirect on revisit |

## Design System Usage

Use existing `@erp/ui` or shared primitives when present: Button, Input, Table, Badge, Tabs or section navigation, Drawer, Toast/status message, EmptyState, Skeleton, and layout primitives. Do not add Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, Moment.js, local inline style objects, or hardcoded hex palettes.

Any missing primitive should be recorded as a W2-02 follow-up unless it is the minimum shell primitive needed for W2-01.

## Domain-True Forms

Booking create/detail/action forms preserve existing Booking domain behavior. W2-01 does not redefine routing, equipment, charge, or DCSA domain depth. If a preserved Booking action requires reference data, it must continue using existing lookup behavior; W2-01 only changes shell/session context and actor propagation.

## Prior-Work Preservation

- W0-01 platform/eventing: the shell may display correlation/evidence values needed for W2-01 proof, but it must not redesign eventing, outbox, messaging, platform telemetry, or service event contracts.
- W0-02 reference data: Booking forms and summaries may continue consuming reference-data lookups through existing public interfaces, but this stage does not alter seed/completeness surfaces or migrate the reference-data UI.
- W1-01 Booking: list/detail/create/action behavior is preserved while session-derived actor propagation is fixed.
- W2-02 design system: shell primitives are scoped to W2-01 unless a later design-system intent accepts them as shared foundation.

## Accessibility & Responsiveness

Follow `accessibility-checklist.md`. Required checks include WCAG 2.1 AA contrast, keyboard-only navigation, skip link, landmarks, route-heading focus, labelled user menu, no color-only statuses, responsive no-overlap checks, and status announcements for async Booking actions.

## Open Questions

1. Final route namespace is deferred to application design: `/booking` under root shell or `/app/booking` under an app namespace.
