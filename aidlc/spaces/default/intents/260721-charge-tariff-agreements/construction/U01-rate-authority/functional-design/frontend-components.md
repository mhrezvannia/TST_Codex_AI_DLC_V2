# Frontend Components — U01 Rate Authority

## UI Boundary and Routes

U01 owns these Charge domain pages:

- `/charge-agreements/rates`: unified searchable list.
- `/charge-agreements/rates/new`: create first Draft.
- `/charge-agreements/rates/[rateId]`: aggregate/version detail and history.
- `/charge-agreements/rates/[rateId]?mode=edit`: full-page edit state for the sole Draft.

The pages run inside the shared authenticated shell and use existing `@erp/ui` tokens/primitives. U01 does not add global navigation, typography, palette, shell chrome, or `packages/ui` exports. Stable `basePath`, route proxying, and common BFF/session plumbing integrate with U02; the page and domain compositions remain U01-owned. RTK is absent and prohibited for this slice, so state is server read + URL/query + focused form state.

## Component Hierarchy

```text
RatesPage (server)
  RatePageHeader
  ChargeDomainTabs
  RateFilterBar (client, URL state)
  RateResultsRegion
    RateTable | RateCompactList
    Pagination
  EmptyState | StatusStrip(error/retry) | ReadOnlyStatus

NewRatePage (server)
  RateFormShell
    RateForm (client)
      CategoryCodeFields
      ApplicabilityFields
      CommercialFields
      ValidityFields
      ErrorSummary
      FormCommands

RateDetailPage (server)
  RateIdentityHeader
  PermittedActions
  RateSummary
  VersionHistory
  RateAuditDisclosure
  ApprovalDialogController (client, conditional)

RateEditState (same detail route)
  RateForm prefilled with exact Draft + expectedRowVersion
  DirtyStateGuard
```

`loading.tsx`, `error.tsx`, and `not-found.tsx` use the existing routed primitives. DS-03 no-ribbon behavior remains dependent on the W2-02 shared route-metadata seam; U01 does not hide the ribbon locally.

## Page Contracts

### Unified list

The server reads canonical search parameters, requests real BFF/service data, and renders stable-size Skeleton content while the route is pending. The filter bar provides free text, category, lifecycle, `asOf`, origin, destination, equipment, and page size. Selecting LOCAL disables/clears destination visibly because destination is structurally invalid for that category.

The table displays category/code, applicability, unit rate/basis, effective window, selected summary version, lifecycle/derived state, and available authority at `asOf`. Lifecycle values are Draft, Scheduled, Effective, and Expired; “All” removes the parameter. Each filter searches the complete version history and renders one row per stable Rate. When an unfiltered Rate has both an effective Approved version and a Draft successor, the commercial summary shows the effective Approved version, a separate Draft indicator names the successor, and history still identifies the highest `latestVersion`. It has a real caption or labelled region, result count, stable column sizing, keyboard-reachable detail links, and non-color status text. At narrow widths it uses a labelled horizontal scroll region or semantic compact rows; the primary “Open rate” action remains reachable.

Filters update the URL and reset page to one. Browser back/forward restores the exact state. Rate detail links preserve a safe return query. Empty results distinguish “no rates exist” from “no rates match these filters.” Denied discloses no data; a reader-only user sees an explanatory status and no mutation command.

### Create and edit form

`RateForm` owns only transient form values, touched/errors, submit state, and dirty state. Props provide mode, initial values, exact IDs/version/rowVersion for edit, active reference options or loaders, and server-derived permission.

Field behavior:

- Category selects BASE, SURCHARGE, or LOCAL and fixes the compatible code OFR, BAF, or THC.
- Origin and equipment are always required.
- Destination is required for BASE/SURCHARGE; LOCAL removes the control and any stale value before submit.
- Basis is visible/read-only `PER_CONTAINER`.
- Currency is visible/read-only USD with reference evidence.
- Unit rate uses decimal input mode, string form state, on-blur scale/range validation, and never JavaScript arithmetic.
- Effective dates have persistent labels, inclusive-window hint, and linked errors.

Client validation improves feedback but the service remains authoritative. Failed 400/409/422/503 responses map to field and global errors, retain safe values, focus the error-summary container, and announce it with `role=alert`. Links in the summary focus fields. Save uses `Saving...`, disables duplicate submission, and on success announces the result before navigating to the committed detail. Cancel or route departure while dirty opens the existing focused confirmation composition.

### Detail, history, and edit query state

Detail leads with stable Rate ID, category/code, latest version/status, and permitted actions. Summary sections show applicability, amount/basis/currency, inclusive window, exact version/source, and evaluated `asOf`. Version history exposes every version without rewriting prior labels or values; selecting a version changes detail content through a stable URL/query or accessible tab/list pattern without changing the aggregate route.

`?mode=edit` is accepted only when the user may update the sole Draft. Otherwise the page renders read-only detail with a typed explanation or denied result. Save/cancel removes `mode` and preserves the return-list query.

### Approval dialog

The Approve command is present only for a valid Draft and server-derived capability. The dialog shows stable Rate, exact version, category/code, applicability, unit rate/basis/currency, window, and the immutable-history consequence. It disables duplicate approval and displays `Approving...`.

The existing shared Dialog does not prove Tab trapping or trigger restoration. U01 therefore wraps it in a Charge-local controller that stores the trigger, cycles Tab/Shift+Tab within enabled dialog controls, supports safe Escape, and restores trigger focus on close. This closes DS-01 for the Charge composition only and adds no shared export.

On 409 conflict, the dialog closes or remains safely actionable per response, the page refreshes current authority, focuses an alert, and preserves the operator's context. On success, a polite announcement updates the immutable detail without unexpected focus movement.

## API and BFF Integration

| Browser/BFF operation | Service operation | UI result |
|---|---|---|
| list with URL params | `GET /api/rates` | `RatePage` and echoed `evaluatedAsOf` |
| create form submit | `POST /api/rates` | committed Draft detail |
| detail/read history | `GET /api/rates/{rateId}` | aggregate/history/actions view |
| edit Draft | `PUT /api/rates/{rateId}` with exact version and expected row version | updated Draft or typed conflict |
| successor | `POST /api/rates/{rateId}/versions` | new sole Draft |
| approve | `POST /api/rates/{rateId}/versions/{versionId}/approve` | immutable Approved detail |
| reference lookup | existing Charge/reference BFF seam | labelled active options or accessible dependency state |

The BFF derives the signed-session subject, rejects actor fields, propagates/generates correlation, normalizes standard error envelopes, and performs explicit browser-page to service-page translation. U02 owns this BFF/session work; U01 owns service-side `charge-rates` resource/action enforcement and the fail-closed Identity adapter. U01 does not bypass the BFF with direct browser-to-service calls or replace it with advisory Server Actions.

## State Matrix

| State | List | Create/Edit | Detail/Approval |
|---|---|---|---|
| Loading | stable table/filter Skeleton | grouped form Skeleton | identity/history Skeleton |
| Empty | create action if permitted; filter-clear action when filtered | not applicable | 404 not-found boundary |
| Populated | real rows, result count, pagination | active labelled controls | summary, history, audit |
| Read-only | rows/detail; no mutation controls; explanation | route unavailable/read-only explanation | immutable/read-only actions absent |
| Denied | shared denied behavior, no data | same | same |
| Validation | recoverable invalid filter alert | linked field/global errors; values retained | lifecycle explanation |
| Pending | filter transition announced | `Saving...`, controls safely disabled | `Approving...`, duplicate blocked |
| Conflict | refreshed result with alert | values retained; stale/authority message | exact winner/overlap message; no partial state |
| Service error | scoped Retry preserving URL | Retry preserving values | Retry preserving selected version |
| Success | updated row and polite count/state update | committed detail + live announcement | immutable status + restored focus |
| Long content | labelled overflow/wrap | labels/errors wrap | IDs/audit wrap or disclosure-scroll |

## Accessibility and Responsive Contract

- One `h1`; ordered section headings; persistent form labels and associated hints/errors.
- Logical DOM/tab order, visible `--erp-focus-ring`, keyboard-reachable filters/table/actions, and polite result announcements.
- Status is never color-only. Money is readable amount plus USD; identifiers use the existing mono token only where useful.
- Approval/dirty dialogs trap focus, handle safe Escape, and restore their trigger through the Charge-local wrapper.
- DS-02 remains open: the current Combobox lacks active-descendant/async semantics. U01 surrounds it with Skeleton/StatusStrip and mounts only after options settle or uses an already-approved accessible alternative; it does not claim the shared gap passed.
- At 375px commands wrap, form fields become one column, evidence follows the primary task, and the table uses labelled overflow/compact records.
- At 768px evidence moves below primary content and form columns are used only when labels remain readable.
- At 1024/1440px the page may use a compact evidence rail without nested cards.
- Light/dark values come only from shared tokens. Reduced motion is respected. No page-level horizontal scroll is allowed.

## Test and Evidence Hooks

Stable semantic `data-testid` values cover filter controls, create/save/cancel, detail row links, successor, approve trigger/dialog/confirm/cancel, error summary, Retry, version selection, and labelled overflow region. Tests must prefer roles/names where sufficient and use test IDs only as stable automation hooks.

Component tests cover category-dependent destination behavior, decimal/date validation, value retention, error focus, pending duplicate prevention, URL serialization, server-derived action visibility, and dialog focus cycle/restore. U06 later supplies real Playwright evidence at all required widths/themes and on the isolated stack. U01 source/component tests do not claim DS-03, Docker, or release acceptance PASS.

## Skill Influence and Rejected Suggestions

The page-specific ui-ux-pro-max invocations reinforced URL-backed filtering, labelled responsive table overflow, persistent form labels, announced errors, visible focus, and route loading boundaries. Marketing gateway/hero composition, OLED default, new blue/amber palette, remote Fira/Lexend/Source Sans fonts, spinner-first loading, bulk editing, and new navigation were rejected because `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, and `design-system/linercore/pages/charge-and-agreements.md` are binding.

## Upstream Coverage

This component design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the refined interaction/accessibility artifacts. It implements only the U01 Charge pages and preserves the shared shell/UI ownership and Booking boundary defined upstream.
