# W4-01C Container Journeys List-Detail Uplift

**Status:** Approved page-level design input on 2026-08-09, with disclosed blockers  
**Prepared:** 2026-08-09  
**Scope:** Container Movement page-level design only; no production implementation or AI-DLC state change  
**Lifecycle position:** W4-01 Refined Mockups design input, after approved Requirements Analysis and User Stories  
**Repeated pattern:** Reviewed Reference Data list-detail grammar, specialized for append-only movement evidence and capture outcomes

This candidate defines the first canonical Container Movement frontend experience. It does not describe an implemented CMM page: the current checkout contains the service and Booking projection UI, but no CMM frontend source, shell page mount, or shell navigation item. The proposal therefore remains an Application Design input for two routes inside the existing LinerCore shell. It creates no replacement shell, standalone canonical app, domain-local theme, or `@erp/ui` fork.

## Authority, Ownership, and Evidence

### Authority order

When sources disagree, this design uses the following order:

1. Approved W4-01 Requirements Analysis and User Stories.
2. Security, accessibility, enterprise frontend, safe-navigation, and provider-truth requirements.
3. `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, the single shell, and executable `@erp/ui`.
4. Container Movement page contract and approved W2-04 refined/application artifacts.
5. Reviewed W4-01A Reference Data list-detail pattern.
6. Prompts 90/91 and UI/UX Pro Max recommendations, as advisory input only.

The older CMM page contract and prompts propose search, filters, sorting, pagination, route/voyage facts, expected-event lateness, correction, and publication evidence. The approved W4 provider matrix and current source do not expose those capabilities. They are absent or explicitly blocked here rather than simulated or derived in the browser.

### Ownership boundary

| Concern | Owner | Design consequence |
|---|---|---|
| Authenticated shell, global navigation, top bar, breadcrumbs, theme, and route registry | LinerCore platform | CMM renders inside the existing shell; adding the permitted nav destination is a platform-owned dependency. |
| Tokens, typography, spacing, status language, focus, motion, and shared responsive primitives | `@erp/ui` platform owner | CMM consumes shared exports and never creates a local palette, font, theme, shell, drawer framework, or shared component fork. |
| Journey terminology, movement ordering, capture policy, freshness, dependency, and conflict facts | Container Movement service | The UI displays provider facts and typed outcomes; it does not calculate a new journey status or next legal move. |
| CMM routed composition, BFF/view-model mapping, and page-specific copy | Container Movement UI owner | CMM owns its list/detail/timeline/capture composition without owning global chrome. |
| Canonical Booking record and Booking detail composition | Booking | CMM shows exact `bookingId`/revision and links to Booking; it does not recreate Booking detail. |
| Location labels and active-location lookup | Reference Data | Location selection/resolution requires a canonical provider-backed lookup; raw IDs remain the safe fallback. |
| `booking.confirmed` and `containermovement.status` delivery | Existing service/event owners | UI distinguishes accepted CMM truth from publication and Booking application; it never advances those states optimistically. |

### Verified source and route inventory

Statuses describe the named evidence only. A source-observed pass is not a runtime pass.

| Item | Status | Evidence and design treatment |
|---|---|---|
| Active W4-01 requirements and stories | PASS — approved artifacts present | FR-007/008 and US-011/012/013 bind the recent-list, stable detail, exact Booking link, and non-optimistic capture behavior. |
| Reviewed Reference Data repeated pattern | PASS — approved design present | Reuses canonical page hierarchy, URL/return context, state honesty, responsive records, focus recovery, and evidence vocabulary. |
| W2-04 refined artifacts | PASS — approved artifacts present | Interaction spec, mockups, mapping, and accessibility checklist define CMM vocabulary, one timeline, capture outcomes, and ownership. W4 narrows unsupported controls to current provider truth. |
| Named reviewed designs 90/91 | BLOCKED | Only prompt files `90-container-journeys-queue-future.md` and `91-container-journey-detail-future.md` exist; no reviewed output documents were found. They are advisory, not approval evidence. |
| CMM frontend source | PASS — absence verified | `apps/container-movement` and shell-local CMM page folders are absent. Existing apps are auth, booking, charge-agreements, reference-data, and shell. |
| Canonical CMM route mount | BLOCKED | No frontend route implements `/container-movement` or `/container-movement/journeys/[journeyId]`. This document proposes them for Application Design. |
| Shell CMM navigation item | BLOCKED | Current shell navigation includes Home, Bookings, Reference Data, and Charge only. The auth gateway recognizes `/container-movement`, but that allowlist is not a mount or navigation entry. |
| Booking-side CMM presentation | PASS — source observed | Booking has an embedded `JourneyStatusPanel` over projected movement statuses. It is not a CMM list/detail frontend and currently provides no verified canonical Journey link. |
| CMM recent/detail/by-Booking reads | PASS — source observed | Service exposes `GET /api/container-movement/journeys`, detail by journey ID, and lookup by verified Booking ID. |
| CMM capture endpoint | PASS — source observed | Service exposes `POST .../journeys/{id}/movements` with typed 409 conflict evidence and returns authoritative Journey state. Browser/BFF identity handling requires correction before UI use. |
| Search/filter/sort/page provider contract | BLOCKED | Recent list supports fixed recent order plus bounded `limit` only. Search, filters, selectable sort, cursor, total count, and pagination are unsupported. |
| Route/voyage/customer/late-event/exception projections | BLOCKED | Current Journey response supplies no customer, voyage/transport call, route object, expected due time, or separate exception reason. Status `EXCEPTION` may be displayed when returned. |
| Correction command/evidence | BLOCKED | No correction/supersession field, reason, relationship, or command exists in the current CMM source. Prior movements remain immutable; no correction UI is offered. |
| Publication status in Journey response | BLOCKED | Outbox state exists internally but no Journey/API response exposes publication pending/published/failed evidence. UI may not infer it. |
| Running demo/visual evidence | BLOCKED | No browser surface was available in this session, and no CMM route source exists to render. Runtime, visual, keyboard, theme, and responsive evidence remain future acceptance work. |

### Current provider contract used by this design

The current Journey response exposes:

- journey ID, Booking ID/revision, and container ID;
- provider `MovementStatus`;
- expected movements with sequence, classifier code, move code, and location ID;
- accepted movement history with event ID/type, container ID, location ID, occurrence time, dedupe key, and correlation ID;
- `updatedAt`, `freshness`, `dataUpdatedAt`, `captureDisabledReason`, `captureEnabled`, `dependency`, and `checkedAt`.

It does not expose route/voyage/customer facts, received time, event source/actor, empty indicator, correction relationship, expected due time, exception reason, publication state, or Booking application state. Those omissions govern the design.

## UI/UX Pro Max Decision Record

Adopted advisory guidance:

- dense, table-first recent-work queue;
- semantic mobile records instead of a viewport-breaking table;
- one readable vertical ordered timeline;
- stable skeletons and explicit asynchronous feedback;
- keyboard-first interaction, persistent form labels, linked errors, visible focus, and non-color status;
- predictable browser Back behavior, route-level loading/error boundaries, and server-rendered reads;
- touch-sized targets and reduced-motion support.

Rejected or superseded guidance:

- enterprise marketing gateway, hero, sales CTA, logo carousel, decorative charts/maps, KPI card wall, and nested cards;
- replacement blue/amber palette, Fira font family, remote fonts, or new theme tokens;
- generic queue search/filter/sort/page controls unsupported by the provider;
- exception-first saved view or bulk actions;
- client-derived late/next-event, route/voyage, publication, or correction truth;
- spinner-first loading, click-only rows, scale-hover effects, or page-level mobile overflow;
- a standalone `/journeys` application, second shell, or CMM-local shared component library.

## Users, Stories, and Task Outcomes

| User / approved story | Primary outcome in this design |
|---|---|
| Container Operations User — US-011 | Scan the provider's fixed recent Journey set, understand no-event/freshness truth, and open a stable Journey without simulated controls. |
| Container Operations User — US-012 | Inspect exact container/Booking identity, one ordered movement timeline, provider freshness, and an exact Booking link. |
| Authorized Container Operations User — US-013 | Record one supported movement, see accepted or typed rejected truth, and never see optimistic Journey/publication/Booking advancement. |
| Booking Operations User — US-014 | Open a Journey only from provider lookup by exact `bookingId`, with honest absent/denied/degraded outcomes. |
| Auditor / read-only user | Read provider Journey and evidence without mutation controls or raw transport data dominating the workflow. |

Success means the operator can answer: which Journey/container is this, what has actually been accepted, what planned movements the provider returned, whether current data is fresh enough to act, and whether downstream publication/application is proven or unavailable.

## Information Architecture and Route Proposal

### Proposed canonical routes

| Route | Type | Responsibility | Current implementation status |
|---|---|---|---|
| `/container-movement` | List | Fixed recent Journey list, bounded limit, Refresh, state handling, stable row links | BLOCKED — frontend/mount absent |
| `/container-movement/journeys/[journeyId]` | Detail | Summary, Movement timeline, Linked booking, capture action, collapsed support evidence | BLOCKED — frontend/mount absent |

There is no Journey create route: `booking.confirmed` owns creation. There is no correction, capture-result, publication, or audit route. Record Movement stays in the detail action composition because the current provider supports one capture command and the W4 responsive contract stacks the action rail at 768px.

Application Design must choose the source boundary that fits the existing shell/mount architecture. This document does not invent `apps/container-movement` as an already-decided application. Whichever source boundary is chosen, it must be CMM-owned routed composition inside the one shell, consume `@erp/ui`, use a BFF, and avoid app-to-app imports.

### Shell and navigation proposal

- Platform-owned sidebar label: **Container Movement**.
- Position: after Charge Agreements and before Reference Data, matching the LinerCore master.
- Visibility: only when the current authenticated session has the exact module-read capability confirmed by Application Design.
- Active state: explicit route metadata for `/container-movement`, never title inference.
- List route has no workflow ribbon. Detail may show contextual shell metadata only if the shared contract can represent it without selecting a Booking workflow falsely.
- Direct denied links render the shared denied state with no Journey data flash.

### Detail views

The detail route uses stable URL-backed views:

1. `Summary` — exact identity, Booking revision/link, provider status, latest accepted event when present, and freshness/dependency/capture availability.
2. `Movement timeline` — one provider-normalized ordered list of planned and accepted movement evidence.
3. `Linked booking` — CMM-owned relationship summary and exact canonical Booking link, without copying the Booking detail page.

Canonical query: `tab=summary|timeline|booking`. Unsupported values normalize to `summary` by replace navigation. Tab changes do not change Journey identity or fabricate a different version.

### URL and return-context rules

- The recent list accepts only `limit` plus bounded UI return-focus context. Default is 25; allowed UI choices may be 25, 50, and 100; provider clamp remains 1-100.
- Search, filters, sort, cursor, `page`, and actor are rejected/removed. They never render a UI control.
- Browser-supplied actor/subject input is prohibited. The BFF derives the current actor from the authenticated request and overwrites or omits provider actor fields.
- A Journey link carries a validated same-shell `returnTo` containing only `/container-movement`, approved `limit`, and a bounded `focus` token.
- `returnTo` is relative, same-shell, length-bounded, and rejects schemes, hosts, protocol-relative paths, backslashes, control characters, encoded separators, and traversal.
- Back to recent Journeys restores `limit`, scroll/row focus where possible, and otherwise falls back to `/container-movement`.
- Journey-to-Booking uses `/booking/[bookingId]` from the exact provider ID and a bounded origin/return context approved by the shell route registry.
- No CMM legacy route exists; legacy-looking paths return 404. W4 creates no compatibility redirects or 410 responses for a nonexistent prior frontend.

## Refined Wireframes

Wireframes show structure and information priority only. `LINERCORE SHELL` represents the existing shared shell and its tokens.

### Desktop — recent Journey list, 1024/1440

```text
┌ LINERCORE SHELL ──────────────────────────────────────────────────────────┐
│ Breadcrumbs  Operations / Container Movement                             │
├───────────────────────────────────────────────────────────────────────────┤
│ Container journeys                                            [Refresh]   │
│ Recent provider journeys. Fixed recent order; no search or paging.        │
│ Show latest [25 ▾]                         25 journeys returned             │
│ ┌ Container     ┬ Booking       ┬ Status      ┬ Latest movement ┬ Freshness│
│ │ LCRU1000055   │ BKG-8c6b…     │ Allocated   │ No event received│ Fresh   │
│ │ [Open journey]│ [Open booking]│             │                  │ 10:42 UTC│
│ │ MSKU1234561   │ BKG-104       │ Gated out   │ GTOT · Gated out │ Last known│
│ │ [Open journey]│ [Open booking]│             │ SGSIN · 10:42 UTC│ 10:45 UTC│
│ └───────────────┴───────────────┴─────────────┴─────────────────┴──────────┘
│ Showing 25 most recent journeys · Total and additional pages unavailable  │
└───────────────────────────────────────────────────────────────────────────┘
```

The provider supplies fixed recent order. No header is sortable. “25 journeys returned” uses the response's `returned` count, not a total. Route, voyage, customer, late-event, separate exception, and next-event columns are absent until an approved projection exists. `EXCEPTION` appears as Journey status only when returned by the provider.

### Desktop — Journey Summary, 1024/1440

```text
┌ LINERCORE SHELL ──────────────────────────────────────────────────────────┐
│ Back to 25 recent journeys                                                │
│ LCRU1000055  [Allocated]                   Journey JRN-…                   │
│ Booking BKG-8c6b… · revision 1            [Open Booking]                  │
│ Summary | Movement timeline | Linked booking                [Actions ▾]   │
├───────────────────────────────────────────────┬───────────────────────────┤
│ SUMMARY                                       │ CURRENT CAPABILITY        │
│ Identity                                      │ [Record movement]         │
│ Container       LCRU1000055                   │ only when captureEnabled  │
│ Journey         JRN-…                         │                           │
│ Booking         BKG-8c6b… · revision 1        │ Freshness                 │
│ Status          Allocated                     │ Fresh · checked 10:45 UTC │
│ Latest movement No event received yet         │                           │
│ Next guidance   Unavailable from provider     │ Support details ▸         │
│ Route/voyage    Unavailable from provider     │                           │
└───────────────────────────────────────────────┴───────────────────────────┘
```

At 1024/1440, capture may use a persistent right action panel after the header. It is not a floating overlay and never obscures the timeline. At 768 it stacks in document order. A missing field is not filled from a guessed Booking search.

### Desktop — Movement timeline, 1024/1440

```text
│ MOVEMENT TIMELINE                                                        │
│ 1  [Recorded] GTOT · Gated out                                           │
│    SGSIN · occurred 21 Jul 2026 10:42 UTC                                │
│    Event EVT-101                                      [Show evidence]     │
│ │                                                                            
│ 2  [Planned]  LOAD · Loaded                                               │
│    SGSIN · provider sequence 1                                             │
│ │                                                                            
│ 3  [Planned]  DISC · Discharged                                           │
│    NLRTM · provider sequence 2                                             │
│                                                                              
│ Publication evidence: [Unavailable] No public status was returned.          │
```

The vertical line/dots are decorative. Ordered-list position, Recorded/Planned text, event code/readable label, and evidence provide meaning. Application Design must normalize the provider's expected and accepted structures into one tested sequence; the browser does not invent or reorder domain state.

### Desktop — Linked booking, 1024/1440

```text
│ LINKED BOOKING                                                            │
│ Booking ID       BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3                 │
│ Booking revision 1                                                        │
│ [Open Booking BKG-8c6b…]                                                  │
│ Additional Booking facts remain on the Booking detail page.               │
```

If the target is denied/not found, the target route owns that truthful state. If the CMM response lacks `bookingId`, this tab shows a provider-contract failure, not a search field.

### Desktop — Record Movement action, 1024/1440

```text
│ RECORD MOVEMENT                                                           │
│ Container  LCRU1000055  (read only)                                       │
│ Expected guidance  Unavailable / provider-backed value if later supplied  │
│ Event code * [GTOT · Gated out ▾]                                         │
│ Location *   [Search active location…]                                    │
│ Occurred *   [yyyy-mm-dd] [hh:mm]  UTC                                    │
│ [Cancel]                                      [Record movement]            │
│ Actor, idempotency key, and correlation are generated at the server edge. │
```

There is no correction reason, empty indicator, classifier selector, source selector, publication control, or Journey-create control because the current capture contract does not expose them as operator inputs.

### Mobile — recent Journey list, 375/390

```text
┌──────────────────────────────────┐
│ Container journeys     [Refresh] │
│ Latest [25 ▾] · 25 returned      │
│ ┌ LCRU1000055              [→] ┐ │
│ │ Booking BKG-8c6b…            │ │
│ │ Allocated · No event received│ │
│ │ Fresh · updated 10:42 UTC    │ │
│ └──────────────────────────────┘ │
│ ┌ MSKU1234561              [→] ┐ │
│ │ Booking BKG-104              │ │
│ │ GTOT · Gated out · SGSIN    │ │
│ │ Last known · 10:45 UTC      │ │
│ └──────────────────────────────┘ │
│ Total and pagination unavailable │
└──────────────────────────────────┘
```

Each semantic record has one named Journey link. Booking may be a separate link only when nested-interactive semantics remain valid; otherwise it appears as text and is available on detail. No horizontal page scroll or swipe-only behavior is required.

### Mobile — Journey detail and capture, 375/390

```text
┌──────────────────────────────────┐
│ ← Back to recent journeys        │
│ LCRU1000055                      │
│ Allocated · Journey JRN-…        │
│ Booking BKG-8c6b… · revision 1  │
│ [Summary][Timeline][Booking] →   │
│                                  │
│ Identity                         │
│ Status  Allocated                │
│ Latest  No event received yet    │
│ Freshness  Fresh · 10:45 UTC     │
│                                  │
│ [Record movement]                │
│ ┌ expanded in flow ────────────┐ │
│ │ Event code * [GTOT ▾]       │ │
│ │ Location *   [Search…]      │ │
│ │ Occurred *   [date] [time]  │ │
│ │ [Cancel] [Record movement]  │ │
│ └──────────────────────────────┘ │
│ Support details ▸                │
└──────────────────────────────────┘
```

At 375/390 and 768px the action content stacks in flow. It uses `aria-expanded`, does not trap focus, and retains entered values across validation, conflict, and retryable service failure.

## Binding Interaction Specification

### Navigation & Shell Context

The routes require a real authenticated session and fail-closed BFF authorization. Browser query/body values never grant identity or capture authority. The shared shell owns active navigation, breadcrumbs, session menu, theme, skip link, and denied composition. CMM contributes only page metadata and routed content.

### Screens & Routes

| Route | Type | Purpose |
|---|---|---|
| `/container-movement` | List | Read fixed recent provider Journeys with bounded limit and stable links. |
| `/container-movement/journeys/[journeyId]` | Detail | Inspect Summary, one Movement timeline, Linked booking, capture action, and collapsed evidence. |

No other CMM route is authorized by this design.

### Journey List

**Purpose:** Open recent operational Journeys without implying query capabilities that do not exist.

**Supported input:** `limit`, default 25 and bounded to 1-100. The UI may expose only reviewed fixed choices. Refresh repeats the authoritative request.

**Explicit absences:**

- no search by container, Booking, or journey ID;
- no status/event/location/voyage/exception/freshness filters;
- no selectable sort, saved view, cursor, page, or page-size/total model;
- no browser actor/subject field;
- no client filtering or ordering of the returned slice.

**Result behavior:**

- Preserve the provider's recent order exactly.
- Show `returned` as “N journeys returned”, never “N total”.
- Use stable `journeyId` for the named row link.
- Prefer container ID, exact Booking ID, provider status, latest accepted movement evidence when contract order is confirmed, and freshness/timestamp.
- When `history` is empty, show “No event received yet”; do not mark it late or exceptional without a provider due time/state.
- When status is `EXCEPTION`, show readable “Exception” text and semantic status. Do not infer exception from age, missing events, or provider failure.
- Customer, route, voyage, next event, lateness, and exception reason remain absent until provider projected.
- Late responses cannot overwrite a newer limit/refresh generation.

**Desktop columns:** Container, Booking, Status, Latest movement, Freshness. Event time/location sit under Latest movement. Container is the single primary Journey link.

**Mobile record:** Container, Booking, status/latest event, occurrence/location when present, freshness, and one named Journey link. Route is not displayed because no provider route projection exists.

### Journey Record Header and Tabs

Use shared `RecordHeader` and `RouteTabs`:

- H1: exact container ID; fall back to Journey ID only if the provider's container value is missing and show a contract-error notice.
- Subtitle/meta: Journey ID, exact Booking ID/revision, provider status, and freshness.
- Back: validated return context or canonical recent list.
- Actions: Record Movement only when exact server capability and `captureEnabled=true` permit it.
- Tabs: Summary, Movement timeline, Linked booking.

Approved provider statuses display code plus readable label:

| Provider value | Primary label | Notes |
|---|---|---|
| `ALLOCATED` | Allocated | If history is empty, separately say “No event received yet”. |
| `GATED_OUT` | Gated out | Provider lifecycle after accepted GTOT. |
| `IN_TRANSIT` | In transit | Provider lifecycle after accepted LOAD. |
| `DISCHARGED` | Discharged | Provider lifecycle after accepted DISC. |
| `RETURNED_EMPTY` | Returned empty | Provider lifecycle after accepted GTIN. |
| `EXCEPTION` | Exception | Do not invent a reason when none is supplied. |
| `PLANNED`, `ARRIVED`, `DELIVERED` | Legacy: Planned / Arrived / Delivered | Preserve readable legacy snapshots without treating them as canonical capture guidance. |

### Summary

Use a shared `DefinitionList`, not nested cards. Groups are Identity, Linked source, Operational status, Latest accepted movement, and Freshness.

- Identity: journey ID and container ID.
- Linked source: Booking ID and revision; exact Booking link.
- Operational status: provider `MovementStatus`; no UI-calculated lifecycle.
- Latest accepted movement: event code/readable label, occurrence time, and location only when the provider's append order is confirmed by the BFF contract.
- Freshness: `fresh`, `last-known`, or `unavailable`, with `dataUpdatedAt`, dependency, and `checkedAt` labels.
- Capture availability: provider `captureEnabled` and readable `captureDisabledReason`.
- Required next movement: show only when an approved provider/BFF field supplies it. Do not derive from status/history in the browser.
- Route, voyage, transport call, customer, expected due time, and lateness are unavailable under the current contract.

### Movement Timeline

The timeline is one semantic `<ol>` whose DOM order equals the approved provider-normalized business order. It combines planned and recorded evidence without silently deleting accepted events.

**Application Design normalization requirement:** The current API returns `expectedMovements` and `history` separately. A tested BFF view model must map provider enums to canonical display stages and join planned/recorded evidence. Until that contract exists, this composition remains `BLOCKED`; the browser may not guess ordering or mark a next stage.

Canonical display labels for current accepted event types:

| Provider event type | Display code and meaning |
|---|---|
| `GTOT` or `ACT_GTOT` | `GTOT · Gated out` |
| `ACT_LOAD` | `LOAD · Loaded` |
| `ACT_DISC` | `DISC · Discharged` |
| `ACT_GTIN` | `GTIN · Gated in empty` |

Other legacy event enums are not hidden. Show their exact safe value plus a readable “Legacy event” label until the provider supplies an approved mapping; they do not become canonical capture choices.

Each item shows, when supplied:

- Recorded or Planned text;
- provider sequence/position;
- code plus readable meaning;
- location ID plus resolved label when available;
- occurrence time for recorded movements;
- event ID for recorded movements;
- non-color lifecycle/validation meaning.

Collapsed `TechnicalDetails` may show safe event ID, correlation ID, and dedupe reference. Current responses do not supply received time, source, actor, empty indicator, validation disposition, correction relation, publication status, or raw payload. They must not appear as facts.

Timeline keyboard behavior uses normal document navigation. Only evidence disclosure controls are tabbable; decorative dots/connectors are hidden from assistive technology. No custom arrow-key roving model is required for static list items.

### Linked Booking

This view contains only relationship facts owned by CMM and a canonical link:

- exact Booking ID;
- Booking revision observed by the Journey;
- “Open Booking [ID]” link to `/booking/[bookingId]` with validated bounded origin context;
- concise text that full customer, routing, equipment, pricing, and lifecycle facts remain on Booking detail.

The view does not fetch or reproduce the complete Booking page unless Application Design approves a narrow provider composition with independent authorization and explicit fields. If `bookingId` is missing, show “Linked Booking unavailable — provider identifier missing” and a support reference; never search by container or label.

Booking-to-Journey remains Booking-owned: its server/BFF uses `GET /api/container-movement/bookings/{bookingId}/journey` and renders the Journey link only from the returned `journeyId`. Absence says “Journey not created”; dependency failure offers Retry; denial does not reveal Journey data.

### Record Movement

The action is rendered only when read authorization succeeds, action-specific capture authority is confirmed, provider `captureEnabled=true`, and the Journey is fresh enough to act. `captureDisabledReason` maps to visible text; hidden/denied policy is not replaced by stale capability cache.

**Operator fields:**

| Field | Control | Contract |
|---|---|---|
| Container | Read-only text | Exact Journey container; never re-keyed. |
| Event code | Shared Select | Display GTOT, LOAD, DISC, GTIN. BFF maps to one approved provider enum; exact mapping requires Application Design confirmation. |
| Location | Shared Combobox | Active canonical location result; stored value is provider location ID. Free text is not authoritative. |
| Occurred time | Date/time controls | Required, unambiguous UTC help, suitable mobile input modes, and no future-invalid value. |

**Not operator fields:** `actorSubjectId`, idempotency key, correlation ID, source, classifier, and transport evidence are created/overwritten at the trusted server boundary. The current request body accepts actor data, so the BFF must reject/overwrite browser values before implementation can pass security review.

**Fields/actions absent under current contract:** empty indicator, correction reason, correction-of event, publication control, create Journey, bulk capture, and replay.

**Validation and submission:**

- Validate required/format/reference constraints on blur and submit; server remains authoritative.
- Show expected-transition guidance only when provider/BFF supplies it. After typed 409, use returned `requiredNextMove` exactly.
- Prevent duplicate submission with a stable “Recording…” button and idempotency at the BFF/provider boundary.
- Preserve every operator field on validation, duplicate, out-of-sequence, conflict, authorization, or retryable failure.
- Never add a timeline item or change status before an accepted provider response and authoritative detail re-read.
- On validation failure, focus the error summary; links target fields.
- On duplicate/out-of-sequence conflict, focus the persistent conflict summary and state `currentLifecycle`, `requiredNextMove`, provider message, and correlation reference where safe.
- On accepted response, refetch detail and focus a polite success summary: “Movement accepted in Container Movement.”
- Event publication and Booking application are separate adjacent evidence regions; they remain “Status unavailable” unless their own provider contract proves pending/published/failed/applied.

### Correction and Immutable History

Accepted movement history is append-only and has no edit/delete UI. The current source exposes no correction command, correction reason, superseded event link, or corrected status. Therefore:

- no Correct Movement action is rendered;
- no existing event can be opened in edit mode;
- “Correction recorded” is not a designed runtime state for the current contract;
- a future correction workflow requires approved scope, append-only provider command, relationship/evidence fields, authorization, executable contracts, and a return to this design gate.

This preserves immutable prior movements without inventing a correction capability.

### Event Occurrence, Publication, and Booking Application

These are three distinct truths:

1. **Movement occurrence/acceptance:** proven by the accepted capture response and persisted Journey history.
2. **Event publication:** requires explicit outbox/publication status for the accepted event ID.
3. **Booking application:** requires Booking projection evidence and observed time/reference.

Only item 1 is currently exposed through the Journey API. The UI must not label publication “Pending”, “Published”, or “Failed”, and must not label Booking “Applied”, without the corresponding provider evidence. The support region may state “Publication status unavailable” and “Booking application status unavailable”. Internal outbox classes or tests are not a public UI contract.

If an approved additive provider later exposes these states, use separate labelled rows with timestamps and Retry ownership. A published event is not proof that Booking applied it; a Booking projection is not permission to rewrite Journey history.

## Permission and Action Matrix

| Context | CMM read + capture | CMM read only | Capture capability unavailable | No CMM read |
|---|---|---|---|---|
| Shell destination | Visible if module-read capability | Visible | Visible if read remains confirmed | Absent |
| Recent list/detail | Provider truth | Provider truth with Read-only label | Provider truth if read authority is current | Shared denied state; no data flash |
| Record Movement | Render only when `captureEnabled=true` | Absent | Absent or unavailable with provider reason; do not infer denial | Absent |
| Last-known Reference dependency | Capture disabled with explicit reason and Retry | Read remains | Capture disabled | Denied |
| Linked Booking | Exact link; target authorizes independently | Same | Same | No Journey data |
| Technical details | Sanitized/access-appropriate | Sanitized/access-appropriate | Same | Hidden |

Role names are explanatory only. Server capability and provider `captureEnabled` are authoritative; the browser is not the security boundary.

## Event, Freshness, Failure, and Recovery Matrix

| State | Entry evidence | Visible response | Recovery and focus |
|---|---|---|---|
| Loading | Route/provider pending | Stable header/list or record/timeline/action Skeleton; no false status | Completion announced politely; no forced focus on routine load. |
| Populated | Authorized provider result | Fixed recent list or exact detail/timeline | Normal reading order. |
| True empty recent list | Successful `items=[]` with no query controls | “No recent Journeys returned”; no create CTA | Refresh; focus remains on result heading. |
| Filtered empty | NOT APPLICABLE | Filters are unsupported and absent | No filtered-empty copy until provider filters exist. |
| No event received | Journey history empty | “No event received yet”; provider status/freshness remain visible | Refresh only; do not call it late or failed. |
| Expected event late | BLOCKED — no due time/late state | No late badge or exception | Owner: CMM provider; add due/late contract and tests. |
| Accepted capture | Provider accepts and refetch includes event | “Movement accepted in Container Movement”; updated status/timeline | Focus success summary; publication/application stay separate. |
| Submission pending | One capture in flight | Stable busy label; same action disabled; form retained | Await one response; no duplicate request. |
| Publication pending/published/failed | BLOCKED — no public status contract | “Publication status unavailable” only | Owner: CMM provider; additive status seam and tests. |
| Booking applied/pending | BLOCKED in CMM detail without projection evidence | “Booking application status unavailable”; exact Booking link remains | Open Booking; additive narrow evidence seam if approved. |
| Duplicate | Typed provider 409 | Message, unchanged lifecycle, required next movement, correlation; no new event | Focus conflict summary; retain values; review existing timeline evidence when exact ID exists. |
| Out of sequence | Typed provider 409 | Required next movement and unchanged lifecycle; no false success | Focus conflict summary; link/focus Event code. |
| Validation | 400/field/reference result | Error summary plus field messages; values retained | Focus summary; links target controls. |
| Other conflict | Provider 409/typed safe result | Exact safe message and current truth | Refetch; never auto-replay mutation. |
| Correction | BLOCKED — no command/relationship | No correction action or fabricated history label | Return to design/contract approval if capability is introduced. |
| Stale / last known | `freshness=last-known` plus timestamps | “Last known as of …”; dependency named; capture disabled | Retry exact read; authorization still evaluated live. |
| Freshness unavailable | `freshness=unavailable` | Authorized persisted Journey labelled unavailable; capture disabled | Retry dependency/read; no client-cached substitute. |
| Unknown container | NOT APPLICABLE to list search; capture validation may reject mismatch | Typed validation/conflict message; Journey identity unchanged | Retain form and correct/reload; no guessed Journey. |
| Not found | Unknown/malformed `journeyId` | Shared not-found state with safe list link | Focus error heading. |
| Denied | Read authorization denies | Shared denied state; no provider data or technical payload flash | Safe shell destination/request access. |
| Read-only | Read allowed, capture not allowed | Explicit Read-only/capture-unavailable text; command absent | Continue inspecting. |
| Partial outage | Provider returns authorized persisted Journey plus dependency metadata | Retain verified fields; `PartialDataNotice` names unavailable region/source/time | Region-specific Retry; unsafe capture disabled. |
| Booking link unavailable | Missing provider `bookingId` or approved relationship failure | ID-missing contract failure or target-specific unavailable state | Retry provider/target; never search by label. |
| Service unavailable | No trustworthy read response | `FailureState` with safe reference and Retry | Retry exact route, retaining safe context. |
| Network outcome unknown | Capture response lost/timeout | Do not claim accepted and do not automatically replay | Refetch Journey by ID/idempotency evidence; announce only confirmed state. |
| Success after recovery | Authoritative refetch proves state | Updated record/timeline plus concise success | Focus summary/H1; preserve tab/context. |

Event/status/freshness meaning always uses text; semantic color and Lucide icons are supplementary.

## Responsive Contract

| Width | Recent list | Detail/timeline | Record Movement |
|---|---|---|---|
| 375/390px | Semantic stacked records; limit and Refresh; no page overflow | Compact record header, labelled scrollable tabs, one-column facts, vertical ordered timeline | In-flow `aria-expanded` section; full-width controls; no focus trap |
| 768px | Dense table in labelled inner overflow only; no fake hidden columns or page overflow | One-column detail; timeline retains full evidence order | Stacked in-flow action region after primary content; no unavailable Drawer fork |
| 1024px | Five-column dense table with stable dimensions | Main detail/timeline plus optional narrow evidence/action column | Persistent right panel in logical DOM order |
| 1440px | Same information density within bounded content width | Stable reading measure and evidence rail; no stretched decorative space | Persistent right panel |

Test 375, 390, 768, 1024, and 1440px in both supported LinerCore themes. At 200% zoom and text-spacing overrides, no content/action overlaps or disappears. Long UUIDs, container IDs, location IDs, event types, and timestamps wrap without truncating meaning.

The W2-04 design referenced a shared Drawer at 768px, but no executable shared Drawer export was observed. This W4 design uses the prompt's stacked action rail at 768px. If a Drawer is later required, it remains a platform dependency with focus-trap/restore evidence; CMM must not create a general-purpose local fork.

## Keyboard, Focus, and Screen-Reader Contract

### Page order

List order: shared skip link/navigation, breadcrumbs, H1, Refresh/limit, result summary, named Journey links, then support/recovery. Detail order: Back, record header, tabs, active panel, Record Movement action region, Linked Booking/support evidence. CSS placement never changes logical DOM order.

### Interaction rules

- Use native links for Journey and Booking navigation; no click-only row or nested interactive card.
- Each result has one predictable Journey link with an accessible name such as “Open Journey for container LCRU1000055, Allocated”.
- `RouteTabs` use established link semantics and expose current state; arrow keys are not invented unless the shared component implements a verified tab pattern.
- Timeline uses `<ol>`/`<li>`. Static events are not tab stops; only evidence disclosure buttons enter the tab order.
- Code and readable meaning are announced together. Recorded/Planned, status, freshness, and publication availability are never color-only.
- Dates have unambiguous year/timezone accessible text; visual identifiers use tabular/mono tokens without letter-by-letter announcement hacks.
- Capture fields have persistent labels, required text, descriptions, field errors, and a focused error summary.
- Result updates, capture pending/accepted/rejected, freshness changes, and Retry outcomes use shared polite live regions; critical submit errors use one alert without repeated polling noise.
- Skeletons, timeline connectors, and decorative icons are hidden from assistive technology.
- Reduced-motion disables nonessential transition; no state depends on animation.

### Focus recovery

| Event | Focus destination |
|---|---|
| Limit change / Refresh | Control retains focus; updated returned count announced. |
| Return from Journey | Previously invoked row link when valid `focus` context exists; otherwise result heading. |
| Tab change | Active tab; panel heading is available next in reading order. |
| Open capture at 375/390/768 | Capture heading or first invalid/first field according to shared form behavior. |
| Cancel capture | Original Record Movement trigger. |
| Validation failure | Error summary, then linked field. |
| Duplicate/out-of-sequence | Persistent conflict summary. |
| Accepted capture | Success summary after authoritative refetch. |
| Retry read | Refreshed region heading or retained Retry button on failure. |
| Open Booking and return | Linked Booking link or invoking CMM context through validated return state. |

## Shared-versus-CMM Component Mapping

| Surface/behavior | Shared primitive/token | CMM-owned composition | State coverage | Status |
|---|---|---|---|---|
| Shell/nav/breadcrumbs/session | `PlatformShell`, shared shell registry | Route metadata and CMM label only | permitted/denied/direct route | BLOCKED — no mount/nav/runtime evidence |
| List header and commands | `PageHeader`, `Button`, `Select` | Refresh, bounded limit, returned-count copy | loading/empty/populated/error | BLOCKED — frontend absent |
| Journey results | `Table`, `TableContainer`, `StatusBadge`, `Skeleton`, `EmptyState`, `FailureState` | Five provider-backed columns and mobile record ordering | full recent-list matrix | BLOCKED — frontend/runtime absent |
| Record header/tabs | `RecordHeader`, `RouteTabs` | CMM identity, status, freshness, three route views | loading/populated/not-found/denied | BLOCKED — frontend/runtime absent |
| Summary facts | `DefinitionList`, `PartialDataNotice` | Exact Journey/Booking/freshness fields | fresh/last-known/unavailable | BLOCKED — view model/runtime absent |
| Timeline | Native ordered list plus shared Button/disclosure | Provider-normalized movement item anatomy | empty/no-event/planned/recorded/partial | BLOCKED — normalized BFF timeline contract absent |
| Capture fields | `Field`, `Select`, `Combobox`, `Input`, `Button` | CMM event/location/time rules | default/validation/pending/accepted/conflict/error | BLOCKED — CMM BFF and reference lookup absent |
| Capture outcome | `StatusStrip`, `ConflictStrip`, optional `Toasts` | Typed CMM copy/currentLifecycle/requiredNextMove | accepted/duplicate/out-of-sequence/unknown | BLOCKED — frontend/runtime absent |
| Support evidence | `TechnicalDetails` | Sanitized event/correlation/dedupe/dependency data | collapsed/partial/error/denied | BLOCKED — permission/runtime review required |
| Publication/application evidence | `StatusStrip`/`FailureState` when contracted | Separate CMM/Booking evidence labels | unavailable/pending/published/failed/applied | BLOCKED — provider seams absent |
| Responsive capture | Shared layout primitives | CMM action panel/in-flow composition | all widths | BLOCKED — runtime evidence absent |
| Theme/focus/motion | `--erp-*`, `--erp-focus-ring`, shared motion tokens | No local override | both themes/reduced motion | BLOCKED — visual/a11y evidence absent |

No mapping row authorizes a CMM-local general-purpose primitive. Missing shared behavior is recorded for the UI platform owner and remains blocked until released and consumed.

## Requirements and Story Traceability

| Requirement / story | Design location |
|---|---|
| FR-001/002/018, US-001/002 — first canonical CMM shell routes, no fake legacy redirect | Verified inventory; Information Architecture; shell/route proposal |
| FR-007, US-011/012 — recent list, stable detail, Summary/Timeline/Booking | Journey List; header/tabs; Summary; Timeline; Linked Booking |
| FR-008, US-013 — supported capture and typed non-optimistic outcomes | Record Movement; event/failure matrix; focus recovery |
| FR-009/010 — provider-authoritative list controls and complete list states | Journey List; explicit absences; state matrix |
| FR-011/013 — detail/mutation states, duplicate prevention, recovery | Record Movement; state matrix; accessibility contract |
| FR-012/019/020 — denied/read-only/freshness/authorization truth | Permission matrix; Summary; stale/degraded states |
| FR-014/015/016, US-014 — exact Booking links and safe return context | Linked Booking; URL/return-context rules |
| FR-021 — safe error plus collapsed technical evidence | Timeline/support mapping; failure matrix |
| FR-022 — one shell and shared grammar with domain vocabulary | Ownership; repeated pattern; shared component mapping |
| NFR accessibility/responsive contract | Responsive; keyboard/focus; Playwright checklist |

## Application Design Confirmations

These decisions are mandatory before the candidate becomes implementation-binding:

1. Choose the CMM-owned frontend/BFF source boundary and edge mount without introducing a standalone canonical UI or app-to-app import.
2. Add `/container-movement` and `/container-movement/journeys/[journeyId]` to the existing shell route registry and platform-owned permission-aware navigation; confirm exact permission strings.
3. Design a fail-closed CMM BFF that derives actor/capabilities from the authenticated request and strips/overwrites service `actor` query and `actorSubjectId` body input.
4. Preserve list `limit` only, fixed recent order, and `returned` count. Reject unsupported search/filter/sort/page keys rather than ignoring them silently.
5. Define a tested BFF list/detail view model using only current Journey response fields. Do not add customer, route, voyage, lateness, or exception reason without provider contracts.
6. Define provider-owned normalized timeline ordering and canonical event labels. The browser must not calculate lifecycle/next movement or silently merge/deduplicate expected and actual events.
7. Confirm whether latest accepted event is guaranteed by append order in the public contract; otherwise omit it from list/Summary.
8. Confirm the exact GTOT/LOAD/DISC/GTIN-to-provider-event mapping for capture and one canonical actual gate-out enum.
9. Provide a canonical active-location lookup usable by CMM without app-to-app imports; preserve Reference authorization/degraded behavior.
10. Keep required-next guidance absent until provider/BFF supplies it; continue using typed 409 `requiredNextMove` after rejection.
11. Do not implement correction until an approved append-only command, reason, relationship, authorization, and evidence contract returns to the design gate.
12. Do not implement publication pending/published/failed or Booking applied status until explicit public evidence contracts exist. Internal outbox types are insufficient.
13. Confirm `/booking/[bookingId]` route-registry behavior, target authorization, present/absent/not-found/denied/degraded cases, and validated origin/return context.
14. Confirm shared `@erp/ui` exports and responsive behavior for headers, tabs, tables, semantic mobile records, forms, conflicts, partial data, and technical details; map gaps to platform ownership.
15. Treat the absent reviewed 90/91 output documents as a formal blocker unless the product owner confirms that approved W2-04 refined artifacts plus this candidate are the accepted replacement foundation.

## Playwright and Visual-Regression Acceptance Checklist

### Source, mount, and routing

- [ ] Prove the selected CMM source boundary is CMM-owned routed composition inside the existing shell, not a second shell or standalone canonical port.
- [ ] Direct-load and refresh `/container-movement` and `/container-movement/journeys/[journeyId]` through the authenticated edge.
- [ ] Verify permission-aware shell destination order: Charge Agreements, Container Movement, Reference Data.
- [ ] Verify list has no workflow ribbon and detail uses only approved contextual shell metadata.
- [ ] Verify malformed/encoded Journey IDs and unknown CMM paths return 404; no invented legacy redirect or 410 exists.
- [ ] Verify unsafe, external, encoded, overlength, and traversal return targets are rejected.
- [ ] Verify Back restores bounded list limit and invoking-row focus when valid.

### Provider truth and list states

- [ ] Assert browser requests contain only approved `limit`; actor is server-derived.
- [ ] Assert default 25 and clamp/allowed limit values; fixed provider order is unchanged.
- [ ] Assert UI renders no search, filter, selectable sort, cursor, total, or pagination controls.
- [ ] Assert `returned` is never labelled total and no client filtering/order occurs.
- [ ] Capture loading, true empty, populated, denied, service unavailable, last-known/degraded, and freshness-unavailable list states.
- [ ] Capture history-empty “No event received yet” without a late/exception badge.
- [ ] Verify route/voyage/customer/late/next/exception-reason fields remain absent without a provider contract.

### Detail, timeline, and Booking link

- [ ] Capture Summary, Movement timeline, and Linked booking at direct load and browser refresh.
- [ ] Prove Journey status is provider-owned and legacy values remain readable without canonical remapping.
- [ ] Prove one normalized timeline retains all accepted events, planned evidence, codes/readable labels, occurrence/location, and exact order.
- [ ] Verify empty history, planned-only, recorded, partial, last-known, and unavailable timeline states.
- [ ] Verify technical evidence is collapsed, sanitized, access-appropriate, and never exposes raw payload/token/secret.
- [ ] Verify Journey-to-Booking uses exact `bookingId` and target denial/not-found remains target-owned.
- [ ] Verify Booking-to-Journey uses authorized provider lookup and distinguishes present, not-created, denied, and dependency failure.

### Capture, conflicts, and downstream evidence

- [ ] Verify Record Movement is absent/disabled exactly per capability, `captureEnabled`, freshness, and `captureDisabledReason`.
- [ ] Verify BFF rejects/overwrites browser actor, idempotency, and correlation manipulation.
- [ ] Verify only GTOT/LOAD/DISC/GTIN, canonical location, and occurrence time are operator inputs.
- [ ] Verify validation retains values, focuses summary, and links to fields.
- [ ] Verify one pending request disables duplicate submission without layout shift.
- [ ] Verify accepted response is followed by authoritative refetch before timeline/status success.
- [ ] Verify duplicate and out-of-sequence 409 responses show message/current lifecycle/required next/reference and do not advance Journey or Booking.
- [ ] Verify timeout/unknown outcome refetches by Journey/idempotency evidence and never automatically replays capture.
- [ ] Assert no correction action/reason/edit route exists.
- [ ] Assert publication and Booking-application states remain unavailable unless explicit provider evidence is supplied; occurrence, publication, and application are never conflated.

### Accessibility and responsive evidence

- [ ] Run automated accessibility checks on both routes and every major state.
- [ ] Complete keyboard-only flows for skip link, limit/Refresh, Journey links, tabs, timeline disclosures, capture, errors, Retry, and Booking link.
- [ ] Confirm one H1, ordered headings/landmarks, visible focus, persistent labels, linked errors, and concise live announcements.
- [ ] Confirm Journey status, Recorded/Planned, no event, freshness, exception, conflict, and publication availability have non-color text meaning.
- [ ] Confirm timeline is an ordered list and static items do not create excessive tab stops.
- [ ] Capture 375, 390, 768, 1024, and 1440px in both supported themes for list/detail/capture states.
- [ ] Verify no page-level horizontal overflow at 200% zoom or with text-spacing overrides; labelled table/tab overflow remains keyboard reachable.
- [ ] Verify long container/Booking/Journey/location/event IDs and timestamps wrap without loss.
- [ ] Verify 44px mobile targets, reduced motion, focus contrast, text/UI contrast, and no layout-shifting hover.

### Shared ownership and release evidence

- [ ] Assert no duplicate shell, auth layout, global navigation, theme root, hardcoded local palette, or copied `@erp/ui` primitive appears.
- [ ] Assert source imports shared tokens/primitives and CMM owns only domain composition/adapters.
- [ ] Compare list/detail/state grammar with approved Reference Data and Charge designs while retaining CMM event/freshness semantics.
- [ ] Run live Compose present/absent/denied/degraded cross-link and accepted/rejected capture journeys.
- [ ] Run required type/lint/build/test/coverage/security/route/shell/Playwright/accessibility gates.
- [ ] Run `aidlc-audit` and `erp-fidelity-audit`; source review, mockups, or screenshots alone do not satisfy the live gate.

## Same-Session Design Review — 2026-08-09

**Verdict:** APPROVED BY USER on 2026-08-09, WITH BLOCKERS DISCLOSED.

The candidate verifies that the CMM frontend and mount are absent, proposes only the two approved canonical routes, and applies the reviewed Reference Data grammar without pretending the backend's bounded recent feed is a searchable/paginated queue. It preserves one timeline, exact Booking identity, append-only accepted history, provider freshness/capture policy, non-optimistic outcomes, the LinerCore shell, and `@erp/ui` ownership.

It intentionally narrows older CMM designs and prompts where current evidence is weaker: route/voyage/customer/late-event/next-event projections, correction, publication status, Booking application status, and received/source/actor evidence are not shown as facts. No new shell, theme, palette, font, decorative map/timeline, bulk action, fake filter, local Drawer, or frontend business authority is introduced.

This is not implementation approval. The product owner's approval accepts the approved W2-04 refined artifacts plus this candidate as the W4-01 reviewed CMM foundation despite the missing standalone outputs for prompts 90/91. Frontend/mount/BFF, shell nav permission, query hardening, normalized timeline, location lookup, capture enum mapping, correction/publication contracts, Booking link integration, and all runtime/visual evidence remain blocked or require Application Design confirmation.

## Unresolved Questions and Blockers

1. **Reviewed 90/91 foundation — RESOLVED 2026-08-09:** The repository contains only prompts 90/91, not standalone reviewed outputs. Product-owner approval accepts the approved W2-04 refined artifacts plus this candidate as the W4-01 reviewed foundation; the missing files remain an evidence note, not a requirement to generate duplicate designs.
2. **Frontend source boundary:** Where should CMM-owned routes and BFF live within the existing shell/mount architecture? No `apps/container-movement` or shell page mount currently exists, and this design does not choose one speculatively.
3. **Identity hardening:** Which exact BFF/policy contract will derive the actor and reject/overwrite the service's current `actor` query and `actorSubjectId` body input?
4. **List capability:** When, if ever, will the provider add search/filter/sort/total/cursor contracts? Until approved and tested, the queue remains fixed recent order plus bounded limit only.
5. **Operational projections:** Are additive provider fields planned for route, voyage/transport call, customer, explicit latest/next movement, expected due/late state, and exception reason? These remain absent.
6. **Timeline normalization:** Which provider/BFF contract owns the one ordered expected/actual display sequence and current canonical event mapping, including legacy event enums?
7. **Capture mapping and lookup:** Which provider event enum is canonical for actual GTOT, and which authorized Reference lookup supplies active locations without app-to-app imports?
8. **Correction:** There is no correction command, reason, or relationship. Is correction explicitly deferred from W4-01, as required by current scope, or will an approved scope/contract change return to this design gate?
9. **Publication and Booking application:** Which public provider surfaces, if any, will expose per-event publication and Booking application evidence? Internal outbox state cannot be treated as UI contract.
10. **Shared shell/navigation:** Which platform change adds the permission-aware Container Movement destination in master order without a CMM-local navigation patch?
11. **Runtime evidence:** No browser surface or CMM page exists. Responsive, theme, keyboard, assistive-technology, permission, provider, and live Compose evidence remain blocked.

## Review Checklist

- [ ] Confirm the source inventory correctly states that CMM backend/Booking projection exist but CMM frontend, route mount, and shell nav entry do not.
- [x] Product owner accepted approved W2-04 artifacts plus this candidate as the reviewed W4-01 foundation despite the missing standalone 90/91 outputs.
- [ ] Confirm only `/container-movement` and `/container-movement/journeys/[journeyId]` are proposed, with no legacy redirect or standalone app claim.
- [ ] Confirm the recent list exposes bounded limit/Refresh only and omits unsupported search, filters, sort, total, cursor, and pagination.
- [ ] Confirm list/detail fields use only the current Journey response and do not invent route, voyage, customer, lateness, next-event, or exception-reason projections.
- [ ] Confirm Summary, Movement timeline, and Linked booking are the only stable detail views.
- [ ] Confirm one provider-normalized timeline, canonical code/readable labels, append-only accepted history, and collapsed safe evidence.
- [ ] Confirm Record Movement uses only current capture inputs, trusted server identity/idempotency/correlation, and authoritative refetch.
- [ ] Confirm duplicate/out-of-sequence/current-lifecycle/required-next evidence and unknown-outcome recovery.
- [ ] Confirm correction remains absent and publication/Booking application remain separate and unavailable without contracts.
- [ ] Confirm exact Booking cross-links, safe return context, and independent target authorization.
- [ ] Confirm 375/390/768/1024/1440 responsive behavior, WCAG 2.2 AA design target, and WCAG 2.1 acceptance evidence.
- [ ] Confirm the one LinerCore shell, shared tokens, and `@erp/ui` ownership; no local theme, navigation, Drawer, or shared-component fork.
- [ ] Resolve or explicitly accept every blocker above before marking this document approved page-level design input.
