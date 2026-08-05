# LinerCore Phase 1 Demo UI/UX Prompt Playbook

> Standalone ready-to-paste prompts now live in
> [`docs/ui-ux-prompts/`](ui-ux-prompts/README.md). Use the numbered sequence in
> that directory. The rest of this document remains the consolidated reference.

## Purpose

Use this playbook to redesign the Phase 1 demo as one coherent enterprise ERP
for an ocean shipping line. The prompts are design-first: produce information
architecture, wireframes, interaction behavior, responsive states, and a
high-fidelity specification before changing production code.

The current application stack is Next.js App Router with a shared `@erp/ui`
package. Preserve the real domain workflows, API contracts, routes, test IDs,
authorization behavior, and server-side data boundaries.

## Current Demo Page Inventory

Gateway origin: `http://127.0.0.1`

| # | Surface | Route | Current purpose |
|---|---|---|---|
| 1 | ERP shell overview | `/` | Authenticated workspace, session, mounted modules, trace context |
| 2 | Auth gateway | `/auth/` | Identity gateway and sign-in entry |
| 3 | Sign-in handoff | `/auth/sign-in` | Explain and initiate Keycloak sign-in |
| 4 | Keycloak login | `http://127.0.0.1:8080/...` | Username/password authentication |
| 5 | Current session | `/auth/session` | Safe session summary and sign out |
| 6 | Access denied | `/auth/access-denied` | Authorization denial and recovery |
| 7 | Request access | `/auth/request-access` | Submit an auditable access request |
| 8 | Signed out | `/auth/signed-out` and `/signed-out` | Session-cleared confirmation |
| 9 | Reference Data workbench | `/reference-data/` | Reference sets, records, detail, contract status, create/edit |
| 10 | Reference Data denied | `/reference-data/access-denied` | Module-specific denial |
| 11 | Charge Agreements workbench | `/charge-agreements/` | Rates, approvals, agreement binding, pricing preview |
| 12 | Booking operations queue | `/bookings` | Search, filter, scan, and open bookings |
| 13 | New Booking | `/bookings/new` | Create a booking draft from canonical reference data |
| 14 | Booking detail | `/bookings/{bookingId}` | Validate, price, confirm, inspect journey and lifecycle |
| 15 | Booking not found/error states | `/bookings/{unknownId}` | Recovery from missing or unavailable records |

`/booking` and `/booking/{bookingId}` are compatibility routes that redirect to
the canonical `/bookings` routes. They do not need separate designs.

Container Movement currently has a live backend service but no deployable
frontend application. Its proposed screens are included as future Phase 1
prompts and must not be represented as already delivered.

## How To Run UI/UX Pro Max

### 1. Generate and persist the master design system

Run from the repository root:

```powershell
python .codex/skills/ui-ux-pro-max/scripts/search.py "enterprise ocean shipping ERP operational dashboard booking pricing charge agreements reference data track and trace data-dense accessible professional" --design-system --persist -p "LinerCore Enterprise Shipping ERP" -f markdown
```

The skill currently recommends a data-dense dashboard, WCAG AA behavior,
Lexend headings, Source Sans 3 body text, blue information color, and amber
attention color. Treat its "Enterprise Gateway" landing-page recommendation as
irrelevant to the authenticated ERP. LinerCore is an operational tool, not a
marketing site.

### 2. Add page-specific design-system overrides

Example:

```powershell
python .codex/skills/ui-ux-pro-max/scripts/search.py "enterprise shipping booking operations queue dense table filters exception management" --design-system --persist -p "LinerCore Enterprise Shipping ERP" --page "booking-list" -f markdown
```

Repeat with the page names in this playbook. A page override may refine layout
or workflow behavior, but it must not introduce a separate visual identity.

### 3. Invoke the skill in Codex for design work

Open a Codex conversation and send:

```text
$ui-ux-pro-max
[paste the Master Context Prompt]
[paste one Page Prompt]
Design only. Do not edit production code. Produce the requested UX artifacts.
```

After approving the design, run a second turn:

```text
$ui-ux-pro-max
[paste the Master Context Prompt]
[paste the approved Page Prompt and approved design decisions]
Implement this approved design in the existing Next.js application. Reuse
@erp/ui, preserve routes, behavior, APIs, authorization, and test contracts.
Verify at 390, 768, 1024, and 1440 pixels with Playwright.
```

Do one workflow at a time in this order: global shell, authentication, shell
overview, Booking list, Booking create, Booking detail, Reference Data, Charge
Agreements, then cross-application states. This keeps the shared system stable
and makes visual review meaningful.

## Required Output From Every Design Prompt

The designer must return:

1. User and task assumptions.
2. Information hierarchy and primary/secondary actions.
3. Desktop low-fidelity wireframe using labeled regions.
4. Mobile low-fidelity wireframe using labeled regions.
5. High-fidelity visual specification with tokens and component names.
6. Interaction specification for keyboard, mouse, loading, success, warning,
   empty, unavailable, validation, authorization, and destructive states.
7. Responsive behavior at 390, 768, 1024, and 1440 pixels.
8. WCAG 2.2 AA notes, focus order, announcements, and contrast requirements.
9. Reusable `@erp/ui` components and any justified page-specific components.
10. Acceptance checklist suitable for Playwright and visual regression tests.

## Master Context Prompt

```text
Act as a principal enterprise UX designer and design-system architect with
experience in ocean-carrier operations, freight booking, pricing, reference
data governance, identity and access management, and container track and trace.

Product: LinerCore, an enterprise ERP for an ocean shipping company.
Audience: booking agents, customer-service operators, pricing analysts, pricing
approvers, reference-data stewards, equipment/movement controllers, supervisors,
auditors, and platform administrators. Users work for long periods, scan large
tables, compare versions, resolve exceptions, and need traceable decisions.

Phase 1 workflow: authenticate -> enter the ERP shell -> maintain canonical
reference data -> configure and approve rates and customer agreements -> create
a booking -> validate references -> calculate and snapshot pricing -> confirm
the booking -> create/observe the container journey -> inspect lifecycle events.

Design goal: a quiet, credible, task-focused enterprise ERP. It must feel like
one product across all modules. Optimize for scanning, comparison, repeated
action, low error rates, and clear operational status. Use dense but organized
information, restrained styling, predictable navigation, and concise copy.

Global shell:
- Persistent left module navigation with recognizable Lucide icons and labels.
- Compact top bar with product name, environment, global search, notifications,
  help, and user menu.
- Breadcrumbs and a compact page header inside each module.
- Do not show a decorative journey ribbon on every page. Show workflow progress
  only when it helps complete the current task.
- Make active module and active page unmistakable.
- Provide a skip link and logical keyboard order.

Visual direction:
- Light-first neutral interface; optional dark mode only if equally usable.
- Neutral white and cool gray surfaces, near-black body text, restrained
  maritime blue for navigation/information, teal or green for success, amber
  for warnings, and red only for errors/destructive actions.
- Do not create a one-note blue UI. Use status colors semantically.
- No gradients, glassmorphism, decorative blobs, giant hero type, floating page
  sections, marketing cards, or illustration-first layouts.
- Cards only for repeated entities or genuinely bounded tools. Never nest cards.
- Border radius 4-8px, subtle borders, minimal shadows, stable hover states.
- Typography must be highly legible. Use Source Sans 3 or the existing Inter
  stack for body text and Lexend only for restrained headings if adopted.
- Use tabular numerals for money, quantities, versions, and timestamps.
- Minimum body size 14px on dense desktop screens and 16px for mobile forms.

Components:
- Build from shared @erp/ui tokens and primitives.
- Use Lucide icons; no emoji or hand-drawn icon system.
- Use tables for comparison, definition lists for record facts, tabs for stable
  views, segmented controls for mode, checkboxes for selection, select/combobox
  controls for canonical data, and dialogs only for focused decisions.
- Icon-only buttons are for familiar commands and require tooltips.
- Status badges must combine text, shape, and color. Never rely on color alone.
- Preserve stable row heights, toolbar heights, and control dimensions.

Enterprise behavior:
- Keep primary actions visible without making every action primary.
- Persist filters in the URL and clearly expose active filters.
- Support loading, empty, partial-data, stale-data, permission-denied, service
  unavailable, validation-error, conflict, and success states.
- Explain business consequences before approval, suspension, expiration,
  confirmation, or any irreversible action.
- Show correlation IDs and technical diagnostics in a collapsible support area,
  not as dominant business content.
- Never expose secrets, raw tokens, or unnecessary session JSON.
- Use concise shipping terminology and DCSA/UN/LOCODE/ISO 6346 conventions.

Accessibility and responsiveness:
- Meet WCAG 2.2 AA.
- All workflows must be keyboard complete with visible focus.
- Announce async state and errors through appropriate live regions.
- Put field errors beside fields and provide an error summary linked to them.
- At 390px, convert wide tables into prioritized rows or a deliberate horizontal
  table viewport; do not hide critical status or actions.
- No horizontal page overflow, overlapping controls, clipped identifiers, or
  text that escapes its container.

Technology constraints:
- Existing Next.js App Router applications.
- Prefer Server Components for initial data and minimal client islands.
- Preserve existing URLs, API contracts, auth boundaries, test IDs where tests
  depend on them, and domain behavior.
- The design must map to reusable code, not a disconnected visual concept.

For the target page below, produce all ten required design outputs. Do not edit
production code during the design pass. Clearly identify assumptions and any
domain questions that must be resolved before implementation.
```

## Page Prompt A: Keycloak Login

```text
Target: branded Keycloak login for LinerCore.

Design a secure, restrained login page for internal shipping-company users.
Use the LinerCore wordmark as the first visual signal. Include username, password,
show/hide password icon, sign-in button, forgot-password link only if supported,
language selector only if configured, and a compact environment indicator such
as "Local demo" or "UAT". Include invalid credentials, locked account, expired
session, identity provider unavailable, and submitting states.

Do not turn this into a marketing landing page. Avoid operational data before
authentication. Make trust, security, and recovery clear without exposing OIDC,
PKCE, client IDs, callback URLs, or implementation details. Provide a Keycloak
theme implementation map covering login template, error template, shared tokens,
logo asset, focus order, password-manager compatibility, and 390px behavior.
```

## Page Prompt B: Auth Gateway

```text
Target route: /auth/

Redesign the identity gateway as a compact authenticated-product entry screen,
not a hero page. Its purpose is to route a signed-out user to sign in, or a
signed-in user back to the ERP workspace. Show LinerCore identity, a one-sentence
security explanation, the primary "Sign in" command, and a secondary route back
to the workspace when a valid session exists.

Remove developer-facing runtime cards such as provider, BFF mode, fail-closed,
and correlation requirements from the main composition. Put diagnostic details
behind an optional "Technical details" disclosure available only in demo/admin
contexts. Design signed-out, session-detected, identity-service unavailable, and
redirect-in-progress states.
```

## Page Prompt C: Sign-In Handoff

```text
Target route: /auth/sign-in

Design the brief transition between LinerCore and Keycloak. The normal path
should require no confusing technical choices: explain that the user will
continue to the company identity service and then return to their requested
workspace. Primary action: "Continue to sign in". Secondary action: "Cancel".

Do not expose raw return URLs or client identifiers in the primary UI. Put safe
destination context in plain language, for example "You will return to Bookings".
Cover invalid return URL, expired transaction, redirect-in-progress, repeated
click prevention, and keyboard focus. The screen should feel like part of the
same ERP shell while revealing no protected module content.
```

## Page Prompt D: ERP Shell Overview

```text
Target route: /

Design the authenticated LinerCore workspace home for shipping operations. Use
the shared left navigation and compact top bar. Replace the current technical
walking-skeleton cards with an operational overview.

Show role-aware content: assigned work, bookings needing attention, pricing
exceptions, reference-data publication issues, recent activity, and module
shortcuts. For the demo use realistic data: 6 active bookings, 1 manual-pricing
exception, 3 approved rate versions, 1 approved customer agreement, 2 journeys,
and 1 pending movement event. Each metric must link to the filtered work queue.

Provide a compact "My work" list rather than a decorative KPI-card wall. Include
recently viewed records, service degradation banner, no assignments, partial
permissions, and first-login states. Technical correlation information belongs
in a support drawer, not a dashboard card.
```

## Page Prompt E: Current Session And User Menu

```text
Target route: /auth/session and the global user menu.

Design a useful account/session page for an enterprise operator. Show display
name, username/subject in a secondary technical field, assigned roles, business
scope, granted modules, session expiry, and last authentication time. Provide
"Return to workspace" and "Sign out" commands.

Do not make raw session JSON the primary action. If safe JSON is retained for
demo diagnostics, place it behind an admin-only disclosure with a copy button
and privacy warning. Design normal, expiring-soon, expired, reduced-permission,
and identity-service-unavailable states. Sign out must have visible progress and
a deterministic completion screen.
```

## Page Prompt F: Access Denied

```text
Target routes: /auth/access-denied and /reference-data/access-denied

Design a calm, specific authorization-denial page. Explain what action was
blocked, which resource was protected, and what the user can do next. Primary
recovery is "Request access" when supported; secondary actions are "Go back" and
"Return to workspace". Do not imply that retrying will bypass policy.

Show the reason in business language. Put reason code and correlation ID in a
copyable technical-details disclosure. Cover no-permission, business-scope
mismatch, expired session, feature unavailable, and request-already-open states.
Use an accessible error icon and heading, but avoid a giant red danger screen.
```

## Page Prompt G: Request Access

```text
Target route: /auth/request-access

Design an auditable access-request workflow for a shipping ERP. Show requested
module/resource, requested action, current user and business scope, approver or
team if known, business justification, requested duration, and acknowledgment
that access remains governed by policy.

Prepopulate immutable context from the denial event. Make justification required
with clear length guidance. Primary action: "Submit request"; secondary action:
"Cancel". Include duplicate request, validation, submitting, success with request
ID, policy rejection, and service-unavailable states. Never promise approval.
After success, offer "Return to workspace" and "View request" only if supported.
```

## Page Prompt H: Signed Out

```text
Target routes: /auth/signed-out and /signed-out

Design a compact signed-out confirmation that clearly says the LinerCore session
was cleared. Primary action: "Sign in again"; secondary action: close or return
to an approved public destination if one exists. Warn only when single sign-on
may still be active at the identity provider.

Do not display protected navigation, business records, or stale user details.
Cover normal sign-out, sign-out failure, already signed out, and automatic
redirect states. Maintain brand continuity with the login experience.
```

## Page Prompt I: Reference Data Workbench

```text
Target route: /reference-data/

Design a high-efficiency master-data administration workbench for reference-data
stewards. Existing capabilities: switch among reference sets; inspect canonical
records; see code, display name, lifecycle status and publication status; inspect
record identity/classification/relationships/audit data; create and edit records;
see write permission; request access; inspect contract compatibility and findings.

Use a three-region desktop layout: compact reference-set navigation, dominant
record table, and resizable detail panel or drawer. On smaller screens, turn the
detail into a full-screen drill-in rather than crushing three columns together.
Provide search, status filters, active/inactive counts, sorting, pagination,
sticky table header, row selection, and a clear create command.

Use realistic sets: Currency, Location/UNLOCODE, Party Customer, Vessel/Voyage,
Equipment Type, and Charge Code. Show sensitive-set labels without making every
set look alarming. Separate business record governance from the technical
contract catalog using tabs or a secondary view; do not place contract cards
under every table by default.

The create/edit form must support field-level validation, reason for change,
unsaved-change protection, conflict/version handling, publication progress, and
success confirmation. Include read-only, empty set, loading, stale fallback data,
publication failed, partial service outage, and access-denied states.
```

## Page Prompt J: Charge Agreements And Rate Authority

```text
Target route: /charge-agreements/

Design a commercial pricing workbench for pricing analysts and approvers.
Existing capabilities: list rate versions by Freight, Surcharge, and Local
category; inspect charge code, lane, equipment, location, amount, currency,
validity, status, and version; create a draft; approve a draft; select one
approved version per category; bind the three-category authority to a customer
agreement; preview the itemized Booking total.

Do not squeeze the entire lifecycle into one visually undifferentiated page.
Create clear views or tabs for Agreements, Rate Authority, and Approval Queue.
The default view should support table-first scanning with search, filters,
effective-date context, version comparison, and status. Use a contextual detail
drawer for the selected agreement or rate.

Use realistic demo data for customer "Northstar Retail", route USNYC to NLRTM,
equipment 22G1, currency USD, and three approved lines such as Ocean Freight,
Bunker Adjustment, and Terminal Handling. Show subtotal and final total with
tabular numerals. Label pricing basis and validity clearly.

Rate creation must use canonical comboboxes, not free-text IDs where reference
data exists. Approval requires a concise impact summary and confirmation.
Binding must show category coverage, missing requirements, selected versions,
agreement version, and the consequence for future Booking quotes. Include draft,
approved, suspended, expired, overlapping validity conflict, no matching rate,
manual pricing, stale version, loading, and service-unavailable states.
```

## Page Prompt K: Booking Operations Queue

```text
Target route: /bookings

Design the daily work queue for booking agents and customer-service operators.
Existing columns: booking number, customer, route, equipment, and status.
Existing filters: free-text search and status. Existing statuses include Draft,
Validated, Priced, Confirmed, Exception, and Manual Pricing.

Create a dense, highly scannable table with sticky header, sortable columns,
URL-persisted filters, active filter chips, result count, pagination, and a clear
"New booking" command. Add operationally useful columns or compact sublines for
voyage, departure, last update, pricing/journey exception, and assigned owner,
but preserve a sensible density.

Use realistic rows including booking
BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3, customer Northstar Retail, USNYC to
NLRTM, voyage VOY-LOCAL-002, equipment LCRU1000055 / 22G1, status Confirmed.
Include one manual-pricing exception and one draft requiring reference validation.

Rows must be keyboard navigable and opening a record must preserve list filters
for the Back action. On mobile, prioritize booking number, customer, route,
status, and exception indicator; provide a deliberate detail expansion. Design
loading skeleton, no results, no bookings, service unavailable, stale data,
partial fields/correction required, and permission-limited states.
```

## Page Prompt L: New Booking

```text
Target route: /bookings/new

Design an efficient booking-draft workflow. Existing fields: Customer, Load
UN/LOCODE, Discharge UN/LOCODE, Voyage, Equipment Type, Equipment ID, Commodity
Code, and fixed values for USD, FCL dry, non-reefer, non-dangerous goods. Voyage
selection can populate load/discharge locations. Values come from canonical
reference data.

Use a focused page with sections for Customer, Route and voyage, Equipment and
cargo, then Review. For the current MVP this may be one page with a compact
sticky summary rather than an artificial multi-step wizard. Use searchable
comboboxes that show code and display name. Make auto-populated values visible
and editable only where the domain allows. Validate ISO 6346 equipment identity,
UN/LOCODEs, route direction, and required reference choices.

Primary action: "Create draft"; secondary action: "Cancel". Prevent duplicate
submissions and preserve the idempotency behavior. Show field-level errors plus
a linked error summary. Cover reference choices loading/unavailable, invalid
voyage-route combination, duplicate equipment, stale reference value, unsaved
changes, submitting, success redirect, and server rejection. At 390px use one
column and keep actions reachable without obscuring fields.
```

## Page Prompt M: Booking Detail And Lifecycle

```text
Target route: /bookings/{bookingId}

Design the central operational record for a booking. Existing data: booking
number, status, revision, customer, one or more route legs and voyage, equipment
and quantities, currency, cargo mode, reefer/DG flags, reference validation,
pricing snapshot, manual-pricing exception, container journey status, and
lifecycle events. Existing actions validate references and progress the booking
through pricing and confirmation.

Use a compact record header with booking number, customer, status, revision,
primary next action, overflow actions, and Back preserving list context. Organize
the body with stable tabs: Overview, Charges, Journey, and Activity. Keep a
small next-action panel on Overview, but do not hide blockers in another tab.

Overview: route timeline, voyage, equipment, cargo flags, validation status, and
operational blockers. Charges: itemized pricing lines, currency, basis, rate
version, subtotal/total, agreement, quote ID, and pricing timestamp. Journey:
container identity, current event, next expected event, last known location,
event timeline, and explicit PENDING_EVENT explanation. Activity: chronological
business lifecycle with actor and timestamp; technical correlation IDs live in
a collapsible support section.

Use realistic confirmed data:
- Booking: BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3, revision 1.
- Customer: Northstar Retail.
- Route: USNYC to NLRTM, voyage VOY-LOCAL-002.
- Equipment: LCRU1000055, 22G1, quantity 1.
- Cargo: FCL dry, USD, not reefer, not dangerous goods.
- Pricing: approved agreement with itemized Freight, Surcharge, and Local lines.
- Journey: show PENDING_EVENT as an honest integration state until the real
  container-movement event projection is complete.

Design Draft, Validating, Validation Failed, Validated, Pricing, Manual Pricing,
Priced, Confirming, Confirmed, Exception, and legacy-incomplete variants.
Irreversible actions require impact confirmation. Include loading, unavailable,
not found, partial pricing, journey unavailable, stale revision conflict, async
success, and retry behavior. Ensure very long booking IDs, hashes, and correlation
IDs wrap or truncate with copy affordances without horizontal overflow.
```

## Page Prompt N: Booking Not Found And Service Errors

```text
Target: Booking not found, Booking unavailable, and cross-module error recovery.

Create a consistent state pattern for missing records, temporary service outage,
permission denial, stale/deleted record, invalid deep link, and partial module
failure. State what happened in business language, preserve the user context,
and provide the most useful recovery: Back to filtered list, Retry, Request
access, or Return to workspace.

Do not expose stack traces or make every failure a full-screen red panel. Put
correlation ID, timestamp, service name, and copy action in technical details.
Define inline, section-level, page-level, and global-banner error patterns so
teams choose the smallest appropriate interruption. Include accessible live
announcements and focus placement after errors.
```

## Page Prompt O: Global Loading, Empty, Success, And Notification States

```text
Target: shared state library across all LinerCore pages.

Design reusable patterns for initial loading, table loading, row mutation,
button progress, empty collection, filtered-empty result, partial data, stale
fallback data, optimistic success, saved success, warning, validation summary,
authorization loss, connectivity loss, and background event arrival.

Specify when to use skeletons, inline spinners, banners, toasts, status text, or
dialogs. Toasts must not carry critical information and must be announced
accessibly. Preserve layout dimensions while loading. Define notification
priority, placement, duration, dismissal, and reduced-motion behavior. Map each
pattern to reusable @erp/ui primitives and Playwright acceptance checks.
```

## Future Page Prompt P: Container Journeys Queue

```text
Future target route: /container-movements or /journeys

This page does not exist in the current demo. Design it for implementation after
W2-04 closure. Create an operations queue for container journeys derived from
confirmed bookings. Show container, booking, customer, route, current DCSA event,
event time, location, next expected event, exception flag, and data freshness.
Support search by container or booking, filters by event/status/location, and
exception-first triage. Include no event yet, delayed event, out-of-sequence
event, duplicate event, unknown container, and service-unavailable states.
```

## Future Page Prompt Q: Container Journey Detail And Movement Capture

```text
Future target route: /journeys/{journeyId}

This page does not exist in the current demo. Design the journey detail around a
DCSA-aligned movement timeline. Show booking and equipment context, origin and
destination, current movement status, event classifier/type, event and recording
times, UN/LOCODE, transport call/voyage, source, and audit information.

Provide a controlled "Record movement" workflow for authorized operators using
canonical event codes and locations. Prevent impossible or out-of-sequence
transitions, explain corrections, preserve append-only history, and require a
reason for manual correction. Show event accepted, publication pending,
published, rejected, duplicate, and replay states. Design the Booking backlink
and make cross-module context obvious without duplicating Booking data.
```

## AI-DLC Involvement

This redesign spans W2-01 shell/auth, W2-02 design system, W2-03 pricing, Booking,
and future W2-04 movement UI. Do not hide it inside the currently active Charge
Agreement intent. Use a dedicated feature intent such as
`phase1-erp-ui-redesign`, or explicitly make it the final W2-02 design-system
closure scope if that ownership is preferred.

During AI-DLC:

| Stage | UI/UX Pro Max contribution |
|---|---|
| Rough Mockups | Global shell, login, queue, form, and detail low-fi wireframes |
| Requirements Analysis | Usability, accessibility, density, responsive, and workflow requirements |
| User Stories | Role-based stories and state/error acceptance criteria |
| Refined Mockups | Approved desktop/mobile high-fidelity specifications |
| Application Design | @erp/ui tokens, component inventory, route and state mapping |
| Code Generation | Implement one approved workflow at a time |
| Build and Test | Playwright flows, screenshots, pixel/overflow checks, axe/WCAG checks |

Recommended review gates:

1. Approve global shell and visual system.
2. Approve end-to-end Booking flow from login through detail.
3. Approve Reference Data and Charge workbenches.
4. Approve shared error/loading/accessibility state library.
5. Implement and verify each gate before starting the next visual family.
