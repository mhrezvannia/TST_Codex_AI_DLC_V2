# Frontend Components - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment and UI Authority

This UI design implements U04 in `unit-of-work.md`, its US-011 through US-014 allocation in `unit-of-work-story-map.md`, and `requirements.md`, refining `components.md`, `component-methods.md`, and `services.md`. Authority order is approved W4 scope and requirements, the security and accessibility contract, LinerCore MASTER and executable `@erp/ui`, the `container-movement.md` page contract, then advisory UI/UX Pro Max output.

The advisory input contributes shape-stable skeletons, visible focus, persistent labels, announced errors, and reduced motion; those are retained. Its marketing composition, replacement palette and fonts, charts and KPI walls, spinner-only loading, generic bulk actions, and local Drawer/shell/theme framework are rejected. U04 is a greenfield app inside a brownfield platform: being new is never a licence to fork the shell or any shared primitive.

## Ownership and Canonical Component Tree

```text
ContainerMovementRootLayout
  PlatformShell                          [W2-02; exactly one instance, from first implementation]
    RouteStateBoundary
      RecentJourneysPage                 [US-011 bounded limit only]
        RecentJourneyTable               [>=1024]
        RecentJourneyRecordList          [375/390 semantic records]
      JourneyDetailPage                  [US-012]
        JourneySummaryPanel
        MovementTimelineList             [provider-owned timelineV1, rendered verbatim]
        LinkedBookingRegion              [exact /booking/[bookingId]]
        CaptureMovementSection           [US-013; renders only when both gates open]
          CaptureMovementForm
```

Owned by `apps/shell`, not by this app:

```text
apps/shell/app/booking/[bookingId]/page.tsx
  BookingJourneyRelationshipRegion       [US-014; adapter beside the canonical Booking page]
```

`ContainerMovementRootLayout` is the only shell placement in the new app. Route, loading, denied, not-found, error, and form components render domain composition only. No local fallback shell, rail, navigation, theme, typography system, Drawer framework, or shared-component copy exists anywhere in the tree.

## Route Components

| Route | Server responsibility | Focused client responsibility |
| --- | --- | --- |
| `/container-movement` | Policy, strict `limit` parse, server-derived actor, provider recent read, label resolution, typed state | Limit selection, retry, return focus |
| `/container-movement/journeys/[journeyId]` | Policy, one atomic v2 detail read carrying Summary and `timelineV1`, independently resolved Booking link and location options, capture-gate evaluation, attempt-token issuance | Capture draft, validation display, submit and dirty protection, per-region Retry, focus restoration |
| `/api/health` (internal) | Base-path-aware container health only | None; authorizes no domain read |
| `/booking/[bookingId]` (shell-owned) | Booking policy, authorized exact-`bookingId` CMM lookup, origin-token issuance | Relationship link navigation and focus |

Server components own authenticated context, exact capabilities, assertion and attempt-token issuance, provider results, and safe navigation. Client components own only draft edits, dirty and pending flags, local field feedback, announcements, and focus restoration. No CMM legacy redirect route exists.

## Recent List Composition

`RecentJourneysPage` renders a single bounded `limit` control offering 25, 50, and 100, defaulting to 25. There is no search box, filter, sort control, cursor, page control, actor selector, or bulk action — not even as a disabled placeholder. Changing the limit reauthorizes and refetches.

Columns are container, Booking, status, and freshness, plus the latest accepted event **only if** the provider's public ordering for that field is confirmed; absent that confirmation the column is omitted rather than derived. Result copy reports the provider's `returned` count; no total is shown. Unresolved location labels render safe raw authorized IDs with `Label unavailable`.

States are distinct compositions: loading (shape-stable Skeleton, no false data, no focus steal), true empty (`No recent Journeys returned`, no create call to action), populated, denied, provider error, degraded, and stale with source and time. Filtered empty is not offered, because no admitted control can produce it.

## Detail Composition and Region Independence

`JourneyDetailPage` renders an exact identity header with Journey, container, and Booking identity, revision, provider status, freshness, dependency, and capture availability, showing only supplied timestamps.

Failure containment follows the declared seams:

| Region | Content | Source seam | Failure behaviour |
| --- | --- | --- | --- |
| `JourneySummaryPanel` | Journey/container/Booking identity, revision, status, freshness evidence | one atomic v2 `getJourney` | Summary failure is the only failure that can empty the record |
| `MovementTimelineList` | Provider-computed `timelineV1` rendered verbatim in provider order | same `getJourney` payload | Shares Summary's result; no independent timeline failure state is claimed |
| `LinkedBookingRegion` | Native `/booking/[bookingId]` link from the verified provider ID | the Journey's own `bookingId`, target authorized independently | Absent ID renders a provider contract failure; a denied target renders the shared denied state |
| `CaptureMovementSection` | Capture form, or the specific reason it is unavailable | two independent gates | Each gate reports its own reason; they are never merged |
| Location labels | Readable labels for expected and actual locations | `CmmReferenceLocationsPort` with `usage: "label"` | Degrades to raw authorized ID with `Label unavailable`; scoped Retry |

`MovementTimelineList` is a presentation of provider truth. It performs no merge, deduplication, next-move calculation, lateness inference, or expected-versus-actual matching. Recorded items show actual location, occurrence, event ID, and correlation; planned items show expected location and sequence only. Repeated legacy records render as separate entries; unsupported legacy types render as `OTHER` from the producer allow-list and never appear as next-move truth. `receivedAt` and `source` are rendered neither as values nor as labelled unavailable values, because the provider does not own them.

## Capture Composition and Interaction

`CaptureMovementSection` renders the form only when both gates are open: the current-request capture capability is allowed **and** provider `captureEnabled` is true; and canonical active-location validation is available. If the first gate is closed, the provider's `captureDisabledReason` is shown. If the second is closed, its own precise reason is shown. Both closed shows both reasons — they are never collapsed into one generic disabled state.

`CaptureMovementForm` accepts exactly three inputs: canonical `eventCode` from {GTOT, LOAD, DISC, GTIN}, a canonical active `locationId` from the bounded port, and `occurredAt`. Container identity renders read-only. Actor subject, capability, idempotency key, correlation ID, source, classifier, publication status, correction, and Journey creation are never fields.

Interaction: open detail → server authorizes read then capture and issues the attempt token → focus `h1` → edit transient draft → validate on blur where useful → submit validates all → focus first issue or set pending and block duplicate activation → BFF verifies the token, forwards the embedded idempotency key, and issues the bound assertion → map exactly one terminal disposition → authoritative re-read before any confirmed success.

No status badge, timeline entry, or next-move expectation changes anywhere in the client before that re-read completes.

## Outcome-to-Component Mapping

| Result / state | Composition | Focus / announcement | Preserved context |
| --- | --- | --- | --- |
| Loading | Shape-stable page, table, header, and panel Skeletons | Busy label; routine load does not steal focus | URL and route |
| Validation | Error summary plus linked field messages | Alert summary, then first invalid field | Full draft; replacement attempt token |
| Pending | Only the initiating command disabled | One polite pending update | Draft and Cancel when safe |
| Accepted / confirmed | Authoritative detail and timeline from re-read | Success polite; detail heading focus | Return context and focus |
| Accepted / unconfirmed | StatusStrip with stable reference and Re-read | Attention status; strip heading focus | Draft snapshot and Journey identity |
| Duplicate | ConflictStrip naming the already-recorded movement from authoritative truth | Conflict heading focus | Draft, event evidence, return context |
| Out of sequence | ConflictStrip with current lifecycle and required next move | Conflict heading focus | Draft, provider code, return context |
| Denied | Concise explanation; capture command absent | Explanation associated with the capture region | Provider read truth |
| Not found | Route-owned not-found and recovery | Not-found heading focus | Canonical recent-list target |
| Known unavailable | FailureState or StatusStrip plus Retry | Error summary focus | Draft, field focus, correlation |
| Unknown outcome | UncertainOutcomeStrip plus Re-read; no Retry command yet | Assertive once; strip focus | Submitted snapshot, retained attempt token, reference |
| Unexpected | Safe FailureState plus reference | Error summary focus | Draft and safe navigation |
| Stale | Source and time StatusStrip; capture disabled | Stale status announced | Trustworthy provider value |
| Booking link absent | `Journey not created` / provider contract failure text | Region heading reachable in order | Record unchanged |
| Booking link degraded | Region-scoped FailureState with exact Retry | Region heading focus on Retry | Record, timeline, return context |
| Label unavailable | Raw authorized ID plus `Label unavailable` | No announcement; inline evidence | Row and record intact |

Publication and Booking-application status appear in **no** row of this table: absent an approved public contract, they are not rendered at all, and no roll-up status is derived across the four event truths.

## Booking Relationship Region (shell-owned)

`BookingJourneyRelationshipRegion` lives beside the canonical Booking page and renders four distinct outcomes: `present` renders a native `/container-movement/journeys/[journeyId]` link built from the returned provider ID with validated Booking origin context; `not-created` renders `Journey not created`; `denied` renders no Journey data; `unavailable` renders a scoped FailureState with Retry that preserves the Booking page. The browser never guesses from container identity, projection label, or stale client state. Returning from CMM restores the invoking Booking relationship link when the origin context is valid; a missing, invalid, or expired token falls back to the target canonical root.

## Dirty Navigation and Browser History

Native Back and same-module links remain usable. When the capture form is dirty, a concise shared `Dialog` names the unsaved task and offers Stay or Discard and leave. Focus is trapped, Escape returns to the trigger when safe, and cancelling navigation leaves route and draft unchanged. Confirmed capture navigation does not trigger dirty confirmation because the authoritative provider result has replaced the draft.

## Responsive Composition

- 375 / 390: semantic Journey records instead of a squeezed table; single-column detail; timeline as a vertical semantic list; one-column capture form; primary identity, status, and action visible; full-width error summary; actions in logical DOM order.
- 768: labelled keyboard-reachable inner table overflow; timeline and Booking region stack below primary content.
- 1024: compact recent table; bounded two-column detail with timeline primary and evidence beside but after it in DOM order.
- 1440: the same hierarchy at bounded readable width; no stretched fields and no empty card grid.

All five widths, light and dark themes, 200% and 400% zoom, long container and Journey identifiers, and the absence of page-level horizontal overflow require observed evidence. Intentional table overflow is labelled and keyboard reachable.

## Accessibility Contract

One `h1`, ordered headings, shell skip and main landmarks, native links and buttons, persistent labels, `aria-describedby` issue links, summary-to-field anchors, logical tab order, visible shared focus ring, non-color status meaning, minimum target sizes, honoured reduced motion, and bounded live regions are mandatory. The movement timeline is a semantic ordered list whose disposition and validation meaning are conveyed in text, never by color or icon alone. Validation, duplicate, out-of-sequence, and unknown outcomes receive immediate attention; result counts and success use polite announcements. The dirty dialog traps and restores focus. Status never relies on a Toast alone; inline context remains after the announcement.

## Shared Primitive and Ownership Matrix

| Surface | Shared owner / source | CMM composition | Required states | Design status |
| --- | --- | --- | --- | --- |
| Shell, navigation, theme, session | W2-02 `PlatformShell` and registry | Active module, breadcrumbs, children | denied, read-only | BLOCKED until the shared release and integrated live evidence |
| Recent list | `@erp/ui` TableContainer, Table, StatusBadge, Skeleton, EmptyState | Journey columns and domain copy | full read matrix | BLOCKED until implementation and live evidence |
| Detail and timeline | `@erp/ui` RecordHeader, DefinitionList, StatusStrip, PartialDataNotice | Semantic ordered timeline and evidence | populated, degraded, stale | BLOCKED until v2 contract and live evidence |
| Capture form | `@erp/ui` Field, Input, Select, Combobox, Button | Canonical event and location choices (`CmmReferenceLocationsPort` with `usage: "capture"`), occurrence | dirty, validation, pending, disabled-with-reason | BLOCKED until Identity capability registration and producer/consumer sign-off plus contract tests for the location port |
| Conflict and recovery | shared ConflictStrip, StatusStrip, FailureState, Dialog | Duplicate, out-of-sequence, unknown-outcome recovery | conflict, unknown, unavailable | BLOCKED if shared behaviour missing; no local general fork |
| Audit evidence | shared Disclosure and TechnicalDetails | Safe correlation and event reference | collapsed, access-appropriate | BLOCKED until live accessibility proof |

No row is PASS merely because a component is named. A missing platform primitive routes to W2-02; CMM may use semantic HTML with existing shared tokens for narrow domain composition only where that does not recreate a general primitive.

## Component Verification and Traceability

| Outcome | Requirements / stories | Component evidence |
| --- | --- | --- |
| Canonical CMM entry | US-011; FR-001, FR-002, FR-018, FR-022 | New app with base path, shared shell from first render, direct refresh and assets, health, 200 root, no invented redirect |
| Recent list without simulation | US-011; FR-009, FR-010 | Bounded limit only, no search/sort/page/actor control, `returned` copy, empty copy without create |
| Detail and provider timeline | US-012; FR-007, FR-011 | Verbatim `timelineV1`, retained legacy entries, absent `receivedAt`/`source`, no client merge or next-move |
| Exact Booking navigation | US-012, US-014; FR-014, FR-015, FR-016 | Both directions, four relationship outcomes, signed bounded origin, invalid-origin fallback |
| Capture without optimism | US-013; FR-008, FR-012, FR-013 | Two independent gates, attempt token, duplicate-submit block, authoritative re-read |
| Outcome matrix | US-013; FR-011, FR-013; NFR-005 | Every disposition composition, duplicate and out-of-sequence distinct, retained context and focus |
| Event-truth separation | US-013; FR-008; NFR-010, NFR-011 | No published or applied labelling without evidence; no derived roll-up status |
| Degradation and recovery | US-012, US-013; FR-019, FR-020, FR-021 | Region-scoped FailureState, stale source and time, raw-ID label fallback, disabled unsafe capture |
| Shared grammar | US-011-US-014; FR-022; NFR-002, NFR-003, NFR-009 | One shell, shared primitives and tokens, responsive and accessibility matrix, no fork |
| U04 live acceptance | NFR-001, NFR-004, NFR-005, NFR-010, NFR-011, NFR-012 | Real Identity, CMM v2, Reference, Compose stack, warmed route and BFF sample, spoof rejection, both audits |
| Intent-exit verdict | NFR-006, NFR-007, NFR-008 | Combined manager-guard, coverage, security, and audit evidence |

Component and route tests must cover every state, duplicate submission, URL persistence, safe return, dirty navigation, and focus. Integrated Playwright must exercise real recent, detail, timeline, capture, conflict, outage, and relationship paths at 375, 390, 768, 1024, and 1440 CSS pixels in both themes with keyboard, screen-reader, reduced-motion, zoom and reflow, and no page-level overflow. The warmed ten-user route and BFF sample and the final live and audit gates remain required; source review, mockups, screenshots, and container startup alone are never PASS. U04 and the intent remain not done while the listener poison, bounded-retry, DLQ, and replay exit is open.
