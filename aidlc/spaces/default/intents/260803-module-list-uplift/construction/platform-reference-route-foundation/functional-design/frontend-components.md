# Frontend Components - U01 Platform/Reference Route Foundation

## Source Alignment and UI Authority

This UI design implements U01 `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Binding precedence is W4 scope/security/accessibility, LinerCore MASTER, Reference page contract, approved mockups, then advisory ui-ux-pro-max. It adopts dense master/detail, responsive table handling, visible focus and announced errors; it rejects the advisory marketing gateway, colors/fonts, spinners and generic client authority.

## Ownership and Component Tree

```text
ReferenceRootLayout (domain composition; exactly one shell instance)
  PlatformShell (W2-02 shared owner; never repeated by a route)
    RouteStateBoundary
      ReferenceSetListPage
        PageHeader + ResultSummary
        SetList / shared Table-or-semantic-record composition
        EmptyState | StatusStrip | Retry
      ReferenceRecordListPage
        Breadcrumbs + PageHeader
        RecordListControls
        RecordList / shared Table-or-semantic-record composition
        Pagination + ReturnFocusRestorer
      ReferenceRecordDetailPage
        ReturnToResults
        PageHeader + Badge
        RecordDetailSummary
        Tabs/sections for readable Attributes/History available to thin proof
        AuditDisclosure
```

`PlatformShell`, navigation, tokens, skip link, theme root and general primitives are imported from the W2-02 release. Feature-local components contain Reference vocabulary, query bindings and view-model presentation only.

Every route page begins at `RouteStateBoundary` inside the root layout's single shell. Route-level, error-state and fallback shell instances are forbidden.

## Server and Client Boundaries

| Component | Rendering/authority | Inputs | State/actions |
| --- | --- | --- | --- |
| Root layout | Server | session, active module, visible registry, children | Authenticate; no local shell state |
| Route state boundary | Server | `ReadResult<T>` | Exhaustive state selection |
| Set/list/detail pages | Server | approved view models and safe context | Provider-backed render |
| Record list controls | Focused client | normalized includeInactive/page/size | Navigate to validated URL only |
| Pagination | Focused client/link | provider page metadata | Previous/next URL navigation |
| Retry | Focused client/button | current safe URL | Refresh/revalidate; announce status |
| Tabs/disclosure | Focused client where required | labelled sections | Local presentation state only |
| Return focus restorer | Focused client enhancement | allow-listed focus target | Focus row or result heading after render |

No browser store/local storage carries records, permissions, actor identity or authoritative query state. No client search/sort exists.

## Props and State Contracts

- Page components receive discriminated read outcomes or already-authorized view models, never raw provider payload.
- Row components receive stable route identity, readable label/status/version and canonical href.
- Controls receive normalized supported values and an allow-list; unknown input cannot become component state.
- Error/status components receive safe message, retryability and optional correlation reference; technical evidence is separate/collapsed.
- Shared primitives receive LinerCore token variants; domain code introduces no colors, typography or radius system.

## Interaction Flows

### List to detail and return

Activate native row link -> full canonical detail read -> activate Back to results -> server validates return context -> list reads authoritative provider page -> focus enhancer targets invoking row or result heading. Browser Back remains functional because URL carries state.

### Filter and pagination

Change `includeInactive` or page size -> navigate to normalized URL, resetting page when required -> server reauthorizes/revalidates/refetches -> polite result-count announcement. Previous/Next are native links disabled only from provider page evidence.

### Retry

Retry preserves the safe canonical URL, focuses/status-announces progress, starts a new server request and replaces the state only with its typed result. It does not replay mutations or surface cached authorization.

## State Components

| State | Shared/domain composition | Focus/announcement |
| --- | --- | --- |
| Loading | Stable-size shared Skeleton matching table/detail geometry | Busy region labelled; no blank spinner page |
| True empty | Shared EmptyState with domain explanation | Heading/summary announced |
| Filtered empty | Only when a real supported filter applies | Retain controls; announce zero results |
| Populated | Native links in Table/semantic records | Result count polite; row focus supported |
| Invalid query | Supported-controls state; no provider data | Focus issue summary/canonical link |
| Denied | Shared denied state without domain data | Main heading focus; no Retry to bypass policy |
| Not found | Route-owned not-found | Canonical list link |
| Stale | StatusStrip with source/time; actions absent | Announce last-known status |
| Unavailable | Identity or provider safe error/reference and safe Retry when classified; Identity maps to HTTP 503 with zero provider calls | Error announced; focus main/error summary; Retry focus stable |

## Responsive Composition

- 375/390: semantic record rows, stacked supported controls, visible primary identity/status/link, single-column detail.
- 768: true table may use a labelled keyboard-reachable inner overflow region; detail/evidence rail stacks after primary content.
- 1024/1440: compact table and bounded detail/evidence composition.
- Both themes plus 200%/400% zoom/reflow have no page-level horizontal overflow. Intentional inner table overflow is labelled and keyboard accessible.

## Accessibility Contract

One h1, ordered headings, shell skip/main landmarks, native links/buttons, persistent control labels, real table caption/headers, non-color status, shared visible focus ring, logical order, polite result/loading updates, alert/error association, reduced motion, and trigger focus restoration are mandatory. Reference Data never displays the workflow ribbon.

## Shared Primitive Mapping and Gaps

| Need | Shared source | Domain responsibility | Status before live proof |
| --- | --- | --- | --- |
| Shell/nav/theme/skip | `PlatformShell`/registry | active module and breadcrumbs | BLOCKED until published/integrated |
| Layout/status/loading | Stack/Inline/Panel/Badge/StatusStrip/Skeleton/EmptyState | Reference labels/view models | BLOCKED until live evidence |
| Records | Table or approved responsive record pattern | columns/row links | BLOCKED until viewport/a11y evidence |
| Controls | Checkbox/Select/Button | supported URL mapping | BLOCKED until provider/route tests |
| Disclosure | Tabs/Disclosure primitive | Attributes/History/audit labels | BLOCKED if missing; no local general fork |

## Acceptance Evidence

Component and route tests cover every state, query/return validation, no data flash and focus. Integrated Playwright covers permitted/denied/direct/list-detail-return/error paths at 375/390/768/1024/1440 in both themes, keyboard/screen-reader/reduced motion and zoom. Live Compose, performance samples, demo guards, `aidlc-audit` and `erp-fidelity-audit` are required; design/source checks remain BLOCKED evidence, not PASS.
