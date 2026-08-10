# Design System Mapping - W4-01 Module List-Detail Uplift

## Sources and Ownership Rule

This mapping consumes the approved `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, `team-practices.md`, and the approved design candidates 21, 22, and 23. `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, shared tokens, and executable `@erp/ui` remain authoritative.

W2-02 owns the shell, navigation, tokens, and shared primitives. W4 owns only Reference Data, Charge Agreements, and Container Movement page composition. A missing shared behavior is a dependency, never authorization to create a domain-local theme, shell, Drawer framework, or shared-component fork.

## Shared Shell Mapping

| Surface | Shared owner / primitive | W4 composition | Evidence status |
| --- | --- | --- | --- |
| Authenticated shell | `PlatformShell`, session/auth boundary | Route content and metadata only | Existing shell PASS; affected-route runtime BLOCKED. |
| Global navigation | Shell route registry and `SideNavigation` | Labels and exact permission requirements | Platform change required for missing/incorrect items. |
| Breadcrumbs / Back | `Breadcrumbs`, native links | Domain labels and validated `returnTo` | Runtime and safe-navigation tests BLOCKED. |
| Page / record header | `PageHeader`, `RecordHeader` | Domain identity, status, permitted actions | Mapping PASS; integrated evidence BLOCKED. |
| Tabs | `RouteTabs` | Reference 3, Charge 4, CMM 3 stable views | Mapping PASS; keyboard/runtime evidence BLOCKED. |
| Theme and focus | `--erp-*`, `--erp-focus-ring`, shared motion tokens | No domain overrides | Static mapping PASS; two-theme evidence BLOCKED. |

## Lists and Data Display

| Surface | Shared primitive/token | Domain-owned composition | States | Gap / status |
| --- | --- | --- | --- | --- |
| List controls | `FilterToolbar`, `Field`, `Select`, `Input`, `Combobox`, `Button` | Only provider-backed query keys | default, pending, invalid, unavailable | Unsupported controls omitted. |
| Dense results | `TableContainer`, `Table`, `StatusBadge` | Exact columns and native identity links | populated, stale, partial | Mobile semantic-record pattern uses shared tokens/semantics. |
| Pagination | `Pagination` | Reference/Charge provider pages only | first, middle, last, unknown total | Not used for CMM; CMM exposes limit only. |
| Loading | `Skeleton` | Shape matches table/header/panel | initial, refresh | No spinner-first full page. |
| Empty | `EmptyState` | True versus filtered empty copy | true, filtered, not applicable | No create CTA when creation is provider-owned/unsupported. |
| Failure | `FailureState`, `StatusStrip`, `PartialDataNotice` | Safe domain copy and recovery owner | denied, error, stale, partial | No raw payload or false fallback. |
| Labelled facts | `DefinitionList`, `IdentifierValue` | Exact provider fields | full, partial, unavailable | Missing values omitted or truthfully named. |
| Evidence | `TechnicalDetails` | Sanitized IDs/correlation/dedupe/dependency | collapsed, partial, denied | Access review and runtime evidence BLOCKED. |

## Actions and Forms

| Surface | Shared primitive/token | Domain-owned composition | States | Gap / status |
| --- | --- | --- | --- | --- |
| Reference create/edit | `Field`, `Input`, `Select`, `Combobox`, `Button` | Set rules, reason, current version | validation, pending, success, conflict, error | Provider/capability tests BLOCKED. |
| Role-aware actions | `Button`, shared actions/menu behavior | Exact capability and precondition | hidden, read-only, ready, pending | Disabled placeholders do not substitute for permission. |
| Confirmations | `Dialog` | Concise irreversible confirmation only | open, cancel, confirm, pending | Focus-trap/restore evidence required. |
| Conflict handling | `ConflictStrip`, `StatusStrip` | Current version/lifecycle/required-next | version, duplicate, sequence conflict | Provider truth; retained drafts/inputs. |
| Container capture | `Field`, `Select`, `Combobox`, `Input`, `Button` | Event, active location, occurrence time | validation through unknown outcome | CMM frontend/BFF and lookup BLOCKED. |
| Rate Authority | List/detail/form/history primitives above | Exact rate IDs/versions, provider filters, immutable history | list, empty, detail, denied, stale, error | Existing Charge contracts; integrated W4 evidence BLOCKED. |
| Approval Queue | `RouteTabs`/`Select`, `Table`, `Pagination`, state primitives | Separately server-filtered Agreement/rate kinds | loading, empty, populated, unavailable | Candidate remains BLOCKED until both server filters are confirmed. |
| Manual-pricing evidence | `FilterToolbar`, `Table`, `TechnicalDetails`, state primitives | OPEN evidence only; no resolution | loading, empty, populated, denied, error | Permission/provider runtime evidence BLOCKED. |
| Booking-to-Journey | `StatusStrip`, native `Link`, `Button`, `FailureState` | Provider lookup by exact `bookingId` | present, not-created, denied, dependency error | Booking/CMM BFF integration BLOCKED. |
| Announcements | shared toast/live-region behavior | Persisted/accepted/publication/application as separate copy | polite, alert | Must not announce false success. |
| Responsive action | Shared layout primitives | Stacked in-flow task section | collapsed, open, pending | No local Drawer; future Drawer is platform-owned. |

## Domain Mapping

### Reference Data

`PageHeader`, `Breadcrumbs`, `Table`, `Pagination`, `RecordHeader`, `RouteTabs`, `DefinitionList`, form primitives, `ConflictStrip`, and `TechnicalDetails` compose set list, record list, Summary, Attributes, History, create, and edit. Reference controls may not add search, sort, Validate, deactivate, or reactivate until approved provider and Identity contracts exist.

### Charge Agreements

Shared list/detail primitives compose provider-supported filters, Agreement identity/version, Summary, Rates, D&D, and Status history. Dedicated Charge routes retain Rate Authority list/detail/history, exact linked version return context, Approval Queue feasibility, and permission-gated manual-pricing evidence. `Combobox` may resolve canonical customer/lane/commodity labels through an approved Reference seam; raw IDs remain safe fallbacks. Agreement Rates remains read evidence, not a forked Rate Authority UI. D&D is unavailable when the provider contract cannot support it.

### Container Movement

`PageHeader`, `Button`, `Select`, `Table`, `RecordHeader`, `RouteTabs`, `DefinitionList`, native ordered-list semantics, form primitives, `ConflictStrip`, `PartialDataNotice`, and `TechnicalDetails` compose recent Journeys, Summary, Movement timeline, Linked booking, and capture. All CMM frontend, mount, view-model, and runtime evidence remains BLOCKED because no current frontend source exists.

The Booking-owned relationship region reuses shared status/failure/link primitives and an authorized provider lookup by exact `bookingId`. It renders exact-link, not-created, denied, and dependency-failure states without importing CMM UI or guessing a Journey ID.

## Token and Visual Rules

- Use shared typography, spacing, surface, border, focus, status, elevation, and motion tokens only.
- Use existing LinerCore light and dark themes; do not add a dark-default or alternate palette.
- Use Lucide icons only as supplementary cues. Status and actions always have visible text.
- Use tabular/mono shared tokens for IDs where appropriate; do not force letter-by-letter screen-reader output.
- Do not load remote fonts, hard-code hex values, introduce decorative charts/maps/KPI walls, or use scale-hover motion.
- Keep dense operational hierarchy, bounded content widths, and predictable action placement.

## Responsive and Accessibility Evidence

| Width | List mapping | Detail/action mapping | Required evidence |
| --- | --- | --- | --- |
| 375/390 | Semantic records; stacked controls; no page overflow | One column; in-flow task; labelled tab overflow | Touch, keyboard, zoom, both themes. |
| 768 | Wrapped filters; labelled inner table overflow only when needed | Rail stacks after primary content | DOM/visual order, focus, no local Drawer. |
| 1024 | Dense shared table | Two-column detail/action composition | Long data, partial states, both themes. |
| 1440 | Same hierarchy in bounded width | Stable reading measure and evidence rail | No decorative stretching. |

The `accessibility-checklist.md` is the binding verification companion. Static component mapping is not runtime PASS.

## Shared Dependencies and Exit Conditions

1. Shell owner releases exact route metadata/navigation/permissions and integrated routes prove no duplicate shell.
2. `@erp/ui` owner confirms executable semantics for headers, tabs, tables, form errors, conflicts, partial-data notice, technical evidence, and responsive records.
3. Missing general-purpose behavior is added centrally and versioned before W4 consumes it; domains never fork it.
4. Provider/BFF contracts expose only admitted controls and typed states; UI evidence stays BLOCKED until integration tests pass.
5. Playwright and manual accessibility evidence covers every width, both themes, keyboard, zoom/reflow, and provider-state fixtures on the live isolated stack.

## Upstream Traceability

The shared shell and list/detail grammar refine the approved rough `wireframes.md` and `user-flow.md`. Module content and state matrices implement the approved `stories.md` and `requirements.md`. Branch, testing, deployment, and code-style boundaries follow `team-practices.md`. No mapping introduces an orphan behavior outside those inputs.

## Review

**Verdict: READY FOR PRODUCT REVIEW.** Shared-versus-domain ownership is explicit, all three page designs map to the one LinerCore system, and unsupported or unimplemented behavior remains BLOCKED.
