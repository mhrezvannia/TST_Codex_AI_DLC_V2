# Interaction Spec - W3-01 D&D Rules & Rates

**Binding input:** approved page-level design `docs/ui-ux-design/18-dnd-rules-and-rates.md`.

**Handoff:** this document follows the binding `aidlc/spaces/default/memory/templates/interaction-spec.md` structure and `docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md`; it is the stage 2.5 interaction contract pending approval.

**Upstream inputs:** rough `wireframes.md`, rough `user-flow.md`, approved `stories.md`, approved `requirements.md`, and affirmed `team-practices.md`.

## Navigation & Shell Context

The feature lives in the canonical authenticated LinerCore shell under the existing Charge Agreements global navigation entry. Breadcrumbs retain Charge Agreements and the current D&D list or record. Charge administration routes pass `journeyStage=null`, using the source-observed no-ribbon seam, and do not create a second global/sidebar navigation system. Authentication is a real shared session; capability decisions come from the server and no hardcoded user or client-side permission guess is allowed.

Current source-known shell gaps remain UI-platform blockers: `PlatformShell` derives the active module from title text, provides no shared skip-link/main-content seam, omits Container Movement, and orders Reference Data before Charge Agreements. The LinerCore master requires explicit route metadata and the canonical Overview, Booking, Charge Agreements, Container Movement, Reference Data order. W3-01 must not patch, reorder, hide, or duplicate shell navigation locally; shell acceptance remains BLOCKED until the UI-platform owner supplies and the integrated stack proves the compliant baseline.

Authority order is approved requirements and stories, security/accessibility standards, LinerCore master and executable `@erp/ui`, approved page-level design, then external skill recommendations. The older D&D page contract's separate lifecycles and evaluation panel do not apply because the approved design decision is one combined lifecycle with no evaluation UI.

## Screens & Routes

Application Design confirms route spelling, stable identifiers, aliases, and Draft edit state. These logical routes bind the task and state composition only.

| Route | Type | Purpose |
| --- | --- | --- |
| `/charge-agreements/dnd/terms` | List | Search, filter, sort, paginate, count, and open combined terms |
| `/charge-agreements/dnd/terms/new` | Create | Define one combined Draft with fixed rule semantics and flat terms |
| `/charge-agreements/dnd/terms/[dndTermId]` | Detail | Identity, terms, applicability, pricing authority, relationships, history, audit, actions |
| Draft edit state, final form pending Application Design | Edit | Modify only a Draft with expected-version protection |
| Successor form state, final route pending Application Design | Successor | Create a distinct Draft from one Approved predecessor using the combined form |
| Existing AgreementVersion detail, final route pending Application Design | Relationship | One read-only `D&D terms` section in the existing detail content; no new tab |

No calculation-preview route, panel, form, or `Evaluate` command is in W3-01.

## List Page Spec

- PageHeader names `D&D terms` and exposes `Create D&D terms` only when permitted.
- Module-local route links preserve Agreements, Rate entries, Manual pricing, and D&D terms inside the routed content header; they do not alter global navigation.
- The binding minimum server-backed controls are Search, Rule type, Port, Lifecycle, Effective state, Apply, Clear, Updated sort, and pagination. Search covers stable D&D terms identity or exact pricing-basis reference; Rule type is All plus the three fixed types; Port uses canonical code/label values; Lifecycle is All/Draft/Approved; Effective state is All/Scheduled/Effective/Expired and applies only to Approved rows.
- Pricing-basis type/version, derived side, trade lane, equipment type, effective-on date, and agreement-link filters are deferred from W3-01. Application Design confirms parameter names, page/cursor mechanics, and provider view models for the binding controls; it may not silently remove a required control or add a deferred one.
- Apply submits filters; focusing a control never changes results. Clear removes only D&D list parameters.
- Active sort is a named link/button with `aria-sort`; default is most recently updated then stable identifier.
- The desktop table shows identity/rule, fixed bounding movement, applicability, exact basis/version, free days/rate, lifecycle, effective state/window, version, and update time.
- At 375/390 the table becomes semantic record items with the same named record link and business fields.
- Back from detail restores URL-backed filter, sort, and pagination state.
- No bulk edit, saved views, client-only fake pagination, click-only rows, or invented filter appears.

## Detail Page Spec

The RecordHeader shows the stable aggregate identity, readable rule type, port, Draft/Approved lifecycle, derived effective state, selected version, and capability-aware commands.

Sections follow this order:

1. Summary: fixed DCSA codes, readable movement labels, qualifiers, derived side, port-local counting basis, free days, daily amount, currency, charge code, and inclusive validity.
2. Pricing authority: exact AgreementVersion or tariff-composite basis, reference, version, and stable authorised link.
3. Agreement relationships: exact linked agreement versions and compatible state.
4. Version history: predecessor/successor, selected/current meaning, lifecycle/effective state, actor, time, and reason.
5. Audit evidence: collapsed TechnicalDetails with safe identifiers and correlation secondary to business facts.

Draft detail may show `Edit Draft` and `Review and approve`. Approved detail may show `Create successor` and must not show Edit or Save. Historical versions are immutable and directly addressable.

The existing AgreementVersion detail contains one binding `D&D terms` section after primary agreement commercial facts and before secondary technical evidence. It is not a tab. Loading uses section-sized Skeletons; empty says no D&D terms are linked to the selected agreement version and offers no create shortcut; scoped error uses section-safe semantic markup plus `StatusStrip` and Retry `Button` without hiding known agreement facts; denied uses no-disclosure copy and exposes no D&D count, identity, terms, state, or link. Route-level `FailureState` is prohibited inside this section because its current contract emits an `h1`.

## Successor Flow

`Create successor` is available only on an Approved version when the server grants the command. It opens `CombinedTermsForm` in successor mode with a visible `New successor to <identity> / v<source version>` heading and a stable read-only predecessor link.

1. Copy rule type, derived movement/side, pricing-basis type/reference/version, port, trade lane, equipment type, free days, daily amount, currency, charge code, and calendar basis from the selected Approved source.
2. Clear effective-from, effective-to, and change reason so the analyst must explicitly define the new window and rationale; infer no successor dates.
3. Allow edits to pricing-basis type/reference/version, port, trade lane, equipment type, free days, daily amount, charge code, inclusive window, and reason. Keep rule type, derived movement/side, currency, calendar basis, predecessor identity, and source history read-only.
4. Submit through the same Draft validation, reference-provider, overlap-key, and optimistic-version behavior as create/edit. Validation, provider, overlap, and concurrency failures retain every copied/entered value and the predecessor link; an authorised overlap message names and links the conflicting version/window.
5. Success creates a distinct Draft, never mutates the predecessor, navigates to the new Draft detail, focuses the stable heading or persistent success region, announces the new Draft version once, and renders explicit predecessor/successor links in history. Approval is still a separate command.

## States

| State | Presentation | Allowed action | Preservation/prohibition |
| --- | --- | --- | --- |
| Loading | Stable-size Skeleton in final geometry | Wait | No blank/spinner-only route |
| True empty | No terms yet | Create when permitted | Not used for filtered zero |
| Filtered empty | No matching results plus filter chips | Clear/edit filters | Preserve URL state |
| Populated | Count, rows, sort, pagination | Open stable record | Server data only |
| Read-only | Mutation commands absent plus concise status | Read/history/evidence | No disabled fake actions |
| Unauthenticated | Shared session-expired flow | Re-authenticate | No commercial disclosure; safe local context only |
| Forbidden | Shared denied state | Return to permitted module | No count, term, version, or audit detail |
| Not found | Named missing/stale record | Back to preserved list | Not a generic empty state |
| Partial/degraded | Known facts plus generic StatusStrip naming the affected D&D section | Retry affected section | No booking-specific copy, guessed facts, or full PASS |
| Validation blocked | Assertive linked summary and field errors | Correct fields | Preserve every entered value |
| Reference loading/error | Stable control skeleton/status | Wait or Retry source | No invented options |
| Save pending | `Saving...` in stable button | Wait | One request; keep form |
| Save success | Persistent Draft detail and polite confirmation | Continue or review | Toast never sole evidence |
| Approval pending | Dialog remains in context with `Approving...` | Wait | Duplicate/unsafe close blocked |
| Successor preparation | Combined form plus predecessor link | Save Draft or Cancel | Approved source stays immutable; window/reason require entry |
| Successor save failure | Linked validation, overlap, version, or provider evidence | Correct, Review/Reload, Retry, or open authorised conflict | Preserve copied/entered values and predecessor link |
| Successor save success | New Draft detail plus persistent lineage/success | Continue or review Draft | Never auto-approve or replace predecessor |
| Version conflict | ConflictStrip with expected/current | Review or Reload | Preserve Draft and reason |
| Overlap conflict | Exact key/window error | Open conflict or revise window | No partial approval |
| Approved history | Read-only facts and source links | Create successor | No edit/delete |

Outcome evidence for success, replay, bad request, unauthenticated, forbidden, no rate, conflict, in-progress, validation, unavailable, and degraded cases uses the existing authorised audit boundary. It never creates a simulation workflow, guesses source versions, or shows result/calculation data for outcomes where no result exists.

## Design System Usage

Use only LinerCore `--erp-*` tokens and source-observed `@erp/ui` exports: PlatformShell, Breadcrumbs, PageHeader, RecordHeader, RouteTabs or ordinary links, FilterToolbar, FilterChip, Field, Input, Select, Combobox, Table, Pagination, Button, Stack, Inline, DefinitionList, IdentifierValue, Badge, Skeleton, EmptyState, route-level FailureState, StatusStrip, ConflictStrip, Dialog, TechnicalDetails, and CopyButton. Use `Badge` with an explicit supported tone plus visible lifecycle/effective-state text; do not rely on `StatusBadge` fallback mappings for D&D statuses. Do not use booking-specific `PartialDataNotice` on Charge pages.

Domain composition stays inside the Charge app. No local palette, typography, token system, component library, shell, navigation, auth presentation, or shared-package edit is authorised. Async Combobox loading/error is composed with surrounding shared Skeleton/StatusStrip until a real provider contract proves whether a platform enhancement is needed.

## Domain-True Forms

The combined Draft captures the real approved aggregate:

- one of exactly three fixed rule types;
- derived start/end DCSA codes and EMPTY/LADEN qualifiers;
- derived POD side for import rules and POL side for export detention;
- exact approved Agreement or Tariff basis/reference/version;
- canonical UN/LOCODE port, trade lane, equipment type, currency, and charge code;
- non-negative whole free days and one non-negative scale-two flat daily amount;
- port-local calendar-day basis with weekends and holidays included;
- inclusive effective window and required change reason.

Reference Data values are code-plus-readable-label lookups, not duplicated free text. Rule semantics, side, currency basis, and calendar basis are locked. The form has no arbitrary movement editor, generic combined type, progressive bands, holiday calendar, working-day switch, currency conversion, customer override, or evaluation inputs.

## Combined Terms Form

| Field | Value |
| --- | --- |
| Component | CombinedTermsForm |
| Description | Creates, edits, or prepares a successor Draft for one combined D&D rule/rate aggregate |
| Category | input |

### States

| State | Description | Trigger |
| --- | --- | --- |
| default | Settled references and untouched fields | Route load completes |
| focus | Shared focus ring on current control | Keyboard or pointer focus |
| loading | Stable reference sections while options load | Provider request pending |
| validation | Summary plus associated inline errors | Blur or invalid submit |
| conflict | Expected/current or overlap evidence shown | Save/approval rejects |
| pending | One Save Draft request | Submit accepted |
| error | Scoped provider/service failure with values retained | Request fails |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialDraft | CombinedTermsDraft or null | yes | null | Existing Draft or create defaults |
| mode | create, edit, or successor | yes | create | Sets command copy, locks, and predecessor presentation |
| predecessor | ApprovedTermsVersion or null | successor only | null | Immutable source identity, lineage link, and copied values |
| capabilities | TermsCapabilities | yes | none | Server-derived create/edit/approve policy |
| referenceOptions | CanonicalReferenceOptions | yes | none | Settled code/label values |
| expectedVersion | string or null | yes for edit | null | Optimistic concurrency token |
| onSave | command | yes | none | BFF-mediated Draft command |
| onCancel | command | yes | none | Back/close with dirty-state protection |

### Responsive Behaviour

| Breakpoint | Behaviour |
| --- | --- |
| 375/390 | One column; commands wrap; full labels and hints remain visible |
| 768 | One column unless a field pair remains readable; no side rail |
| 1024 | Two grouped columns, terms/validity full width |
| 1440 | Same hierarchy with controlled line length; no stretched fields |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| Semantics | Native form, fieldsets/legends where groups need a name |
| Keyboard | DOM order follows visual order; no custom positive tab index |
| Labels | Persistent visible label, hint, required meaning, associated error |
| Error | Invalid submit focuses assertive summary; links focus exact controls |
| Dynamic derivation | Rule change politely announces fixed pair and derived side without moving focus |
| Focus | Shared token ring; pending retains focus unless navigation succeeds |

## Approval Dialog

| Field | Value |
| --- | --- |
| Component | TermsApprovalDialog |
| Description | Reviews exact Draft scope and confirms immutable approval |
| Category | feedback / command |

### States

| State | Description | Trigger |
| --- | --- | --- |
| closed | No dialog mounted | Initial state or cancel |
| review | Exact version, applicability, terms, basis, reason, overlap result | Open command |
| pending | `Approving...`; duplicate command blocked | Confirm |
| validation | Approval-blocking overlap or invalid term | Server response |
| conflict | Expected/current version evidence | Concurrency response |
| error | Scoped unavailable state | Provider response |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| termsVersion | CombinedTermsVersion | yes | none | Exact reviewed Draft |
| capabilities | TermsCapabilities | yes | none | Server-derived approval permission |
| onApprove | command | yes | none | One BFF-mediated approval command |
| onClose | command | yes | none | Safe cancel/restore |

### Responsive Behaviour

| Breakpoint | Behaviour |
| --- | --- |
| 375/390 | Width constrained to viewport; one-column facts; actions wrap |
| 768 | Compact dialog with readable summary |
| 1024/1440 | Same content; no oversized modal or nested dialog |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| Role/name | Shared Dialog supplies the labelled title; a programmatic description relationship is BLOCKED pending a UI-platform `aria-describedby` seam, with no local Dialog fork |
| Keyboard | Tab/Shift+Tab contained; Escape closes only when safe |
| Focus | Initial focus on safe cancel or heading per shared contract; restore trigger on close |
| Pending | Stable label and polite status; no duplicate submit |
| Error | Persistent inline outcome; toast may supplement only |

## Versioned Terms List

| Field | Value |
| --- | --- |
| Component | VersionedTermsList |
| Description | Server-backed filterable list of combined D&D terms |
| Category | display / navigation |

### States

| State | Description | Trigger |
| --- | --- | --- |
| loading | Stable filter/table or record skeleton | Route/query load |
| empty | No terms exist | Zero unfiltered results |
| filtered-empty | No results match URL filters | Zero filtered results |
| populated | Count, stable links, sort, pagination | Results returned |
| denied | Shared no-disclosure route | Capability denied |
| error | FailureState for list provider | Query fails |
| degraded | Known rows with affected secondary data named | Partial source failure |

### Props / Inputs

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| query | TermsQuery | yes | URL defaults | Server query meaning |
| result | PaginatedTerms | yes | none | Rows, count, cursor/page |
| capabilities | TermsCapabilities | yes | none | Create/read policy |
| onNavigate | route action | yes | none | Stable record navigation |

`TermsQuery` contains only the binding W3-01 search, rule-type, port, lifecycle, effective-state, updated-sort, and pagination meanings. Exact parameter names and cursor/page encoding remain Application Design decisions.

### Responsive Behaviour

| Breakpoint | Behaviour |
| --- | --- |
| 375/390 | Semantic record items and in-flow filter disclosure |
| 768 | Compact table with named inner overflow where needed |
| 1024/1440 | Full stable columns and pagination |

### Accessibility

| Requirement | Implementation |
| --- | --- |
| Table | Caption/label, scoped headers, `aria-sort`, named record links |
| Filters | Persistent labels; Apply/Clear explicit; active chips removable by keyboard |
| Announcements | One polite count/loading/result update per query |
| Status | Text meaning plus semantic badge/icon; never color alone |
| Mobile | Record reading order and link name match desktop meaning |

## Accessibility & Responsiveness

The design target is WCAG 2.2 AA, satisfying the project WCAG 2.1 AA floor. Every route has one `main`, one visible `h1`, sequential headings, the shared skip link, logical DOM/focus order, visible token focus, persistent labels, linked errors, accessible async status, non-color state meaning, reduced-motion behavior, and no page-level overflow.

Required evidence widths are 375, 390, 768, 1024, and 1440 pixels. Light/dark contrast, 200% zoom, long data, keyboard-only operation, dialog containment/restore, Combobox active-option behavior, and real provider degradation remain future integrated observations and are not PASS from this document.

## Traceability

| Designed behavior | Requirement/story/acceptance evidence |
| --- | --- |
| Fixed type, pair, qualifiers, derived side | FR-01, FR-02, US-01 AC1, AC-01 |
| Exact basis/applicability and flat terms | FR-02, FR-04, FR-05, US-01 AC2-AC3, US-03 AC1, AC-02-AC-05, AC-07 |
| Draft/Approved/successor immutability | FR-03, FR-10, FR-12, US-02 AC1-AC4, AC-08, AC-10 |
| List/form/detail/state/accessibility | FR-09, NFR-06, US-01 AC4, AC-10, RV-02 |
| Exact audit disposition meanings | FR-06-FR-08, FR-12, NFR-02-NFR-04, US-04, AC-06, AC-09 |
| Trigger metadata remains rates-free | FR-11, NFR-07, US-02 AC5, RV-05 |
| No evaluation UI; direct provider proof retained | FR-09, US-03, US-04, AC-03-AC-09, RV-02, RV-05 |

## Open Questions

1. Application Design must confirm final routes, identifiers, edit/successor state, aliases, provider implementation for the binding query controls, concurrency token, exact administration errors, and BFF/view-model ownership.
2. Application Design must confirm AgreementVersion versus tariff-composite lookup labels and no-disclosure behavior.
3. Application Design must confirm canonical port-timezone and charge-code Reference Data contracts and scoped missing/error meanings.
4. Integrated visual, keyboard, responsive, and accessibility evidence remains BLOCKED until implemented W3-01 routes exist on the isolated stack.
