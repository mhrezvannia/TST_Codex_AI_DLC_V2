# Frontend Components - U06 Reference Data Frontend App and BFF

## Source Trace

This U06 frontend component design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

It refines the approved mockup direction: desktop-first admin workspace, tablet adaptive layout, mobile read-only lookup, WCAG 2.1 AA behavior, BFF route handlers, `@erp/ui`, `@erp/api-core`, `@erp/auth`, `@erp/transformers`, React Hook Form, Zod, TanStack Query, Zustand, and no direct browser-to-service calls.

## Route Structure

| Route | Purpose | Primary stories |
|---|---|---|
| `/` | Reference workspace overview and reference-set navigation. | US-005 |
| `/sets/[set]` | List, search, filter, pagination, read-only/action state. | US-005, US-006 |
| `/sets/[set]/new` | Create form for authorized users. | US-007 |
| `/sets/[set]/[id]` | Detail, audit metadata, event status, allowed actions. | US-006, US-011 |
| `/sets/[set]/[id]/edit` | Edit form for authorized users. | US-008 |
| `/sets/[set]/[id]/status` | Optional focused history/publication status view. | US-011, US-019 |
| `/access-denied` | App-specific denied state with request-access path. | US-003 |

Route protection uses `proxy.ts` and BFF/session checks from the approved frontend pattern.

## Component Hierarchy

```text
ReferenceDataAppShell
  -> ReferenceWorkspaceNav
  -> ReferenceSetHeader
  -> PermissionBanner
  -> ReferenceSetListPage
       -> SearchAndFilterBar
       -> ReferenceDataTable
       -> MobileReferenceCardList
       -> PaginationControls
       -> EmptyState
       -> ErrorState
  -> ReferenceDetailPage
       -> ReferenceFieldGroups
       -> RelationshipSummary
       -> AuditMetadataPanel
       -> PublicationStatusPanel
       -> ChangeHistoryTable
       -> RecordActionBar
  -> ReferenceFormPage
       -> ValidationSummary
       -> ReferenceFormFields
       -> RelationshipSelectorFields
       -> ConfirmStatusDialog
```

## Core Components

| Component | Responsibility | State/props |
|---|---|---|
| `ReferenceDataAppShell` | App frame, landmarks, skip link, user menu slot, responsive nav container. | Current route, session summary, nav items. |
| `ReferenceWorkspaceNav` | Navigate nine reference sets and expose active item programmatically. | ReferenceSetDescriptor list, active set. |
| `ReferenceSetHeader` | Page title, set description, status/action summary. | Set descriptor, permission state, counts. |
| `SearchAndFilterBar` | Search text, active/inactive filter, set-specific filters. | Query state, validation errors, loading state. |
| `ReferenceDataTable` | Desktop/tablet list with semantic table, caption, sortable headers. | Rows, columns, sort, row action callbacks. |
| `MobileReferenceCardList` | Mobile read-only result cards. | Summary rows, essential labels, detail links. |
| `ReferenceDetailPage` | Record detail composition. | ReferenceDetailView, permission state, status state. |
| `ReferenceFormPage` | Create/edit flow using RHF/Zod. | ReferenceFormDraft, descriptor, submit state. |
| `PublicationStatusPanel` | Event/outbox status and copy actions. | PublicationStatusView, refresh handler. |
| `ChangeHistoryTable` | Recent audit/change rows. | History entries, pagination if supplied. |
| `PermissionBanner` | Read-only or denied explanation. | PermissionState, requested action. |
| `ConfirmStatusDialog` | Deactivate/reactivate confirmation. | Record summary, action, reason field. |

## BFF Route Handlers

| Handler | Backend call | Notes |
|---|---|---|
| `GET /api/reference-sets` | Local metadata plus permission state. | Does not call backend for static descriptor-only data unless permissions are needed. |
| `GET /api/reference-sets/[set]/records` | `reference-data-service` list/search API. | Passes correlation id and filters. |
| `GET /api/reference-sets/[set]/records/[id]` | `reference-data-service` detail API. | May compose detail with status/history. |
| `POST /api/reference-sets/[set]/records` | Admin create API. | Requires create permission and maps validation errors. |
| `PUT /api/reference-sets/[set]/records/[id]` | Admin update API. | Requires update permission. |
| `POST /api/reference-sets/[set]/records/[id]/deactivate` | Status command API. | Requires deactivate permission and reason where required. |
| `POST /api/reference-sets/[set]/records/[id]/reactivate` | Status command API. | Requires reactivate permission. |
| `GET /api/reference-sets/[set]/records/[id]/history` | History/status API. | Non-blocking for main detail. |
| `GET /api/permissions/reference-data` | `identity-service` authorization/session API. | Used to render read-only/allowed state. |

## State Management

| State type | Tooling | Rule |
|---|---|---|
| Server state | TanStack Query | Lists, details, permissions, history, and status are cached by set/query/id. |
| Form state | React Hook Form | Drafts remain local until submit. |
| Validation | Zod plus service error mapping | Client shape validation and backend invariant errors both surface. |
| UI state | Zustand only for bounded app-shell state | Nav collapse, active panels, transient view preferences. |
| Session state | `@erp/auth` and BFF session | Browser never stores backend tokens. |

## Interaction States

| Area | Required states |
|---|---|
| Workspace/list | Loading, empty, populated, refreshing, validation error, service unavailable, read-only. |
| Detail | Loading, populated, not found, authorization denied, status unavailable, stale status. |
| Create/edit form | Draft, client invalid, submitting, server validation failed, conflict, success, authorization denied. |
| Status actions | Confirming, submitting, succeeded, failed, retryable error. |
| Event status | Pending, published, failed, retrying, stale, unknown. |

## Accessibility Requirements

- One page-level h1 per route and logical heading order.
- App shell uses `header`, `nav`, `main`, and supporting landmarks.
- Tables use captions, headers, keyboard-reachable rows/actions, and no color-only status.
- Forms use persistent labels, field errors, validation summary, and focus management on submit failure.
- Dialogs trap focus and return focus to the invoking control.
- Dynamic validation, status, and event freshness messages use polite live-region behavior.
- UI remains usable at 200 percent zoom and mobile widths.

## Responsive Behavior

Desktop: persistent side navigation, full table, detail/action panels, full create/edit forms.

Tablet: collapsible navigation, table remains available where width allows, detail can stack below list.

Mobile: read-only lookup cards and detail pages by default. Create/edit workflows are not required for mobile MVP unless later approved.

## Non-Goals

- No downstream runtime module screens.
- No direct database explorer.
- No browser-managed backend tokens.
- No custom component library outside approved `@erp/ui` and approved frontend stack.
