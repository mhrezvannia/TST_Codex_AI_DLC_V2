# W4-01A Reference Data List-Detail Uplift

**Status:** Approved page-level design input  
**Date:** 2026-08-09  
**Scope:** Design documentation only; no production code, route, API, test, package, infrastructure, page-contract, or AI-DLC-state change

## Authority, Ownership, and Evidence

### Authority order

1. Approved W4-01 intent, Requirements Analysis, User Stories, and live Definition of Done.
2. Security, accessibility, enterprise frontend, and provider-contract standards.
3. `design-system/linercore/MASTER.md` and executable `@erp/ui` exports/tokens.
4. `design-system/linercore/pages/reference-data.md`.
5. This interaction specification after approval.
6. UI/UX Pro Max recommendations, used only where they do not conflict above.

### Ownership boundary

- `apps/shell` owns authenticated shell, permitted navigation, user/session presentation, breadcrumbs, and global chrome.
- `packages/ui` owns `--erp-*` tokens and shared primitives.
- Reference Data owns its routed page composition, terminology, validation, commands, provider states, and BFF/view-model adaptation.
- Reference Data must not create a local shell, navigation, theme, token set, authentication presentation, or shared-component fork.

### Source and runtime inventory

| Evidence | Observation | Status |
|---|---|---|
| Current Reference UI | `apps/reference-data/app/page.tsx` renders one `ReferenceDataWorkbench`; list, detail, contract catalog, and form are co-located. | PASS — source observed |
| Current Reference BFF | Set list, record list/detail/history, create, and update routes exist. Record-list `search` currently filters only the fetched provider page; update currently hard-codes `version=1`. Neither behavior is approved for the uplift. | PASS — source observed |
| Provider list contract | `includeInactive`, zero-based `page`, `size` default 25/clamp 1..100, fixed case-insensitive display-name order; no search or selectable sort. | PASS — source observed and requirements-approved |
| Provider detail/history | Stable set + record identifiers, versioned record facts, and ordered `ReferenceChange` evidence exist. BFF history is still typed as `unknown`, so a labelled history view model is required before implementation. | PASS — source observed; view-model work pending |
| Authorization | Current BFF has coarse `canWrite`; action-specific Validate/deactivate/reactivate capability remains blocked. | BLOCKED — Reference Data + Identity |
| Shared shell | `apps/shell` owns the correct shell primitives, but current navigation lacks Container Movement and does not yet match the binding master order/labels. W4-01 may consume the shell contract but not fork it. | BLOCKED — UI platform/shell owner |
| Old Reference design | The historical prompt `docs/ui-ux-prompts/14-reference-data-workbench.md` exists, but no generated/approved matching document was found under `docs/ui-ux-design`. | BLOCKED — approval provenance unavailable |
| Running demo | No controllable browser was available in this session, so live visual/interactive inspection and screenshots were not observed. | BLOCKED — runtime evidence |

The design is implementation-ready only for approved interaction intent. Application Design must resolve the source/mount, view models, policies, and platform dependencies before Construction.

## UI/UX Pro Max Decision Record

Adopted advisory guidance:

- Data-dense operational list/detail composition.
- Stable table dimensions, explicit empty/error recovery, keyboard focus, labelled mobile overflow, and reduced motion.
- App Router route loading boundaries and URL-backed query state.
- The existing visual direction's quiet light surfaces, restrained maritime accents, IBM Plex typography, and compact operational density, consumed through the shared shell and `--erp-*` tokens.

Rejected advisory guidance:

- Enterprise Gateway, hero, logo carousel, contact-sales, conversion, and marketing sections.
- Replacement blue/amber palette, Fira fonts, remote font imports, chart/KPI card composition, and spinner-first loading.
- Booking-specific journey ribbons or stage indicators on Reference Data routes.
- Bulk actions, saved views, global search, client-only search/sort/pagination, and generic “Coming soon” controls.
- Any recommendation to modify `packages/ui`, create a local component library, or reproduce the shell.

## Users, Stories, and Task Outcomes

Primary persona: Reference Data Administrator. Booking, Pricing, Charge, and Container users consume canonical Reference facts indirectly but do not gain new Reference capabilities here.

| Outcome | Stories | Screen evidence |
|---|---|---|
| Enter only when permitted | US-001 | Shell-owned permitted nav; shared denied page with no data flash |
| Open stable links and return safely | US-002 | Canonical set/record routes; allow-listed URL context; focus restoration |
| Find a record with real controls | US-003 | Set list then set-scoped record list; only `includeInactive`, page, and size controls |
| Inspect record and history | US-004 | Summary, Attributes, and History route tabs with labelled provider values |
| Create/update safely | US-005 | Focused create/edit routes, current version, validation, pending, success, conflict, and error |
| Recover without fabricated truth | US-006 | Authorized persisted-view disclosure or provider error; current-request Identity always required |

## Information Architecture and Route Responsibilities

| Canonical route | Responsibility | Query state |
|---|---|---|
| `/reference-data` | Reference-set list. Show provider set identity, readable name, description/ownership when available, status/count/last-change only when the provider supplies them. | No search, filter, selectable sort, or pagination controls in the current contract. |
| `/reference-data/[setCode]` | Records in one verified set. Show provider-supported `includeInactive` and pagination. | `includeInactive`, browser one-based `page`, validated `size`, bounded `focus`; BFF translates page to provider zero-based. |
| `/reference-data/[setCode]/[recordId]` | Shareable record detail with Summary, Attributes, and History. | Validated `tab` and bounded allow-listed list context only. |
| `/reference-data/[setCode]/new` | Focused create task when `reference-data:create` is ALLOW. | Validated bounded `returnTo` to the same module list only. |
| `/reference-data/[setCode]/[recordId]/edit` | Focused update task using the current provider version when `reference-data:update` is ALLOW. | Validated `tab` and bounded `returnTo`; never an external target. |

Application Design must confirm whether `setCode` is the provider path code or another stable ID. The design never infers or slugifies it.

### Migration from the old workbench

- Replace `/reference-data` in place with the set-list experience; no redirect.
- Retire `ReferenceDataWorkbench` composition after equivalent real capabilities have routed replacements.
- Do not carry the permanently embedded contract-card grid into record pages. Contract governance remains a distinct route/ownership decision outside this W4 interaction package unless already approved elsewhere.
- Do not carry fallback fixture records forward as business truth. FR-019 governs authorized persisted last-known data.
- Preserve current create and update outcomes, but replace coarse permission and hard-coded version assumptions before evidence may pass.

## Refined Wireframes

All frames render inside the existing `ShellFrame`. Reference Data never shows the journey ribbon.

### Desktop — set list, 1024/1440

```text
[Shell sidebar]  [Breadcrumb: Reference Data]
                 [H1 Reference Data]                       [No page command]
                 [Provider status / safe recovery strip when applicable]
                 [Reference sets — result count]
                 ----------------------------------------------------------
                 Set name/code | Description | Records* | Status* | Changed*
                 Currency      | ...         | 184      | Active  | 08 Aug
                 Location      | ...         | 2,431    | Active  | 09 Aug
                 ----------------------------------------------------------
                 *Render only when provider-owned; set name is a real link.
```

No search box or fake counts are shown when the provider enumeration does not supply those facts.

### Desktop — record list, 1024/1440

```text
[Shell sidebar]  [Breadcrumb: Reference Data / Currency]
                 [H1 Currency records]                [Create record]*
                 [Include inactive] [Page size]        184 records
                 ----------------------------------------------------------
                 Code link | Display name | State | Version | Last changed
                 USD       | US Dollar     | Active| 12      | 08 Aug 14:23
                 EUR       | Euro          | Active| 9       | 07 Aug 09:10
                 ----------------------------------------------------------
                 [Previous]          Page 2 of 8             [Next]
                 *Create appears only after action-specific server ALLOW.
```

Search and selectable sort are absent. The table caption states the fixed provider ordering.

### Desktop — record detail, 1024/1440

```text
[Shell sidebar]  [Breadcrumb: Reference Data / Currency / USD]
                 [Back to Currency records]
                 [H1 USD — US Dollar] [Active]       [Edit]*
                 Set Currency | Version 12 | Updated 08 Aug | Owner ...
                 [Summary] [Attributes] [History]
                 ----------------------------------------------------------
                 Selected tab content                    Action/evidence rail
                 Labelled provider facts                 Read-only reason
                 Readable relationships                  Publication state
                 Validity when supplied                  Retry/refresh
                 ----------------------------------------------------------
                 [Audit and technical evidence — collapsed]
```

The action rail never renders blocked Validate/deactivate/reactivate commands. Publication evidence is secondary to the persisted record outcome and must not imply end-to-end success while pending or failed.

### Desktop — create/edit task, 1024/1440

```text
[Shell sidebar]  [Breadcrumb: Reference Data / Currency / USD / Edit]
                 [Back to USD]
                 [H1 Edit USD]
                 ----------------------------------------------------------
                 Record fields                         Change evidence
                 [Canonical code      ]                Current version 12
                 [Display name        ]                Last changed ...
                 [Set-specific fields ]                Publication state
                 [Reason for change   ]
                 [Validation summary / conflict strip when applicable]
                 ----------------------------------------------------------
                 [Cancel]                              [Save changes]
```

The form uses one logical DOM order. A two-column desktop composition may place compact evidence beside the fields, but the evidence rail never interrupts field/error associations or becomes a second form.

### Mobile — set/record lists, 375/390

```text
[Compact shell header / module menu]
[Breadcrumb]
[H1 Reference Data or Currency records]
[Create]*
[Include inactive] [Page size]
[Result count / provider status]
[USD — US Dollar]          [Active]
 Version 12 | Changed 08 Aug
[EUR — Euro]               [Active]
 Version 9  | Changed 07 Aug
[Previous]                       [Next]
```

Rows are semantic records with a named detail link. No page-level horizontal overflow is introduced.

### Mobile — detail and form, 375/390

```text
[Back to Currency records]
[H1 USD — US Dollar]
[Active] [Edit]*
[Summary] [Attributes] [History]  (tab region may scroll internally)
[One-column labelled facts]
[Publication/recovery status]
[Audit evidence — collapsed]

EDIT TASK
[H1 Edit USD]
[Persistent field labels]
[Linked field errors]
[Reason for change]
[Cancel] [Save changes]
```

At 768px the table uses a labelled inner overflow region and the detail action/evidence rail stacks below the primary facts. At 1024/1440px the rail sits beside the selected tab without creating excessive whitespace.

## Binding Interaction Specification

### Reference Set List

| Field | Value |
|---|---|
| Component | ReferenceSetList |
| Purpose | Choose a provider-enumerated set by stable `setCode`. |
| Category | Route-level domain composition |
| Shared mapping | `PageHeader`, `TableContainer`, `Table`, `Skeleton`, `EmptyState`, `FailureState`, `StatusStrip` |

States: route skeleton; no sets; populated; denied; provider error; authorized stale/persisted view; partial metadata. Set links are native links. The set list does not show unsupported query controls. If count/status/last-change are absent, omit the column rather than displaying placeholders that imply provider truth.

Responsive: semantic record rows at 375/390; labelled overflow only if provider metadata makes a true table clearer at 768; compact table at 1024/1440.

Accessibility: one `h1`; table caption and real column headers; status text plus icon; result/provider changes announced politely; no focus movement after background refresh.

### Reference Record List

| Field | Value |
|---|---|
| Component | ReferenceRecordList |
| Purpose | Page through one set using provider-supported controls and open stable detail links. |
| Category | Route-level domain composition |
| Shared mapping | `Breadcrumbs`, `PageHeader`, `FilterToolbar`, `Field`, `Select`, `TableContainer`, `Table`, `StatusBadge`, `Pagination`, `PartialDataNotice`, `FailureState`, `Skeleton` |

Inputs: verified `setCode`, `includeInactive`, browser page, validated size, bounded focus ID. There is no `q` or sort input.

Column priority is code/key, display name, active/effective state, provider-supplied validity, version, and last change. Validity is omitted when the provider does not supply it; the UI never manufactures an effective date.

Interaction:

1. URL is the source of supported query state.
2. Changing `includeInactive` or size submits/navigates to page 1.
3. Page navigation requests the corresponding provider page through the BFF.
4. Record name/code is a real link carrying only validated same-module return context.
5. Back from detail restores the query and places focus on the invoking row link; if missing, focus the list heading.

### Reference Record Header and Tabs

| Field | Value |
|---|---|
| Component | ReferenceRecordDetail |
| Purpose | Show record identity, provider state, version, validity, ownership, and stable views. |
| Category | Route-level domain composition |
| Shared mapping | `RecordHeader`, `StatusBadge`, `RouteTabs`, `DefinitionList`, `StatusStrip`, `TechnicalDetails`, `IdentifierValue` |

Tabs:

- Summary: code, display name, set, status, version, created/updated actor/time, status-change actor/time, change reason, and validity/ownership only when supplied.
- Attributes: ordered set-specific labelled values and verified relationships. Empty attributes show `No additional attributes`; never raw JSON.
- History: ordered newest-first or oldest-first only after Application Design binds the provider order; each item shows operation, before/after readable summary, actor, time, reason, and safe correlation reference. A History-only failure leaves Summary/Attributes usable.

Tabs use URL state so refresh and sharing retain the selected view. Arrow keys move between tabs; Tab enters the active panel; focus does not jump when a tab panel refreshes.

### Create and Edit Tasks

| Field | Value |
|---|---|
| Component | ReferenceRecordForm |
| Purpose | Create or update a record using provider validation and current version truth. |
| Category | Focused domain task route |
| Shared mapping | `PageHeader`, `Field`, `Input`, `Select`, `Combobox` where canonical options exist, `Button`, `StatusStrip`, `ConflictStrip`, `Dialog`, `Toasts` |

Inputs use persistent labels and provider/set-specific constraints. Base fields are canonical code, display name, set-specific attributes, and reason for change. Lifecycle status is not editable until action-specific policy is approved.

Submit behavior:

1. Validate on blur where useful and always validate on submit.
2. Focus the first invalid field after a failed submit; link the error summary to every field error.
3. Disable only the submitting command while pending and set `aria-busy`; Cancel remains available when safe.
4. Send the current provider version for update; never a UI constant.
5. On success, re-read provider truth, announce success, and navigate to the stable detail record.
6. On version conflict, keep the draft, show current provider facts and choices to review/reapply or discard, and focus the conflict heading.
7. On service error, keep all entered values and logical focus; show safe Retry/reference evidence.
8. Dirty navigation opens a concise confirmation dialog; Escape closes when safe and restores the initiating link/button.

### Publication Evidence

Publication is secondary evidence, not a separate operator command in W4-01. When provider/outbox evidence exists, show `Pending publication`, `Published`, `Publication failed`, or `Retrying` with text and icon. Persisted record success and downstream publication are announced separately. No button claims to publish unless an approved user-facing contract and capability explicitly supports it.

## Permission and Action Matrix

| Surface/action | Visible condition | Denied/read-only behavior | Status |
|---|---|---|---|
| Module navigation/read | Current-request `reference-data:read` ALLOW | Navigation absent; direct link renders shared denied state with no data flash | Binding |
| Create | Action-specific `reference-data:create` ALLOW | Command absent; optional concise read-only reason/request-access path where supported | Binding |
| Edit/update | Action-specific `reference-data:update` ALLOW and current version | Command absent in read-only mode | Binding |
| Validate | Granular server ALLOW not currently exposed | Command absent | BLOCKED — Reference Data + Identity |
| Deactivate/reactivate | Exact lifecycle ALLOW and provider precondition not currently exposed | Commands absent; never permanently disabled placeholders | BLOCKED — Reference Data + Identity |
| View history | Read ALLOW and history provider available | History tab shows scoped unavailable/retry state; other tabs remain usable | Binding |

Authorization is never sourced from persisted business data or a frontend cache.

## State and Recovery Matrix

| State | Set list | Record list | Detail/form | Recovery and focus |
|---|---|---|---|---|
| Loading | Stable row Skeleton | Table/record Skeleton; controls reserved | Header/tab/form Skeleton as applicable | No repetitive live announcement; retain initiating focus until navigation completes |
| True empty | `No reference sets available` | `No records in this set` | Not applicable | Offer only a permitted next step; do not blame filters |
| Filtered empty | Not applicable | `No records match Include inactive setting` only when that filter can cause it | Not applicable | Clear/change supported filter; keep focus on control |
| Populated | Provider set links | Count, fixed-order rows, page controls | Labelled provider facts and actions | Normal navigation |
| Denied | Shared denied state, no data flash | Same | Same | Focus denied heading; expose help/request path if supported |
| Read-only | Sets/records readable | Create absent | Edit/mutations absent; concise reason | No disabled command maze |
| Not found | Invalid set returns 404 | Unknown set/record returns 404 | Named not-found state | Canonical module/set link; never guess an ID |
| Validation blocked | N/A | N/A | Field errors and summary | Preserve values; focus first invalid field |
| Save pending | N/A | N/A | Save busy; duplicate submission blocked | Remain in action context; announce pending once |
| Save success | Updated count/row after re-read | Created/updated row after re-read | Stable detail shows provider version | Announce persisted success; focus detail heading/logical continuation |
| Version conflict | N/A | Existing row remains | `ConflictStrip` with current version and retained draft | Focus conflict heading; Review/reapply or discard |
| Provider error | Safe message and Retry | Query preserved; safe reference | Record/tab/form preserved | Retry from the failed scope; no fabricated fallback |
| History unavailable | N/A | N/A | Only History panel unavailable | Other tabs remain usable; Retry in panel |
| Publication pending/failed | Secondary status only | Secondary status only if supplied | Separate from persisted success | Refresh/retry only when provider supports it; no duplicate record mutation |
| Authorized stale view | Source/time shown | Query retained; stale rows named | Stale facts named; freshness-dependent commands disabled | Retry; current-request Identity still required |
| Partial/degraded | Available metadata remains | Trustworthy rows remain with missing facet named | Usable tabs remain; scoped failure | Retry failed facet; do not blank trustworthy content |

## Responsive Contract

| Width | Binding behavior |
|---|---|
| 375/390 | Shell mobile navigation remains shell-owned. Lists become semantic record rows. Detail and forms are one column. Primary identity/status/action remain visible. Tabs may scroll inside their labelled region. Minimum 44px targets; no page-level overflow. |
| 768 | Compact filters wrap; tables use a labelled keyboard-reachable inner overflow region when necessary. Detail/action rail stacks. |
| 1024 | Dense table, compact header, and two-column detail with action/evidence rail. Avoid whitespace that pushes evidence below the fold. |
| 1440 | Same hierarchy with a bounded readable content width; do not stretch fact values or table columns merely to fill space. |

Both light and dark themes use existing `--erp-*` tokens. No hard-coded domain colors or alternate font loading is allowed.

## Keyboard, Focus, and Screen-Reader Contract

Design target: WCAG 2.2 AA. This is a specification target, not a conformance claim; automated and manual evidence on the implemented live routes is required before any accessibility row may pass.

1. Skip link → shell navigation → breadcrumbs → Back to results → `h1` → primary permitted action → filters → result count → rows → pagination.
2. Set and record identities are native links; Enter opens them. Do not make a whole table row an ambiguous custom control.
3. Tables have captions, `<th scope="col">`, and a labelled overflow wrapper that is focusable only when it actually scrolls.
4. Filter/page updates announce `N records, page X of Y` through an `aria-live="polite"` region and retain focus on the invoking control.
5. Tabs use the established arrow-key pattern with `aria-current`/tabpanel relationships and a single active panel.
6. Forms use persistent labels, `aria-describedby` links, an error summary, suitable input modes, and first-error focus after submit.
7. Dialogs trap focus, close with Escape when safe, and restore the trigger. Pending commands prevent duplicate activation.
8. Success uses a polite announcement; validation/conflict/provider failure uses an alert only when immediate attention is required.
9. Status, sensitivity, publication, and stale/degraded meaning always include text, not color alone.
10. Motion is limited to existing short token-driven transitions and disabled/reduced under `prefers-reduced-motion`.
11. Verify reflow at 200% and 400% zoom and long codes/names without truncating the only identity link.

## Shared-versus-Domain Component Mapping

| Surface/behavior | Requirement | Shared primitive/token | Domain composition | State coverage | Responsive evidence | Accessibility evidence | Status |
|---|---|---|---|---|---|---|---|
| Shell/nav/auth | One authenticated shell | `apps/shell`, `ProductWordmark`, `SideNavigation`, `Breadcrumbs`, `--erp-*` | Route content only | Denied/read-only | Shell-owned | Skip link/landmarks | BLOCKED — current nav contract requires platform-owned alignment |
| Set list | Provider set enumeration | `PageHeader`, `Table`, `Skeleton`, `EmptyState`, `FailureState` | Set labels/metadata | Full read states | Record-row fallback | Caption/headers/links | BLOCKED — source mapping verified; implemented runtime evidence pending |
| Record list | Provider page/filter only | `FilterToolbar`, `Field`, `Select`, `TableContainer`, `Pagination`, `StatusBadge` | Query validation and Reference columns | Full list states | Rows/inner overflow | Result announcements/focus restore | BLOCKED — source mapping verified; implemented runtime evidence pending |
| Record detail | Stable tabs and facts | `RecordHeader`, `RouteTabs`, `DefinitionList`, `TechnicalDetails` | Summary/Attributes/History view models | Detail/partial states | Stacked rail | Tab/focus semantics | BLOCKED — source mapping verified; implemented runtime evidence pending |
| Form/conflict | Safe create/update | `Field`, `Input`, `Select`, `Combobox`, `Button`, `Dialog`, `ConflictStrip`, `Toasts` | Set rules, current version, reason | Validation through recovery | One-column mobile | Labels/errors/trap/restore | BLOCKED — source mapping verified; implemented runtime evidence pending |
| Live visual/a11y | Observed route behavior | Playwright + axe + visual snapshots | W4 fixtures | Complete matrix | Five widths/two themes | Keyboard/screen reader/zoom | BLOCKED — no controllable browser and no implementation yet |

No missing primitive justifies a domain fork. If implementation finds a primitive gap, record behavior, affected evidence, platform owner, and release dependency; keep the row `BLOCKED` until the shared package ships it.

## Requirements and Story Traceability

| Design section | Requirements | Stories |
|---|---|---|
| Authority/routes/migration | FR-001, FR-002, FR-015–FR-018, FR-022; NFR-004, NFR-009 | US-001, US-002 |
| Set and record lists | FR-003, FR-009, FR-010 | US-003 |
| Detail/tabs/history | FR-003, FR-011, FR-021 | US-004 |
| Create/edit/permissions | FR-004, FR-012, FR-013, FR-020 | US-005 |
| Stale/degraded recovery | FR-019–FR-021; NFR-005, NFR-010, NFR-011 | US-006 |
| Responsive/accessibility | FR-022; NFR-002, NFR-003 | Cross-cutting contract |
| Live evidence | NFR-001, NFR-006–NFR-008, NFR-011, NFR-012 | Intent exit gate |

## Application Design Confirmations

1. Bind stable `setCode` and `recordId` parsing/canonicalization and safe `returnTo` allow-lists.
2. Replace the record-list BFF's partial-page client `search` with absence of search until an approved provider contract exists.
3. Pass the provider's current version for update; remove the hard-coded version assumption.
4. Define typed BFF view models for record detail, attributes, ordered history, and publication evidence.
5. Define action-specific authorization for read/create/update and keep Validate/deactivate/reactivate blocked until their exit criteria pass.
6. Resolve shell route mounting through the existing authenticated shell and route metadata; route any nav/order/label changes to the shell owner.
7. Define whether authorized persisted last-known Reference views exist. If not, provider failure is the only truthful outage state.
8. Confirm whether contract governance has a separate approved route; W4 must not recreate the workbench's embedded contract-card wall.

## Playwright and Visual-Regression Acceptance Checklist

- [ ] Direct `/reference-data`, set, record, new, and edit routes use the authenticated shell and refresh to the same canonical identity.
- [ ] Read capability controls shell navigation; denied deep links show no provider data flash.
- [ ] Set list exposes no unsupported query controls or invented metadata.
- [ ] Record list forwards only `includeInactive`, page, and size; search/selectable sort are absent.
- [ ] Page refresh preserves supported URL state; Back to results restores page/filter/focus.
- [ ] Summary, Attributes, and History render labelled provider values; raw payload stays collapsed/access-appropriate.
- [ ] Create and update use action-specific ALLOW, prevent duplicates, re-read success, and send the current version.
- [ ] Validation, conflict, provider error, history unavailable, publication pending/failed, stale, and partial fixtures preserve the approved context.
- [ ] Validate/deactivate/reactivate controls remain absent until their recorded contract exits pass.
- [ ] Unsafe, external, overlong, traversal, encoded-separator, and unknown return targets are rejected or dropped.
- [ ] Axe and manual keyboard checks pass; row links, tabs, dialogs, errors, announcements, and focus restoration match this specification.
- [ ] Visual snapshots cover 375, 390, 768, 1024, and 1440 in light and dark themes with no page-level overflow.
- [ ] Real Compose provider data and outage fixtures are used; screenshots or mocked component states alone are not a PASS.
- [ ] No domain-local shell, theme, hard-coded palette, auth presentation, shared primitive copy, or `packages/ui` change appears in the W4-owned diff.

## Same-Session Design Review — 2026-08-09

**Verdict:** APPROVED BY USER on 2026-08-09 as page-level design input, with the evidence and provider dependencies below remaining `BLOCKED`.

The review checked the active W4-01 intent, approved Requirements Analysis and User Stories, full Context Pack decisions, LinerCore master/session contract, Reference Data page contract, current shell/Reference source and provider routes, historical prompt 14, and `@erp/ui` exports. It found no unsupported action, invented provider query, guessed identifier, local shell/theme, replacement palette/font, marketing composition, or page-level mobile-overflow requirement.

Corrections applied during review:

- Made the result announcement contract explicit as `aria-live="polite"`.
- Set WCAG 2.2 AA as the design target while retaining live automated/manual proof as the conformance gate.
- Reclassified source-mapped component rows with pending runtime proof from `PASS` to `BLOCKED`.
- Kept set count/status/last-change conditional rather than fabricating them from the current provider's set-code enumeration.
- Kept search/selectable sort and Validate/deactivate/reactivate absent, rather than showing disabled placeholders.
- Kept runtime, old-design approval provenance, shell alignment, typed history, and action-policy gaps as `BLOCKED`; none was converted into a design PASS.

No further unambiguous design correction is required. This approval does not approve implementation, clear blockers, modify AI-DLC state, or advance the Refined Mockups stage.

## Unresolved Questions and Blockers

No unresolved business-design choice remains after the approved Requirements Analysis, User Stories, and guided Refined Mockups answers. The following evidence/dependency blockers remain explicit:

1. The approved generated design corresponding to historical prompt 14 was not found; this candidate uses the prompt as historical direction but does not claim its approval provenance.
2. No controllable browser was available, so the current running Reference Data route has not received live visual, responsive, or interaction review in this session.
3. Shell navigation/order/label alignment is platform-owned and must be resolved without a W4 domain-local shell or navigation fork.
4. Reference search/selectable sort, granular Validate/lifecycle authorization, typed history, and safe current-version update remain blocked or pending exactly as recorded above.

## Review Checklist

- [ ] Business scope and US-001–US-006 outcomes trace to approved requirements.
- [ ] The design preserves one `apps/shell` shell and `@erp/ui`/`--erp-*` ownership.
- [ ] Set list, record list, record detail, and form responsibilities are distinct and canonical.
- [ ] Only provider-supported Reference controls and actions are visible.
- [ ] Loading, empty, denied, read-only, not-found, validation, pending, success, conflict, error, history, publication, stale, and degraded behavior is explicit.
- [ ] 375/390/768/1024/1440, both themes, keyboard, focus, announcements, non-color meaning, reduced motion, and zoom/reflow are specified.
- [ ] Current source contradictions and platform/provider dependencies remain `BLOCKED`, not hidden by design claims.
- [ ] Marketing layout, card wall, replacement palette/fonts, bulk actions, saved views, and fake query behavior are absent.
- [ ] Runtime/visual evidence is not labeled PASS before an observed implementation run.
