# Design System Mapping - W3-01 D&D Rules & Rates

**Binding input:** approved page-level design `docs/ui-ux-design/18-dnd-rules-and-rates.md`.

**Handoff:** binding Refined Mockups component/token/ownership mapping produced under `docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md`; implementation-dependent evidence remains `BLOCKED` until observed.

**Upstream inputs:** rough `wireframes.md`, rough `user-flow.md`, approved `stories.md`, approved `requirements.md`, and affirmed `team-practices.md`.

## Authority and ownership

1. Approved W3-01 requirements and stories govern business behavior.
2. Security, accessibility, enterprise frontend, and BFF standards govern safeguards.
3. LinerCore MASTER and executable `@erp/ui` govern shell, tokens, typography, primitives, state language, and responsiveness.
4. The approved W3-01 design governs page composition.
5. UI/UX Pro Max is advisory.

`apps/shell` owns the authenticated shell and global navigation. `packages/ui` owns tokens and shared primitives. The Charge app owns D&D route composition and workflows. Charge services own D&D facts, invariants, persistence, contracts, and authorization outcomes. Reference Data owns canonical port/timezone, trade lane, equipment type, currency, and charge-code values.

## Shared component mapping

`PASS` below means the named primitive/export or token was observed and is suitable for the specified design mapping. It is not integrated route, interaction, visual, or accessibility evidence.

| Surface/behavior | Requirement | Shared primitive/token | Charge-owned composition | State coverage | Responsive evidence | Accessibility evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Authenticated shell | One canonical Charge route context, no journey ribbon | PlatformShell, Breadcrumbs, `--erp-*` | Pass `journeyStage=null`; route content only | Loading, denied, route error | Contract at 375-1440 | Active-route metadata, shared skip/main seam, and canonical rail are source-known gaps | BLOCKED on UI-platform shell dependencies and integrated proof |
| List header/command | Identity, scope, permitted Create | PageHeader, Button, Stack | D&D title, count, capability-aware command | Read-only, pending navigation | Reflow specified | Heading and focus order specified | PASS |
| Module-local routes | Agreements, rates, manual pricing, D&D | RouteTabs or ordinary links | Charge-local route labels and `aria-current` | Active/read-only | Wrap/overflow specified | Named links specified | PASS |
| Search and filters | Server-backed query/sort/page | FilterToolbar, Field, Input, Select, Combobox, FilterChip | D&D query meanings and URL state | Loading, filtered empty, error | In-flow mobile disclosure | Labels, Apply/Clear, announcements | BLOCKED pending provider/query confirmation |
| Result/history tables | Stable records, versions, relationships | Table, Pagination, Skeleton, EmptyState | Columns, row links, sort controls, mobile records | Loading, empty, populated, degraded | Record conversion/inner overflow | Caption, headers, `aria-sort`, links | PASS |
| Detail identity/actions | Lifecycle, effective state, exact version | RecordHeader, Badge with explicit supported tone, Button | Draft/Approved action policy and visible state text | Read-only, conflict, pending | Rail/stack contract | Non-color status and focus order | PASS |
| Business facts | Terms, applicability, lineage | DefinitionList, IdentifierValue, Badge with explicit supported tone | DCSA labels, money, dates, version facts | Partial/degraded | Rail becomes flow content | Semantic name/value reading | PASS |
| Combined Draft form | Fixed rule, references, flat terms, validity | Field, Input, Select, Combobox, StatusStrip, Button | Derivation, validation, exact basis, save | Loading, validation, pending, error | One/two-column contract | Labels, hints, summary, announcements | PASS |
| Approval/dirty guard | Immutable reviewed command and unsaved scope | Dialog, Button, StatusStrip | Exact D&D review and pending policy | Review, pending, validation, conflict, error | Viewport-constrained dialog | Title/trap/restore source-observed; description relation unavailable | BLOCKED on `aria-describedby` platform seam and live proof |
| Conflict/degraded/error | Preserve true provider meaning | ConflictStrip, generic StatusStrip, route-level FailureState, Button | Section-safe markup for scoped failures; exact recovery/no-guess policy | Conflict, partial, unavailable | In-flow at all widths | Persistent text, one route `h1`, and focus handling | PASS |
| Audit evidence | Secondary attributable facts | TechnicalDetails, CopyButton, IdentifierValue | Outcome-specific safe evidence | Loading, success, replay, failure dispositions | Follows primary content on mobile | Disclosure keyboard/name specified | PASS |
| Toast/status | Supplement persistent outcome | StatusStrip and existing toast/live behavior | Exact save/approval message | Pending, success, error | Stable dimensions | Polite/assertive channels specified | PASS |
| Evaluation UI | Not approved for W3-01 | None required | Direct API/contract/live proof | Provider outcomes only | Not applicable | Not applicable | NOT APPLICABLE |

## Token and visual rules

- Use `--erp-color-*`, `--erp-space-*`, `--erp-font-*`, focus, border, shadow, radius, and semantic tokens from `packages/ui/src/styles.ts`.
- Use IBM Plex Sans/system via `--erp-font-sans`; use mono only for identifiers and technical evidence.
- Use Lucide icons only when an icon adds meaning; icon plus text for status.
- Use compact table and form density, stable dimensions, 4-8px radii, and 150-250ms non-layout-shifting transitions.
- Support light and dark themes from shared tokens. No hardcoded module colors or remote fonts.

## Platform dependencies and boundaries

1. `PlatformShell` can suppress the journey ribbon with `journeyStage=null`, but current source derives active navigation from title text, has no shared skip-link/main-content seam, omits Container Movement, and orders Reference Data before Charge Agreements. Explicit route metadata, the shared skip/main seam, and the canonical rail/order are UI-platform dependencies. W3-01 must not add a local shell, local skip-link substitute for the shared contract, title workaround, or rail patch.
2. `StatusBadge` falls back to neutral for unregistered D&D lifecycle/effective statuses. W3-01 composes the generic `Badge` with an explicit supported semantic tone and always-visible Draft/Approved/Scheduled/Effective/Expired text; no shared status registry edit is authorised.
3. `PartialDataNotice` hardcodes booking vocabulary and is not used. D&D partial/degraded states use generic `StatusStrip` with Charge-owned copy. `FailureState` is reserved for full-route errors because it emits an `h1`; scoped AgreementVersion failures use section-safe semantic markup, `StatusStrip`, and Retry `Button`.
4. The current shared `Dialog` provides an accessible title, focus containment, Escape, and trigger restoration but no `aria-describedby` prop/seam. Programmatic description evidence remains BLOCKED for the UI-platform owner. W3-01 may keep concise visible review facts in the body but must not fork or wrap a second Dialog primitive to claim the missing relation.
5. The current shared Combobox mapping covers settled options and active-descendant behavior, but its explicit async loading/error contract is unresolved. Compose settled reference controls with surrounding shared Skeleton/StatusStrip. If real paging inside the popup is required, record a UI-platform dependency; do not fork a local combobox.
6. No Drawer is required. Mobile filters expand in flow, so W3-01 introduces no missing shared primitive.
7. Sortable server-backed headers may use native links/buttons within Table. A future shared primitive requires cross-domain evidence and UI-platform ownership.
8. No D&D calculation component belongs in `packages/ui`; any authorised audit calculation evidence is Charge-domain composition.
9. No gap authorises changes to `packages/ui`, `apps/shell`, the LinerCore master, tokens, authentication, or global navigation.

## Rejected advisory recommendations

| UI/UX Pro Max recommendation | Decision |
| --- | --- |
| Enterprise Gateway, hero, logos, role tabs, Contact Sales | Rejected: authenticated operational module |
| Replacement blue/amber palette | Rejected: LinerCore tokens are binding |
| Atkinson, Inter, Fira, or Source Sans remote fonts | Rejected: shared IBM Plex/system typography |
| KPI/chart-first dashboard | Rejected: task-first list/form/detail/history/evidence |
| Spinner-first loading | Rejected: shared content-shaped Skeletons |
| Generic bulk editing and saved views | Rejected: outside approved scope |
| Blanket Server Actions for mutations | Rejected as a design mandate: Application Design preserves the established BFF/API-core boundary |
| Scale hover animation | Rejected: no layout shift; reduced motion respected |

Adopted guidance is limited to dense scannable tables, explicit filters, stable links, on-blur validation, preserved values, visible feedback, semantic HTML, keyboard order, responsive table handling, reduced motion, and accessible announcements.

## State and evidence coverage

| Evidence class | Status | Reason |
| --- | --- | --- |
| Source-observed primitive/export mapping | PASS | Suitable exports map explicitly; unsuitable booking/scoped/status uses are excluded |
| Approved business/page composition | PASS | Requirements, stories, and explicit design approval align |
| Provider-backed filter/reference semantics | BLOCKED | Application Design must confirm real query and Reference Data contracts |
| Shared shell/no-ribbon behavior on W3 route | BLOCKED | No-ribbon prop exists; active-route, skip/main, rail membership/order, and integrated proof remain UI-platform blockers |
| Dialog/Combobox keyboard behavior on W3 route | BLOCKED | Dialog description seam, real route, and provider evidence remain unresolved |
| Responsive visual results at required widths | BLOCKED | Design contract exists; screenshots/scroll assertions do not |
| Page-level automated accessibility | BLOCKED | Requires implemented route and axe/keyboard evidence |
| Evaluation page mapping | NOT APPLICABLE | Evaluation UI was explicitly deferred |

## Traceability

| Design-system decision | Requirements/stories |
| --- | --- |
| Shared shell and `@erp/ui` only | FR-09, NFR-06, US-01 AC4, AC-10 |
| Server-backed list pattern | FR-09, US-02 AC4, AC-10 |
| Domain-owned combined form | FR-01-FR-03, FR-09, US-01, US-02 |
| Immutable action policy and Dialog | FR-03, FR-10, FR-12, US-02, AC-08, AC-10 |
| Error/conflict/degraded shared states | FR-06, FR-08, FR-12, US-04, AC-06, AC-09 |
| No evaluation component | FR-09 plus approved design decision; provider proof retains US-03/US-04 |

## Open questions

Application Design must confirm final route and provider contracts, capability mapping, exact Reference Data seams, and whether any shared dependency remains after the integrated baseline is synchronized. Until then, affected evidence stays BLOCKED rather than gaining a local workaround.
