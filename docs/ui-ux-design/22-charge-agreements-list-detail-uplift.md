# W4-01B Charge Agreements List-Detail Uplift

**Status:** Approved page-level design input  
**Prepared:** 2026-08-09  
**Scope:** Charge Agreements page-level design only; no production implementation or AI-DLC state change  
**Lifecycle position:** W4-01 Refined Mockups design input, after approved Requirements Analysis and User Stories  
**Repeated pattern:** Reviewed Reference Data uplift, specialized for agreement versioning, rate authority, approvals, and pricing evidence

This candidate replaces obsolete workbench composition with canonical, full-page Agreement list, detail, and focused task routes. It preserves the single LinerCore shell, shared tokens, and `@erp/ui` ownership. Charge owns commercial terminology, agreement/rate workflows, provider adapters, and page composition; it does not own a shell, theme, general-purpose table, tabs, dialog, status system, or shared responsive primitive.

## Authority, Ownership, and Evidence

### Authority order

When sources disagree, this design uses the following order:

1. Approved W4-01 Requirements Analysis and User Stories.
2. Enterprise frontend, security, accessibility, and safe-return requirements.
3. `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, and shared `@erp/ui` ownership.
4. Charge page contract and approved W2-03 Charge refined artifacts.
5. Reviewed W4-01A Reference Data list-detail pattern.
6. UI/UX Pro Max recommendations, only where compatible with items 1-5.

The prompt requests search, selectable sorting, agreement name, equipment scope, pricing readiness, and last-change data. The approved W4-01 provider inventory does not expose those fields or controls for the Agreement list. They are therefore absent from this candidate rather than simulated client-side. The provider's fixed order—agreement number, then ID, ascending—is disclosed but is not presented as an interactive sort.

### Ownership boundary

| Concern | Owner | Design consequence |
|---|---|---|
| Shell, global module navigation, top bar, breadcrumbs, page frame | LinerCore platform | Charge renders inside the existing shell and never creates a parallel shell. |
| Tokens, typography, spacing, colors, focus, elevation, motion | LinerCore platform | No Charge theme, token override, font import, or dark-default surface. |
| Shared page/table/tabs/status/pagination/feedback primitives | `@erp/ui` | Charge composes exported primitives and raises shared gaps; it does not fork them. |
| Agreement terminology, view models, actions, validation, and provider mapping | Charge | Domain-specific fields and workflows remain local to Charge. |
| Customer, lane, commodity, charge-code, and currency labels | Reference Data provider | Charge resolves canonical labels and retains raw IDs as fallback/support evidence. |
| Rate versions, agreement bindings, approvals, and lifecycle history | Charge | Only provider-backed versions and capabilities are shown as facts or actions. |
| Booking pricing consumption | Booking | Charge may link only when an exact Booking identifier is supplied by contract. |
| D&D rules/rates and evidence | Charge W3-01 provider seam | The tab remains unavailable until an approved, merged provider contract is present. |

### Source and runtime inventory

Statuses in this table describe the named evidence only. A source-observed pass is not a live-runtime pass.

| Item | Status | Evidence and design treatment |
|---|---|---|
| Active W4-01 scope, requirements, and stories | PASS — approved artifacts present | Binding scope includes canonical list/detail/task routes, provider-truth states, safe return context, and WCAG evidence. |
| Reviewed Reference Data uplift | PASS — reviewed design present | Reuses its page hierarchy, URL state, compact header/tabs, state honesty, and evidence vocabulary. |
| Approved W2-03 Charge refined design/contracts | PASS — approved artifacts present | Preserves versioning, Rate Authority, approval impacts, manual-pricing evidence, and immutable approved versions. |
| Current root Agreement route | PASS — source observed | `/charge-agreements` already composes `AgreementList`; the obsolete `ChargeAgreementWorkbench` has no observed inbound callers. |
| Current lifecycle action routes | PASS — source observed | Create, update, approve, successor, suspend, and expire handlers/capability checks exist; runtime authorization remains unverified. |
| Agreement list provider alignment | BLOCKED | Current BFF/UI query vocabulary and provider vocabulary differ. Application Design must reconcile `status` versus `lifecycle` and remove unsupported query controls. |
| Exact Agreement-to-Booking linking | BLOCKED | Agreement responses expose no related Booking identifiers; Booking pricing evidence exposes a rate/agreement-version reference, not a guaranteed parent agreement ID. |
| Approved W3-01 D&D design and contract | BLOCKED | No approved `docs/ui-ux-design/18-dnd-rules-and-rates.md` or active W3-01 approval record was found. Bilateral fixtures remain pending/draft. |
| Shared shell/module-nav conformance | BLOCKED | Source inventory identifies module-label/order gaps that remain platform-owned. Charge must not patch the shell locally. |
| Running demo and visual evidence | BLOCKED | No browser surface was available in this session. Runtime, responsive, keyboard, theme, and visual checks remain acceptance work. |

## UI/UX Pro Max Decision Record

Adopted advisory guidance:

- dense, table-first enterprise composition;
- semantic mobile records instead of viewport-breaking tables;
- visible keyboard focus, logical tab order, skip-to-content support, and non-color state labels;
- inline field validation on blur, clear required markers, and explicit pending/success/failure feedback;
- route-level loading and error boundaries;
- restrained motion with reduced-motion support.

Rejected or superseded guidance:

- marketing gateway, hero, conversion CTA, logo-carousel, dashboard card wall, and decorative charts;
- replacement blue/amber palette, Fira font family, or any new global typography;
- invented generic search, selectable sort, equipment/origin/destination filters, or derived pricing-readiness state;
- client-side filtering or sorting presented as server truth;
- contextual drawer as the canonical record destination;
- Charge-local shell, tokens, status palette, tabs, modal framework, or shared-component forks.

## Users, Stories, and Task Outcomes

| User / approved story | Primary outcome in this design |
|---|---|
| Pricing Analyst — US-007 | Find Agreements using exact provider filters, stable URLs, honest totals, fixed ordering, and pagination. |
| Pricing Analyst — US-008 | Inspect Summary, Rates, D&D availability, and Status history without mixing edit state into read state. |
| Pricing Analyst / Approver — US-009 | Execute only capability-backed update, successor, approval, suspension, and expiry flows with current-version preconditions. |
| Charge Reader — US-010 | Inspect pricing/manual-pricing evidence in read-only mode without seeing actions they cannot perform. |
| Pricing Analyst — US-015 | Inspect exact linked Rate Authority versions and gaps without silently substituting a current rate. |
| Booking / Charge users — US-014 | Follow only exact cross-domain identifiers, preserve validated return context, and disclose blocked reverse links. |

Success means a user can answer four questions without interpreting decorative UI: which Agreement/version is this, what scope and validity does it cover, which exact rate versions are bound, and what action or provider gap prevents it from being pricing-ready.

## Information Architecture and Route Responsibilities

### Module-local navigation

The Charge module retains four stable destinations below the shared breadcrumb/page header:

1. **Agreements** — canonical customer-agreement list and detail.
2. **Rate authority** — independent Freight, Surcharge, and Local rate-version workflow.
3. **Approval queue** — independent draft-review view; it does not move full approval workflow into Agreement detail.
4. **Manual pricing** — permission-gated evidence view; it does not expose unsupported resolve/close/manual-amount actions.

These are module-local route links, not additions to the global shell navigation.

### Canonical route map

| Route | Responsibility | Query contract |
|---|---|---|
| `/charge-agreements` | Agreement list | `customerId`, `tradeLaneId`, `commodityId`, `status`, `validOn`, `includeInactive`, `page`, `size`; omit defaults where safe. |
| `/charge-agreements/new` | Create Agreement task | Validated `returnTo` only. |
| `/charge-agreements/[agreementId]` | Agreement detail | `tab=summary|rates|dnd|history`; validated `returnTo` only. |
| `/charge-agreements/[agreementId]/edit` | Edit current Draft | Current version/precondition plus validated `returnTo`. |
| `/charge-agreements/[agreementId]/successor` | Create successor version | Source Agreement/version explicit; validated `returnTo`. |
| `/charge-agreements/rates` | Rate Authority list | Existing provider-supported rate filters/pagination only. |
| `/charge-agreements/rates/new` | Create rate draft | Category/context plus validated `returnTo`. |
| `/charge-agreements/rates/[rateId]` | Rate-version detail/task | Explicit route mode only if retained by Application Design; no hidden drawer-only canonical state. |
| `/charge-agreements/approvals` | Dedicated Approval Queue candidate | `kind=agreements|rates` plus the selected provider's supported filters/pagination. Each kind is separately server-paginated; never client-merged. |
| `/charge-agreements/manual-pricing` | Manual-pricing evidence list | Existing provider-supported filters/pagination only; permission gated. |

The Approval Queue route is a page-composition proposal, not a new backend API. `kind=agreements` queries Draft Agreements; `kind=rates` queries Draft rate versions. Application Design must confirm that both exact server-side filters exist before this route becomes implementation-binding. If either does not, the corresponding queue segment shows an unavailable state; it must not download and filter all records in the browser.

### URL and return-context rules

- Filter, tab, page, and page-size state is read from the URL on initial render and restored on Back/Forward navigation.
- Changing a filter resets `page` to the first provider page; changing pages retains filters.
- `validOn` is an ISO calendar date. Invalid dates or unsupported enum values are removed with a replace navigation and a polite correction announcement.
- UI page label **Page 1** maps to provider `page=0`; the URL/provider convention remains zero-based.
- `size` defaults to 25 and is clamped to 1-100. The UI exposes only approved choices, for example 25, 50, and 100.
- Row and action links append a validated same-origin, Charge/Booking/Reference allowlisted `returnTo` containing the encoded current relative route.
- Unknown or external `returnTo` values are discarded. They are never interpolated into redirects.
- After a successful task, return to the exact safe context when present; otherwise return to the canonical Agreement detail.

### Obsolete-workbench redirect and deletion plan

| Old path / entry | Required disposition |
|---|---|
| `ChargeAgreementWorkbench` component | Delete only after source and route tests prove zero callers; do not retain as a hidden alternate shell. |
| `/charge-agreements/agreements/new` | Permanent 308 redirect to `/charge-agreements/new`, retaining only validated `returnTo`. |
| `/charge-agreements/agreements/[agreementId]` | Permanent 308 redirect to `/charge-agreements/[agreementId]`, retaining validated `tab` and `returnTo`. |
| `/charge-agreements/agreements/[agreementId]/edit` | Permanent 308 redirect to `/charge-agreements/[agreementId]/edit`. |
| `/charge-agreements/agreements/[agreementId]/successor` | Permanent 308 redirect to `/charge-agreements/[agreementId]/successor`. |
| Malformed IDs | Return 404; do not redirect to a plausible record. |
| Unknown legacy descendants | Return 404; do not catch-all into the module root. |

Redirects must be tested for method safety, query allowlisting, encoding, and open-redirect resistance. This design does not authorize implementing them in this turn.

## Refined Wireframes

Wireframes use structural labels, not replacement visual tokens. Shared shell/navigation is abbreviated as `LINERCORE SHELL`.

### Desktop — Agreement list, 1024/1440

```text
┌ LINERCORE SHELL ──────────────────────────────────────────────────────────┐
│ Breadcrumbs  Commercial / Charge agreements                              │
├───────────────────────────────────────────────────────────────────────────┤
│ Charge agreements                                      [Create agreement] │
│ Agreements | Rate authority | Approval queue | Manual pricing             │
│ Customer [All ▾] Lane [All ▾] Commodity [All ▾] Status [All ▾]            │
│ Valid on [yyyy-mm-dd]  [ ] Include inactive              [Clear filters]   │
│ 47 agreements · Fixed order: agreement number                            │
│ ┌ Agreement ↕not interactive ┬ Customer ┬ Coverage ┬ Status ┬ Ver ┬ Valid │
│ │ AG-2026-0041               │ NST-001  │ TL-17 /… │ Approved│ v3  │ dates │
│ │ AG-2026-0042               │ AUR-044  │ TL-06 /… │ Draft   │ v1  │ dates │
│ └────────────────────────────┴───────────┴──────────┴────────┴─────┴───────┘
│ Showing 26-47 of 47                      [25/page ▾] [Previous] [Next]      │
└───────────────────────────────────────────────────────────────────────────┘
```

The first cell is the single canonical row link. The header is not sortable and carries no sort chevron. `Coverage` contains exact lane and commodity labels/IDs only; origin, destination, and equipment are not inferred. Agreement name, pricing readiness, and last change are omitted until projected by the provider.

### Desktop — Agreement detail, 1024/1440

```text
┌ LINERCORE SHELL ──────────────────────────────────────────────────────────┐
│ Back to 47 agreements                                                     │
│ AG-2026-0041  Version 3  [Approved]       Customer: Northstar Retail      │
│ Valid 01 Jan-31 Dec 2026 · Lane USNYC-NLRTM · Commodity GEN              │
│ Summary | Rates | D&D | Status history                      [Actions ▾]   │
├───────────────────────────────────────────────┬───────────────────────────┤
│ SUMMARY                                       │ CURRENT CAPABILITY        │
│ Identity                                      │ Approved version is locked│
│ Agreement number  AG-2026-0041                │ [Create successor]        │
│ Version           3                           │ [Suspend] if permitted    │
│ Customer          Northstar Retail (NST-001)  │                           │
│ Coverage                                      │ Support details ▸         │
│ Lane              USNYC → NLRTM (TL-17)       │ Correlation/raw evidence  │
│ Commodity         General cargo (GEN)         │ stays collapsed           │
│ Validity          01 Jan-31 Dec 2026          │                           │
│ Pricing evidence  Unavailable / exact source  │                           │
└───────────────────────────────────────────────┴───────────────────────────┘
```

At 1440px, the action rail may remain a narrow right column. At 1024px it may sit below the record header or beside content only when every label and action remains fully visible. It is never sticky over content.

### Desktop — Rates tab, 1024/1440

```text
│ Rates                                                                      │
│ Coverage: 2 of 3 required categories bound  [Incomplete coverage]          │
│ ┌ Category  ┬ Exact version ┬ Scope              ┬ Amount       ┬ Status   │
│ │ Freight   │ OFR-381 · v4  │ TL-17 · commodity  │ USD 1,250.00 │ Approved │
│ │ Surcharge │ BAF-114 · v7  │ TL-17              │ USD   180.00 │ Approved │
│ │ Local     │ Not bound     │ —                  │ —            │ Missing  │
│ └───────────┴───────────────┴────────────────────┴──────────────┴──────────┘
│ Itemized preview unavailable until all required categories are exact.      │
│ [Bind rate authority] only when capability and policy permit               │
```

Example values illustrate layout only. Runtime content must come from exact bound rate-version identifiers; the UI never replaces a historical binding with the newest approved version.

### Desktop — D&D unavailable tab, 1024/1440

```text
│ D&D                                                                       │
│ [Unavailable] Demurrage and detention evidence is not available.          │
│ This Agreement has no approved W3-01 provider result to display.           │
│ Agreement and rate details above remain available.                         │
│ [Retry] when the provider failed transiently                               │
│ Support details ▸  provider status · correlation ID · timestamp            │
```

No rule boundary, free-day value, daily rate, event, or linkage is shown as live data until the approved W3-01 contract is merged and returns it.

### Desktop — Status history tab, 1024/1440

```text
│ Status history                                                             │
│ 08 Aug 2026 14:32  Approved       by A. Approver   Version 3               │
│ 08 Aug 2026 13:05  Rate binding   by P. Analyst    OFR v4 / BAF v7         │
│ 07 Aug 2026 09:18  Draft created  by P. Analyst    Version 3               │
│ [Load older] only when provider pagination exists                           │
```

Entries use action text, actor, absolute timestamp, and version/binding identifiers. Color or icons may supplement, never replace, the action label.

### Mobile — Agreement list, 375/390

```text
┌──────────────────────────────────┐
│ Charge agreements        [Create]│
│ Agreements · module menu [▾]     │
│ [Filters (2)]                     │
│ 47 agreements                     │
│ ┌ AG-2026-0041             [→] ┐ │
│ │ Northstar Retail · NST-001   │ │
│ │ Lane TL-17 · Commodity GEN   │ │
│ │ Approved · Version 3         │ │
│ │ Valid 01 Jan-31 Dec 2026     │ │
│ └──────────────────────────────┘ │
│ ┌ AG-2026-0042             [→] ┐ │
│ │ …                            │ │
│ └──────────────────────────────┘ │
│ [Previous]  Page 1 of 2  [Next]  │
└──────────────────────────────────┘
```

Each semantic record contains one stretched link with an accessible name such as “Open Agreement AG-2026-0041, version 3, Approved”. Secondary controls are not nested inside that link. Filters open as an in-flow disclosure or shared sheet only if the shared primitive has verified focus behavior.

### Mobile — Agreement detail, 375/390

```text
┌──────────────────────────────────┐
│ ← Back to agreements             │
│ AG-2026-0041                     │
│ Version 3 · Approved             │
│ Northstar Retail                 │
│ [Summary][Rates][D&D][History] → │
│                                  │
│ Identity                         │
│ Agreement number                 │
│ AG-2026-0041                     │
│ Version  3                       │
│ Coverage                         │
│ Lane  USNYC → NLRTM              │
│ Commodity  General cargo         │
│                                  │
│ Actions                          │
│ [Create successor]               │
│ [Suspend]                        │
│ Support details ▸                │
└──────────────────────────────────┘
```

Tabs are a labelled horizontal scroll region at 375/390px, not a clipped viewport. Selecting a tab retains focus on the active tab; content is announced by its heading. The action rail stacks after content and before support details.

## Binding Interaction Specification

### Agreement List

**Purpose:** Locate a specific commercial Agreement/version using provider-supported criteria and open its canonical detail.

**Inputs:**

- `customerId`: canonical Reference Data identifier, selected through an approved shared lookup/combobox when available.
- `tradeLaneId`: canonical lane identifier.
- `commodityId`: canonical commodity identifier.
- `status`: exact Agreement lifecycle enum.
- `validOn`: ISO date interpreted by the provider.
- `includeInactive`: explicit boolean.
- `page` and `size`: provider pagination.

**Explicit absences:** No generic text search, origin/destination filter, equipment filter, client-side sort, or selectable server sort. If future providers add these, requirements and page contract must be revised before controls appear.

**Submission and URL behavior:**

- Select/checkbox changes commit immediately only when they produce one deterministic URL update; date changes commit on blur/Enter or explicit Apply.
- A pending request marks the result region `aria-busy=true` while retaining the prior table dimmed but readable; controls remain operable except the same request cannot be submitted twice.
- Late responses cannot overwrite a newer URL/request generation.
- Result count uses provider total only. If the provider omits a total, announce “Page N loaded” and do not fabricate one.
- Fixed ordering is described in support/help text, not as a clickable table header.
- Customer/lane/commodity labels may be resolved from Reference Data; unresolved labels display the safe raw ID and “Label unavailable”.

**Columns at 1024/1440:** Agreement number, Customer, Coverage, Status, Version, Validity. A trailing visual arrow may reinforce navigation but is not a separate focus target.

### Agreement Record Header and Tabs

The `RecordHeader` contains:

- Agreement number as the H1;
- explicit “Version N” text;
- semantic status badge with visible label;
- customer label plus ID fallback;
- concise lane/commodity and validity summary;
- role-aware Actions trigger or direct primary action;
- Back link derived from validated `returnTo` or the canonical list.

Stable `RouteTabs` use URL state:

| Tab | Content contract |
|---|---|
| Summary | Identity, customer, exact lane/commodity coverage, validity, lifecycle, version, and provider-backed pricing evidence only. |
| Rates | Exact bound Freight, Surcharge, and Local versions; amount/currency/basis/scope; gaps; itemized preview only when provider supplies it. |
| D&D | Approved provider linkage/evidence, or the honest unavailable/degraded state defined here. |
| Status history | Lifecycle, approval, version, and binding events with actor/time/reason when supplied. |

Unsupported `tab` values normalize to `summary` with replace navigation. Tab state does not change record identity or fetch a different version implicitly.

### Summary

Use a `DefinitionList` rather than nested cards. Group headings are Identity, Commercial party, Coverage, Validity, and Pricing evidence.

- Agreement number, ID, and version are distinct fields.
- Customer, lane, and commodity are canonical linked references when exact IDs exist.
- Equipment does not appear unless the Agreement provider adds exact equipment scope.
- Pricing readiness appears only if a provider returns a defined readiness value and evidence. Otherwise show “Pricing readiness unavailable”; do not derive a green status from the mere presence of rate rows.
- Approved versions are visually and behaviorally immutable.
- “Read-only” is stated near the header when capabilities return no mutation actions; disabled edit controls are not rendered as a substitute.

### Rates

The Rates tab is a read view over exact Agreement bindings, not a second Rate Authority workbench.

- Preserve category labels Freight, Surcharge, and Local.
- Show rate identifier and bound version together; both are part of the accessible link name.
- Show charge code, basis, canonical scope, validity, amount, and currency only when supplied by the binding/provider.
- Use tabular numerals and locale-aware formatting while retaining currency code.
- Missing required category rows say “Not bound” and “Missing”; they are not zero-value lines.
- Incomplete coverage is an amber semantic notice with text and affected categories.
- An itemized total is displayed only from an explicit provider preview. Never sum mixed currencies or substitute missing categories client-side.
- “Bind rate authority” appears only for the exact Agreement version and capability. It opens a focused task using the dedicated Rate Authority selection grammar; it does not turn the tab into an editable grid.
- Exact rate-version links carry validated return context back to the Agreement and active tab.

### D&D

Current binding state for this candidate is **unavailable** because approved W3-01 design/provider evidence is absent.

When the provider seam is later approved and merged, this tab may show only contract-defined fields: linked rule/rate IDs and versions, readable applicability/boundary labels, free-day/rate evidence, currency, validity, and source timestamp. That future state requires a contract and design recheck; this document does not authorize guessing its payload.

Unavailable variants:

- **Not integrated:** “D&D evidence is not available because the approved provider is not integrated.” No Retry.
- **No linkage for this Agreement:** only after the provider successfully returns an explicit no-link result.
- **Temporary failure:** “D&D evidence could not be loaded.” Retry is available and scoped to this tab.
- **Partial result:** retain verified fields, label the region “Partial D&D evidence”, enumerate missing groups, and provide Retry.

Raw payload, correlation ID, provider timestamp, and technical status live in collapsed `TechnicalDetails`; no raw evidence is exposed by default.

### Status History

- Chronological order is newest first unless the provider contract states otherwise; order is disclosed.
- Each row includes action label, actor, absolute date/time with timezone, affected Agreement/rate version, and reason when supplied.
- Relative time may supplement but never replace the absolute timestamp.
- Approval pending is current lifecycle/state, not a fabricated history event.
- Missing history is “No history returned” only after a successful empty response.
- Technical event payloads stay collapsed and permission-safe.

### Role-Aware Action Rail

The rail renders only actions in the current capability response and valid lifecycle:

| Action | Required state/evidence | Interaction |
|---|---|---|
| Edit | Draft plus update capability | Navigates to focused edit route with current version/precondition. |
| Create successor | Approved/suspended/expired source plus successor capability | Creates a new Draft version; never edits the historical version. |
| Bind rate authority | Bind capability and eligible Draft/version | Opens focused binding task with exact selected versions and gap preview. |
| Approve | Draft, complete policy prerequisites, approve capability | Consequential confirmation with version, scope, bindings, future-pricing impact, and idempotent submission. |
| Suspend | Eligible current version plus suspend capability | Requires reason and impact summary; never shown to read-only users. |
| Expire | Eligible current version plus expire capability | Requires reason/effective consequence when provider supports it. |

Hidden-by-policy actions are absent, not disabled. An action disabled by an unmet business prerequisite may remain visible only when the user has the capability and the exact unmet prerequisite is adjacent, for example “Approval unavailable — Local rate missing”.

Consequential dialogs:

- move focus to the dialog heading on open;
- describe Agreement number/version, action, impacted rate bindings, effective dates, and future Booking consequence;
- require an explicit confirm button whose label names the action;
- disable duplicate submission and announce pending state;
- on validation/policy failure, keep the dialog open and focus the error summary;
- on conflict/stale version, close only when context cannot be safely retained, refetch, and focus the conflict notice;
- on success, navigate/refetch authoritative state and focus the success notice or updated H1;
- on cancel, restore focus to the invoking control.

If shared `Dialog` cannot provide focus trap, inert background, Escape handling, and focus restoration, the action remains BLOCKED on a platform dependency. Charge must not publish a competing general dialog primitive.

### Rate Authority

Rate Authority remains a full-page workflow with category/status/effective context, exact rate-version detail, draft creation, approval, and one selected approved version for each required category. Agreement detail consumes its exact binding result; it does not duplicate rate creation/comparison tables.

- Category labels remain Freight, Surcharge, and Local.
- Selectable sort/search appears only if the rate provider supports it.
- Overlap/conflict messaging identifies the exact scope, validity interval, competing version, and recovery route.
- Binding preview names the Agreement/version, three selected rate versions, missing categories, itemized provider preview, and future Booking consequence.
- A successful bind refetches Agreement detail; no optimistic green readiness state is applied.

### Approval Queue

The queue is a stable, dedicated page with two explicit kinds, Agreements and Rates. It is not a client-merged universal inbox.

- Each kind uses its provider's exact Draft/pending filter and independent pagination.
- Row identity includes item number/ID, version, scope, submitted/changed time only when supplied, and current approval prerequisite state.
- Opening a row navigates to the canonical Agreement or rate detail with safe return context.
- Approval remains a capability-backed consequential action on the canonical record or focused task; the queue does not add bulk approval.
- Empty text is specific: “No Draft Agreements awaiting review” or “No Draft rates awaiting review”.
- If provider filtering is unavailable, that kind is explicitly unavailable rather than populated through an unbounded client fetch.

### Manual Pricing

Manual pricing is an evidence-only, permission-gated destination. It can show provider-supplied Booking/pricing identifiers, reason/evidence, status, and timestamps. It must not invent a manual amount, resolve, close, assign, retry-quote, or approval action. On Agreement detail, “Manual pricing” is never used as a derived Agreement lifecycle or pricing-readiness badge.

### Cross-Links and Return Context

| Source | Destination | Rule |
|---|---|---|
| Agreement customer/lane/commodity | Canonical Reference Data record | Link only with exact set/record identity; retain Agreement return context. |
| Agreement bound rate | Exact Rate Authority version | Link exact rate ID/version; never link to “current” as a substitute. |
| Rate/Approval Queue | Agreement detail | Link exact Agreement ID and retain queue URL. |
| Booking pricing evidence | Agreement detail | BLOCKED until Booking supplies an exact canonical Agreement ID or an approved resolver contract. |
| Agreement detail | Related Booking | Show “Related bookings unavailable” until a provider projects exact Booking IDs; no reverse scan/search. |
| D&D evidence | Approved D&D record | BLOCKED until W3-01 provider/design is approved and merged. |

Cross-domain destinations may reject unknown IDs with 404/denied states. They must not silently fall back to a list or first match.

## Permission and Action Matrix

| Context | Pricing Analyst | Approver | Charge Reader | No read capability |
|---|---|---|---|---|
| Agreement list/detail | Read; mutations only per capability | Read; approve/suspend only per capability | Read-only label; no mutation actions | Denied state, no data flash |
| Draft edit/successor | Per exact capability and lifecycle | Only if separately granted | Not rendered | Denied |
| Bind rate authority | Per bind capability | Only if separately granted | Not rendered | Denied |
| Approve | Not inferred from analyst role | Per approve capability and prerequisites | Not rendered | Denied |
| Rate Authority | Read/create/edit per capability | Read/approve per capability | Read only if granted | Denied |
| Approval Queue | Only if queue read is granted | Read/review; actions per capability | Hidden unless granted | Denied |
| Manual pricing | Only explicit manual-pricing evidence capability | Only if explicitly granted | Hidden unless granted | Denied |
| Technical details | Sanitized support evidence per permission | Same | Same or hidden | Hidden |

Client role labels never grant authority. Provider/BFF capabilities and server enforcement remain authoritative. The UI prevents accidental invocation but is not the security boundary.

## State, Conflict, and Recovery Matrix

| State | List behavior | Detail/task behavior | Recovery and focus |
|---|---|---|---|
| Loading | Stable skeleton with table/record dimensions; result region busy | Header/tab skeleton; no false status or action | First real heading receives no forced focus; completion announced politely. |
| Populated/success | Provider rows, total when supplied, pagination | Authoritative record and capabilities | Success notice names completed action; focus updated notice/H1. |
| Empty, unfiltered | “No Agreements yet” plus Create only if capable | N/A | Focus remains on heading/filter region. |
| Filtered empty | “No Agreements match these filters” and Clear filters | N/A | Clear filters updates URL and focuses result summary. |
| Not found | N/A | “Agreement not found” with safe Back/list link | Focus error heading. Do not expose existence-sensitive details. |
| Denied | No row/data flash; permission-safe message | No record fields or technical payload | Focus denied heading; safe module destination only. |
| Read-only | Normal data | Explicit Read-only label; mutations absent | No disabled-action maze. |
| Incomplete coverage | Text label on row only if provider supplies evidence | Rates notice names missing categories; approve may be unavailable with reason | Link to Rate Authority/binding only if capable. |
| Manual pricing | Not inferred on Agreement list | Evidence shown only where provider returns it; no invented resolution | Link to authorized evidence route when exact ID exists. |
| Overlapping validity | Visible text conflict if provider reports it | Conflict strip names competing IDs/interval | Open exact conflicting version; refetch after correction. |
| Stale version / 409 | Keep prior row data and label stale after refetch | Stop action, show expected/current version | Focus conflict strip; Reload authoritative version; never auto-retry mutation. |
| Approval pending | Provider status text, not spinner-only | Actions reflect policy; history remains factual | Refetch/poll only per approved contract; announce status change. |
| Validation failure | Filters retain valid values | Error summary plus field errors; user input retained | Focus summary; links target invalid fields. |
| Policy conflict | N/A | Consequence-specific message; no success state | Focus conflict strip; provide exact prerequisite route if known. |
| Service unavailable | Keep stale results only when labelled | Failure state identifies unavailable region | Retry exact read; do not duplicate mutation. |
| D&D unavailable | Optional non-color tab indicator only | Honest unavailable state; Agreement data remains | Retry only for transient failure; no fabricated data. |
| Partial/degraded | Retain verified rows and name missing label sources | `PartialDataNotice` enumerates missing Rates/D&D/history groups | Region-scoped Retry; support details collapsed. |
| Rate-binding gap | Not derived unless projected | “Not bound” rows and no client total | Bind route only if capability; exact category named. |
| Duplicate submission | N/A | Confirm disabled and labelled “Approving…”/equivalent | Await authoritative response; no second request. |
| Network outcome unknown | Preserve task context | Do not claim success or automatically replay | Refetch by ID/version/idempotency evidence, then announce confirmed state. |

All notices use text plus semantic icon where appropriate. Green, amber, red, or blue alone never communicates lifecycle, coverage, conflict, or D&D availability.

## Responsive Contract

| Width | Agreement list | Detail and tasks | Module views |
|---|---|---|---|
| 375/390px | Semantic stacked records; filter disclosure; no page-level horizontal overflow | Stacked header, labelled scrollable tabs, content then actions; dialogs become verified shared full-height sheets only if focus behavior passes | Rate/Approval tables become semantic records; no swipe-only interactions. |
| 768px | Labelled `TableContainer` horizontal overflow only when semantic record mode would hide comparison value; first column remains understandable | Single-column content and stacked action rail; forms use one/two columns only where labels remain clear | Approval kind selector remains visible; each queue independently paginated. |
| 1024px | Dense six-column table, compact filter toolbar, full pagination | Content plus optional narrow action rail; tabs remain one row | Full Rate Authority/Approval table with no page overflow. |
| 1440px | Same information density with controlled max content width; no stretched whitespace/card wall | Stable content measure and right action rail | Comparison may expose additional provider-backed columns, never invented fields. |

Additional requirements:

- Test 375, 390, 768, 1024, and 1440px in both supported LinerCore themes.
- Minimum touch target follows the LinerCore token; no icon-only unlabeled domain action.
- Table overflow region has a visible/focusable label such as “Agreement results, scroll horizontally for more columns”. The page itself never scrolls horizontally.
- No gesture is required; horizontal tab/table scrolling has keyboard and pointer alternatives.
- Zoom to 200% and text spacing overrides must retain content and actions without overlap.

## Keyboard, Focus, and Screen-Reader Contract

### Page order

1. Shared skip link and LinerCore navigation.
2. Breadcrumbs and H1.
3. Module-local navigation.
4. Primary action, when permitted.
5. Filters and Clear filters.
6. Result summary.
7. Row links in visual order.
8. Pagination.

Detail order is Back link, record header, tabs, active panel, action rail, support details. At desktop widths the DOM order remains meaningful even if CSS places actions to the right.

### Interaction rules

- Native links implement rows and tabs wherever route semantics apply; Enter activates them. No `div` with click-only behavior.
- Table rows contain one predictable primary record link. Never make both the row and first cell separately focusable for the same destination.
- `RouteTabs` follow the established pattern: Tab/Shift+Tab enters/exits, arrow keys move between tabs, Enter/Space activates if activation is manual, and the active tab exposes `aria-current` or correct tab semantics.
- Filter errors and task validation errors use an error summary and programmatic field associations.
- Status badges, coverage notices, and D&D availability have visible text in accessible names.
- Monetary values announce currency and value; visual columns use tabular numerals.
- Dates are visually concise but have unambiguous accessible text including year; history includes timezone.
- Loading, result-count change, retry failure, conflict, and success use a shared polite announcement region. Destructive/consequential failure may use assertive announcement once.
- Skeletons and decorative icons are hidden from assistive technology.
- Lucide icons supplement text and use shared sizing/stroke tokens; no emoji is used as an application icon.
- Reduced-motion preference removes nonessential transition; no workflow depends on animation.

### Focus recovery

| Event | Focus destination |
|---|---|
| Filter update | Remains on changed control; result-count update is announced. |
| Clear filters | Result summary after URL update. |
| Page change | Result heading/summary, without returning to global navigation. |
| Open/cancel dialog | Dialog heading / original invoker. |
| Validation failure | Error summary, then linked fields. |
| Stale conflict | Conflict strip heading. |
| Successful create | New Agreement H1 and success notice. |
| Successful update/action | Updated record H1 or success notice after authoritative refetch. |
| Tab retry | Tab panel heading or failure notice. |

## Shared-versus-Charge Component Mapping

| Need | Shared owner / primitive | Charge-owned composition | Evidence status |
|---|---|---|---|
| Shell and breadcrumbs | LinerCore shell | Route metadata/labels only | BLOCKED — runtime shell not inspected. |
| Page/record headers | `PageHeader`, `RecordHeader` | Agreement title, version, metadata, capability actions | BLOCKED — responsive/runtime verification required. |
| Module links and stable tabs | Shared navigation links, `RouteTabs` | Charge route/query definitions | BLOCKED — keyboard/runtime verification required. |
| Filters | `FilterToolbar`, `Field`, shared lookup/combobox | Exact provider keys and Reference adapters | BLOCKED — query/provider mismatch must be resolved. |
| Results | `Table`, `TableContainer`, `Pagination` | Agreement columns, row accessible names, provider page mapping | BLOCKED — populated/mobile/runtime evidence absent. |
| Mobile records | Shared responsive list/record pattern if exported | Charge label/value ordering | BLOCKED — confirm shared primitive/approved composition; no fork. |
| Status | `StatusBadge`, `PartialDataNotice`, `ConflictStrip` | Domain lifecycle/coverage copy mapped to semantic variants | BLOCKED — contrast and non-color runtime evidence required. |
| Empty/error/denied | `EmptyState`, `FailureState` | Charge-specific safe messages and retry scope | BLOCKED — all live states require evidence. |
| Summary fields | `DefinitionList` | Agreement field groups and label fallback | BLOCKED — data mapping/runtime evidence required. |
| Technical evidence | `TechnicalDetails` | Sanitized provider/correlation content | BLOCKED — permission and disclosure review required. |
| Consequential confirmation | Shared `Dialog` only if accessible | Agreement impact copy and action adapter | BLOCKED — focus trap/restore/inert verification required. |
| Money/version/date formatting | Shared formatters/tokens where available | Charge field selection and exact version semantics | BLOCKED — locale and accessible-name evidence required. |
| URL/return context | Shared navigation/security helpers where available | Charge allowlist and query schema | BLOCKED — security/route tests required. |

No row in this mapping authorizes a Charge-local general-purpose component. Where a shared primitive is missing or fails the contract, record an `@erp/ui`/platform dependency with owner and exit evidence; keep the affected behavior blocked.

## Requirements and Story Traceability

| Requirement / story | Design location |
|---|---|
| FR-005, US-008 — Agreement list/detail and four stable tabs | Route map; Agreement Record Header and Tabs; Summary/Rates/D&D/History specs |
| FR-006, US-009 — lifecycle-valid actions and immutable history | Role-Aware Action Rail; permission and conflict matrices |
| FR-009, US-007 — provider-truth filters/pagination/fixed order | Authority order; Agreement List; URL rules |
| FR-012, US-010 — read-only/manual-pricing honesty | Summary; Manual Pricing; permission matrix |
| FR-014, US-014 — exact cross-links only | Cross-Links and Return Context |
| FR-015 — safe return context | URL and return-context rules; security acceptance checks |
| FR-017 — legacy route retirement | Obsolete-workbench redirect and deletion plan |
| US-015 — exact bound rate evidence | Rates; Rate Authority; incomplete coverage state |
| Shared full-state requirement | State, Conflict, and Recovery Matrix |
| WCAG 2.2 design target / 2.1 acceptance | Responsive and accessibility contracts; acceptance checklist |
| Single shell/shared ownership | Ownership boundary; Shared-versus-Charge Component Mapping |

## Application Design Confirmations

These are mandatory decisions before the candidate becomes implementation-binding:

1. Reconcile canonical Agreement list query keys with the provider: use `status` at the page contract and translate deliberately if the BFF retains `lifecycle`; do not forward unsupported `q`, origin, destination, equipment, or sort keys.
2. Confirm total-count, pagination origin, maximum size, abort/race behavior, and fixed provider order.
3. Confirm whether Reference Data label resolution is batched, cached, partial-safe, and permission-safe.
4. Confirm exact Agreement-detail/provider fields for bindings, pricing preview, and activity; remove every field not returned by an approved contract.
5. Confirm the Approval Queue route and both server-side Draft/pending filters. Do not client-merge independently paginated resources.
6. Confirm exact action capability names, lifecycle preconditions, version/ETag/idempotency behavior, and unknown-outcome recovery.
7. Confirm shared accessible dialog/sheet behavior. Map any gap to `@erp/ui`; do not create a Charge fork.
8. Keep the D&D tab unavailable until W3-01 design/contracts are approved, fixtures are verified, and the provider is merged.
9. Define an additive exact-identifier contract before enabling Booking↔Agreement links; no fuzzy resolution by version display string.
10. Confirm the shell module-navigation correction with the platform owner; Charge must not alter global shell composition locally.
11. Decide whether legacy redirects live in route handlers/config while preserving 308 semantics, query allowlisting, 404 behavior, and security logging.
12. Confirm whether pricing readiness and last-change projections will be added. Until then, keep them absent/unavailable rather than derived.

## Playwright and Visual-Regression Acceptance Checklist

### Routing and URL state

- [ ] Direct-load every canonical list/detail/task/module route at supported and unsupported query values.
- [ ] Verify Back/Forward restores filters, pagination, active tab, and safe return context.
- [ ] Verify invalid enum/date/page/size/tab values normalize without a request loop and announce correction.
- [ ] Verify all named legacy routes return the intended 308 and retain only allowlisted query values.
- [ ] Verify malformed IDs and unknown descendants return 404 rather than list fallback.
- [ ] Verify external, protocol-relative, encoded, nested, and double-encoded `returnTo` attacks are discarded.

### Provider truth and states

- [ ] Assert the Agreement list sends only supported query keys and server pagination values.
- [ ] Assert no generic search, origin/destination/equipment filter, or selectable sort is rendered.
- [ ] Assert fixed result order and total/pagination against provider responses.
- [ ] Capture loading, unfiltered empty, filtered empty, populated, denied, service unavailable, and partial states.
- [ ] Capture detail not-found, read-only, incomplete coverage, overlapping validity, stale version, approval pending, conflict, D&D unavailable, and success states.
- [ ] Prove exact bound versions remain stable when a newer approved rate exists.
- [ ] Prove missing categories never render as zero or silently disappear from the preview.
- [ ] Prove related Booking and D&D links remain absent/unavailable without exact identifiers/providers.

### Actions, permissions, and recovery

- [ ] Test each capability/lifecycle combination; hidden actions are not present in DOM or accessibility tree.
- [ ] Verify Approved history cannot be edited and successor creates/refers to a new Draft version.
- [ ] Verify consequential confirmations name Agreement/version, impact, and exact action.
- [ ] Verify double-click/Enter cannot issue duplicate mutations.
- [ ] Verify validation, 403, 404, 409/stale, 422/policy, 5xx, timeout, and unknown-outcome behavior.
- [ ] Verify authoritative refetch before success UI and no optimistic lifecycle/readiness claim.
- [ ] Verify dialog focus trap, Escape/cancel, background inertness, and invoker focus restoration.

### Accessibility and responsive evidence

- [ ] Run automated accessibility checks on every canonical route and each major state.
- [ ] Complete keyboard-only flows for filters, rows, pagination, tabs, action rail, dialogs, and retries.
- [ ] Confirm exactly one logical H1, landmark order, skip link, visible focus, and non-color status/coverage/D&D meaning.
- [ ] Confirm async result, pending, success, conflict, and retry announcements are concise and not duplicated.
- [ ] Confirm money/currency, versions, dates, table headers, and mobile record links have unambiguous accessible names.
- [ ] Capture 375, 390, 768, 1024, and 1440px in all required states and both supported LinerCore themes.
- [ ] Verify no page-level horizontal overflow at 200% zoom or with text-spacing overrides.
- [ ] Verify any table/tab overflow is labelled, keyboard reachable, and does not require a gesture.
- [ ] Verify reduced-motion behavior and contrast for text, focus, status, borders, and disabled/pending controls.

### Shared ownership and regression

- [ ] Assert the page runs inside the single LinerCore shell with no duplicate header/nav/theme root.
- [ ] Assert production imports shared primitives from `@erp/ui`; no domain-local shared-component copies or token files appear.
- [ ] Compare Agreement list/detail grammar with the approved Reference Data pattern while retaining Charge-specific workflows.
- [ ] Capture Rate Authority, Approval Queue, and Manual Pricing navigation/empty/error/denied behavior.
- [ ] Prove removing the obsolete workbench leaves no route, import, test, or deep-link regression.
- [ ] Run live Compose smoke, `aidlc-audit`, and `erp-fidelity-audit` at the intent exit gate; source-only checks do not satisfy this item.

## Same-Session Design Review — 2026-08-09

**Verdict:** APPROVED BY USER on 2026-08-09, WITH BLOCKERS DISCLOSED.

The candidate is traceable to the approved W4-01 provider inventory and intentionally corrects the advisory prompt where it asked for unsupported search/sort and list projections. It preserves the reviewed Reference Data grammar without flattening Charge versioning, Rate Authority, Approval Queue, or action policy. It introduces no new shell, theme, palette, font, domain-local shared primitive, bulk action, chart, or fabricated data.

This approval establishes the document as page-level design input for W4-01 Refined Mockups. It does not approve implementation or waive its evidence gates. D&D provider evidence, Booking linkage, list-query alignment, Approval Queue feasibility, shared accessible dialog behavior, global module-nav alignment, and all runtime/visual evidence remain blocked or require Application Design confirmation.

## Unresolved Questions and Blockers

1. **W3-01 approval/merge:** Where is the approved W3-01 D&D design and signed provider contract? Until supplied and verified, the D&D tab remains unavailable by design.
2. **Approval Queue route:** May Application Design establish `/charge-agreements/approvals?kind=agreements|rates`, and do both providers support bounded server-side Draft/pending filters and pagination?
3. **Agreement query vocabulary:** Will the BFF expose the approved provider key `status`, or intentionally translate the current UI/BFF `lifecycle` key? Unsupported `q`, origin, destination, equipment, and sort keys must be removed or rejected.
4. **Pricing projections:** Is an additive provider projection planned for pricing readiness, exact binding preview, and last change? These fields remain absent/unavailable until contract-approved.
5. **Booking links:** Which service will supply the exact parent Agreement ID and reverse related-Booking IDs? Display/version strings are insufficient.
6. **Shared dialog/sheet:** Does current `@erp/ui` pass focus trap, inert background, Escape, and restoration requirements for approval/suspend/expire actions? If not, platform ownership and exit evidence are required.
7. **Runtime evidence:** The demo/browser surface was unavailable. Responsive, keyboard, theme, visual, permission, and live-provider behavior still require evidence before approval for implementation.
8. **Shell navigation:** Who owns and schedules the observed global module-label/order correction so Charge can consume it without a local shell patch?

## Review Checklist

- [ ] Confirm this candidate honors the approved W4-01 Requirements Analysis and User Stories over incompatible advisory prompt requests.
- [ ] Confirm Agreement list controls exactly match current provider support and that fixed ordering is non-interactive.
- [ ] Confirm canonical routes, 308 legacy redirects, 404 behavior, and safe-return rules.
- [ ] Confirm Summary, Rates, D&D, and Status history are the only stable Agreement detail tabs.
- [ ] Confirm exact rate-version evidence, missing-category treatment, and itemized-preview rules.
- [ ] Confirm D&D remains honestly unavailable until approved W3-01 evidence exists.
- [ ] Confirm Rate Authority and Approval Queue stay dedicated workflows rather than being flattened into Agreement detail.
- [ ] Confirm manual pricing remains evidence-only and permission-gated.
- [ ] Confirm capability/lifecycle action rules, consequence summaries, idempotency, stale conflict, and focus recovery.
- [ ] Confirm Booking and Reference Data cross-links use exact identifiers and validated return context only.
- [ ] Confirm 375/390/768/1024/1440 responsive behavior, WCAG 2.2 AA design target, and WCAG 2.1 acceptance evidence.
- [ ] Confirm all shared UI, shell, tokens, dialogs, and global navigation remain LinerCore/`@erp/ui` owned.
- [ ] Resolve or explicitly accept every blocker above before marking this document approved page-level design input.
