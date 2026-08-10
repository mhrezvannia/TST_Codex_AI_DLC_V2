# Frontend Components — booking-design-system-closure

## Design Basis

This frontend design implements the one Unit in `unit-of-work.md` and all mappings in `unit-of-work-story-map.md`. It traces to `requirements.md` and refines the application boundaries in `components.md`, callable seams in `component-methods.md`, and preserved HTTP/service flow in `services.md`. It applies the LinerCore master/session contract and the approved answers in `functional-design-questions.md`.

## Component Hierarchy

- Existing authenticated `ShellFrame`
  - Existing route metadata: active Booking path, breadcrumb, session, workflow context
  - Canonical Booking route boundary
    - `BookingListRoute`
      - compact page header and command bar
      - `BookingFilters`
      - `BookingListState`
        - shared Skeleton, EmptyState, StatusStrip/error/denied/degraded, or Table
    - `BookingCreateRoute`
      - grouped `BookingCreateForm`
      - reference lookup fields
      - validation/error summary and action status
    - `BookingDetailRoute`
      - identity/status/action header
      - summary facts and operational sections
      - `BookingLifecycleActions`
      - collapsed technical audit disclosure

The route content never renders another `ShellFrame`, navigation, theme provider, or local palette. Standalone `apps/booking` page entries become redirects; its API/BFF routes remain outside this presentation hierarchy.

## Route and Component Contracts

| Component | Inputs | Local state | Outputs/integration |
|---|---|---|---|
| BookingListRoute | URL query, session/cookies/correlation via server context | None beyond route boundary | `loadShellBookings`; maps result to BookingListState |
| BookingFilters | supported query values and result context | focused input/debounced draft only if current behavior requires | canonical URL query update |
| BookingListState | discriminated presentation result | retry pending | shared state primitives or Table; canonical links |
| BookingCreateForm | existing lookup/default data | values, dirty/touched, client/service errors, submitted snapshot, action state | same-origin create/validate/price/confirm calls |
| BookingDetailRoute | Booking ID and server result | section retry state only | `loadShellBooking`; lifecycle/detail composition |
| BookingLifecycleActions | Booking ID, returned status/validation/pricing context | one action state | existing validate/price/confirm same-origin routes |
| BookingFeedback | normalized safe outcome | none | labelled status/error summary, live announcement, retry |
| AuditDisclosure | existing safe audit facts | expanded/collapsed | secondary technical evidence; no raw secrets/payloads |

Shared primitives receive normal DOM props, labels, described-by relationships, and class names. Booking fields and lifecycle vocabulary do not move into `packages/ui`.

## List Interaction Design

- Initial/deferred load reserves the eventual table/header dimensions with shared Skeleton rows.
- Search/filter controls have persistent labels; applying them updates the supported canonical URL query.
- Populated state exposes result count, table headers, row identity/status, and keyboard-accessible detail links.
- The table wrapper owns horizontal scrolling below its minimum width; the page and shell do not overflow.
- Empty state explains the filter/data context and exposes a canonical create or clear-filter action.
- Error state names the failed surface and exposes retry without dropping filters.
- Denied state removes unavailable domain commands but retains the shared shell and a safe destination.
- Degraded state keeps reliable list data visible and identifies only the unavailable capability.

## Create and Lifecycle Interaction Design

The create page is one grouped form, not a wizard. Visual and keyboard order follow the existing business sequence. Each field retains its existing name, mapping, input type, and reference identity.

Submission behavior:

1. The primary command announces pending state and prevents a duplicate command.
2. Immediate client errors populate field associations and the summary.
3. Service validation errors replace only service-error state; valid values remain.
4. The summary receives programmatic focus after a failed submission, with links/focus paths to affected fields.
5. Successful create/validate/price responses replace the last returned Booking representation and expose only currently permitted next actions.
6. Successful confirmation announces completion and navigates to the canonical detail route.
7. Timeout/unknown confirmation never displays confirmed unless the returned/reloaded Booking establishes it.

All command labels are verbs with visible text. Icons, if useful, are Lucide and never replace the accessible label.

## Detail Interaction Design

The detail header presents Booking identity, readable status, permitted commands, and a safe list return. Summary facts precede lifecycle sections. Pricing shows currency, amount/line basis, and available source agreement/rate evidence. Async/downstream information may be labelled degraded without changing Booking confirmation truth. Correlation/event details stay in a collapsed Audit disclosure.

Section-level loading or failure does not blank the whole route when reliable primary Booking data exists.

## Validation and Error Mapping

| Source | UI mapping | Focus/retry rule |
|---|---|---|
| Missing/invalid immediate input | Field error plus summary | Focus summary, then linked first invalid field |
| Domain validation detail | Preserve service meaning; associate known field or use summary | Correct input before retry |
| 401/403 | Denied state | Safe canonical navigation; no blind retry |
| Timeout/5xx | Error/degraded state based on usable retained data | Retry only the failed operation |
| Reference/pricing unavailable | Scoped degraded/error status | Preserve values and unaffected commands |
| Unexpected programming error | Existing error boundary and durable failure evidence | No false recovery/success |

The action reducer exposes explicit `validationBlocked`, `recoverableError`,
`denied`, `degraded`, and `fatalError` branches in addition to idle, pending,
and success. Each branch consumes the retention/focus/announcement/retry contract
from `domain-entities.md`; components do not collapse denied or fatal outcomes into
a generic retry card.

Standalone redirect route tests pass a full Request and trusted canonical shell
origin. They verify status 308, the exact list allow-list
`page,pageSize,sort,direction,status,q`, detail-only `created=1`, create with no
query, invalid detail fallback to `/booking`, dropped `returnTo`/absolute/unknown
values, and a no-decision result for every `/api/**` path.

User-facing messages never expose tokens, raw internal endpoints, stack traces, or payloads.

## Test and Evidence Hooks

- Prefer role/name/label/text and focus relationships in component and Playwright assertions.
- Use stable `data-state` on state containers when the same accessible role represents multiple machine-observed variants.
- Add `data-testid` only for an interactive/evidence seam that semantic selection cannot uniquely identify; names are stable and domain-based.
- Do not encode viewport, theme, generated index, or transient Booking status into test IDs.
- Test helpers live outside production modules and cannot be imported by application code.

Required UI cases cover list/create/detail, loading, populated, empty, error/retry, denied, validation, pending, success, and degraded behavior; both themes; widths 375/768/1024/1440 as applicable; keyboard/focus/announcements; reduced motion; contained overflow; and visible primary actions.

## Shared Primitive Gap Policy

Before adding a primitive, prove the generic capability is absent from `@erp/ui`. A shared addition must:

- be domain-neutral and reusable;
- use existing tokens and theme behavior;
- forward semantic DOM props and refs where required;
- include keyboard, focus, reduced-motion, and both-theme tests appropriate to the primitive;
- avoid alternate palettes, remote fonts, spinners in place of Skeleton, decorative composition, or Booking-specific props.

Otherwise the behavior remains a Booking composition built from existing shared primitives and correct native semantics.

## Responsive and Theme Contract

At 375px controls reflow in reading order, primary commands remain visible, and the table scrolls only within its region. At 768px and 1024px grouped forms and detail facts use available width without clipped labels. At 1440px content remains dense and bounded rather than stretching into decorative whitespace. Typography uses the shared system stack, all colors resolve through `--erp-*`, focus uses the shared ring, and the selected theme comes only from the shell.
