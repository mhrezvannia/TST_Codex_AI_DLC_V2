# Rough Wireframes — W4-01 Module List-Detail Uplift

## Sources, Fidelity, and Guardrails

Sources: `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`.

These ASCII wireframes establish information hierarchy and user-flow shape only. Exact columns, filters, actions, route parameters, labels, and component mappings remain subject to approved Requirements, User Stories, and ordered Refined Mockups tasks 21 → 22 → 23.

All screens sit inside the existing authenticated LinerCore shell, consume `@erp/ui` and `--erp-*` tokens, and introduce no domain-local chrome, theme, auth, or shared-component fork.

## Shared Shell and List Pattern — Desktop

```text
+----------------------------------------------------------------------------------+
| Skip to main | LinerCore | Global status | User menu | Sign out                 |
+----------------------+-----------------------------------------------------------+
| Overview             | Breadcrumb: Module                                       |
| Booking              |                                                           |
| Charge Agreements    | H1 Module records                    [Primary command]*   |
| Container Movement   | Short operational context + result/status region          |
| Reference Data       |                                                           |
|                      | [Search________________] [Filter v] [Filter v] [Clear]      |
|                      | Active filters...                       N results           |
|                      | +-------------------------------------------------------+ |
|                      | | Record link | Key fact | Status | Updated | Row menu* | |
|                      | |-------------------------------------------------------| |
|                      | | exact name  | value    | text+icon | time | ...       | |
|                      | | exact name  | value    | text+icon | time | ...       | |
|                      | +-------------------------------------------------------+ |
|                      | Showing x-y of n                 [Prev] 1 2 ... [Next]    |
+----------------------+-----------------------------------------------------------+
| * Commands/menus render only when real capability and permission allow.          |
+----------------------------------------------------------------------------------+
```

Accessibility note: `h1` names the module; landmarks are header, primary nav, and main; skip link and then page heading are the keyboard entry path; search/filters have persistent labels; result/status changes use an appropriate live region; record names are real links.

## Shared List States

```text
LOADING       Search/filter shell stays stable; table-shaped Skeleton reserves space.
TRUE EMPTY    "No records available" + permitted creation/help action, no filters blamed.
FILTER EMPTY  "No records match" + visible active filters + Clear filters.
DENIED        Named access-denied heading, reason/help/request path; no data flash.
ERROR         Provider-safe message + correlation/reference + Retry; filters preserved.
DEGRADED      Status strip names unavailable facet; trustworthy rows remain visible.
STALE         Last-updated evidence + Refresh; never imply current truth silently.
POPULATED     Count, supported controls, stable columns, record links, pagination.
```

Accessibility note: each state keeps the same `h1` and main landmark; keyboard focus moves only when the user initiates navigation; async changes are announced without stealing focus; color is never the sole status channel.

## Shared Detail Pattern — Desktop

```text
+----------------------------------------------------------------------------------+
| Existing LinerCore header and module navigation                                  |
+----------------------+-----------------------------------------------------------+
| Module nav          | Breadcrumb: Module / Record ID                              |
|                     | [Back to results]                                            |
|                     | H1 Record identity              [Status text+icon]           |
|                     | Supporting identifiers / owner / validity                    |
|                     |                                  [Permitted action] [More]   |
|                     |-------------------------------------------------------------|
|                     | Tabs: [Summary] [Domain section] [History/timeline]          |
|                     |                                                             |
|                     | H2 Selected section                                         |
|                     | +---------------------------+  +--------------------------+ |
|                     | | Primary domain facts      |  | Related record links     | |
|                     | | labelled value pairs      |  | exact Booking, etc.      | |
|                     | +---------------------------+  +--------------------------+ |
|                     |                                                             |
|                     | > Audit and evidence (collapsed)                            |
+----------------------+-----------------------------------------------------------+
```

Accessibility note: `h1` is the exact object identity; header/nav/main landmarks remain owned by the shell; Back to results is the first page-level keyboard action; tabs follow the shared keyboard pattern; action feedback is announced and focus returns to the invoking control/dialog trigger.

## Detail Action State Pattern

```text
READY      permitted command visible; denied commands absent or explicitly read-only.
VALIDATE   persistent labels + inline linked errors + summary where needed.
CONFIRM    scoped dialog for destructive/irreversible action; focus trapped/restored.
PENDING    command disabled against duplicate submit; in-context progress announced.
SUCCESS    provider result and new status visible; non-blocking confirmation announced.
CONFLICT   current provider state explained; refresh/review path preserves user context.
ERROR      safe message + retry/recovery; entered data and selected tab preserved.
```

Accessibility note: dialogs have accessible names/descriptions, safe Escape behavior, focus trap and restoration; status messages use live regions; disabled/read-only meaning is available to assistive technology.

## Reference Data Variant

```text
LIST:   H1 Reference Data
        Search set/record | set/type/status filters | provider-supported sort/page
        Record link | Set/type | Readable name/code | Status | Updated | permitted menu

DETAIL: H1 <Reference record name/code>  [Status]  [Permitted reference action]
        Tabs: Summary | Attributes | History
        Summary: identity, set/type, description, ownership/effective facts
        Attributes: provider-owned labelled values and relationships
        History: domain change/lifecycle evidence
        No workflow ribbon
```

Accessibility note: one `h1`, shell header/nav/main landmarks, Back to results keyboard entry, semantic attribute labels, and accessible history status; code is paired with readable meaning.

## Charge Agreements Variant

```text
LIST:   H1 Charge Agreements
        Search | status/partner/validity filters | provider-supported sort/page
        Agreement link | Partner | Validity | Status | Currency/evidence | menu

DETAIL: H1 <Agreement ID / readable name>  [Lifecycle status]  [Permitted action]
        Tabs: Summary | Rates | D&D | Status history
        Summary: parties, validity, mode/trade-lane/service context
        Rates: currency, basis, rate/agreement version and source evidence
        D&D: domain-owned terms and applicability
        Status history: lifecycle evidence
        Related: exact Booking link(s)
```

Accessibility note: one `h1`, shell landmarks, Back to results keyboard entry, currencies/rates announced with context, statuses include text, and exact Booking targets have descriptive link purpose.

## Container Movement Variant

```text
LIST:   H1 Container Movement
        Search journey/container/booking | status/event filters | supported sort/page
        Journey link | Container | Linked Booking | Latest event | Status | Updated

DETAIL: H1 <Journey / container identity>  [Journey status]  [Permitted action]
        Tabs: Summary | Movement timeline | Linked booking
        Summary: journey identity, equipment, route/locations, current state
        Timeline: ordered expected/actual milestones
                  DCSA code + readable meaning | occurred/received | source | validation
                  explicit sequence/late/degraded warnings
        Linked booking: exact Booking identity and canonical shell link
        Audit: raw payload/schema only in collapsed evidence when useful
```

Accessibility note: one `h1`, shell landmarks, Back to results keyboard entry, timeline uses a semantic ordered structure, every DCSA code has readable text, and warnings are not color-only.

## Narrow Layout — 375/390

```text
+--------------------------------------+
| Existing compact shell header/menu   |
| Skip to main                         |
+--------------------------------------+
| Breadcrumb                           |
| H1 Module records                    |
| [Primary command]*                   |
| [Search____________________________] |
| [Filters (n)] [Clear]                |
| N results / status                   |
| +----------------------------------+ |
| | Record link | Key status         | |
| | Secondary columns continue  ---> | |
| +----------------------------------+ |
| Intentional table scroll region      |
| [Prev]              [Next]           |
+--------------------------------------+

DETAIL
| Back to results                       |
| H1 Record identity                    |
| Status + primary action               |
| Tabs scroll within their own region   |
| One-column labelled facts/sections    |
| Collapsed audit evidence              |
```

Accessibility note: document focus order follows visible order; the table scroll region is labelled and keyboard reachable without trapping focus; record links/status remain visible at rest; no page-level horizontal overflow; touch targets and control text remain usable.

## Information Architecture

```text
LinerCore shell
|-- Overview
|-- Booking
|-- Charge Agreements
|   |-- Agreement list
|   `-- Agreement detail: Summary / Rates / D&D / Status history
|-- Container Movement
|   |-- Journey list
|   `-- Journey detail: Summary / Movement timeline / Linked booking
`-- Reference Data
    |-- Set/record list
    `-- Record detail: Summary / Attributes / History
```

Canonical cross-links connect exact Agreement and Journey records to exact Booking records through shell routes. There is no module-local shell or alternate canonical standalone experience.

## Refined-Mockup Inputs Still Required

- Approved provider capability matrices, filters, sortable fields, page-size behavior, and actions.
- Canonical route registry and return-context parameter rules.
- Permission/read-only/denied behavior by actor.
- Exact domain fields, relationships, timeline ordering, and status vocabulary.
- Component gaps that require UI-platform ownership.
- Testable acceptance criteria for every state, breakpoint, theme, and cross-link.

## Review

**Verdict: READY** for progression to Requirements Analysis. This is approval of the low-fidelity concept and flow boundary, not approval to begin engineering or of the deferred fields, actions, routes, permissions, and component mappings.

- **Customer clarity and completeness:** The primary find, inspect, act, recover, and return journeys are understandable across the shared list/detail pattern and all three domain variants. Loading, empty, denied/read-only, error, degraded, stale, not-found, validation, conflict, and success outcomes are represented across the wireframes and companion flow at sufficient fidelity for the next stage.
- **Scope protection:** The artifacts consistently retain the existing authenticated shell, reject module-local chrome and unsupported capabilities, condition commands on provider capability and permission, exclude a workflow ribbon from Reference Data, and keep exact domain behavior deferred. Nothing presented requires bulk actions or a new generic domain component.
- **Traceability and sensors:** `wireframes.md`, `user-flow.md`, and `rough-mockups-questions.md` each identify `intent-statement.md`, `scope-document.md`, and `intent-backlog.md`; the primary and secondary artifacts also contain the required section structure. The declared `required-sections` and `upstream-coverage` expectations are therefore satisfied on the review evidence.
- **Accessibility and responsive continuity:** Every screen family includes headings, landmarks, keyboard entry/order, focus behavior, labels or link purpose, non-color status, announcements, and narrow-layout handling. The labelled table overflow region and preservation of record identity/status at 375/390 protect the core task without promising a mobile redesign.
- **Requirements handoff:** Requirements must now resolve the enumerated capability matrices, routes and safe return context, actor permissions, exact fields/status vocabulary, applicable state-by-module rules, breakpoints/themes, and ownership of any `@erp/ui` gap. Those are explicit next-stage decisions and must not be inferred from the illustrative labels in these mockups.
