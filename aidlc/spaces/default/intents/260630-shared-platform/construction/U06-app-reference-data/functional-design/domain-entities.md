# Domain Entities - U06 Reference Data Frontend App and BFF

## Source Trace

These U06 frontend and BFF entities are derived from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U06 does not own the backend reference aggregates. It owns frontend view models, route command/query models, form descriptors, authorization display state, and status/history presentation models.

## ReferenceSetDescriptor

Purpose: Metadata that lets one workspace pattern render all nine reference sets without losing set-specific behavior.

Attributes:

| Attribute | Description |
|---|---|
| `setKey` | Stable key for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, or TradeLane. |
| `displayName` | User-facing set name. |
| `routeSegment` | App Router route segment. |
| `listColumns` | Columns for desktop table and mobile cards. |
| `searchFields` | Searchable fields supported by the backend contract. |
| `filterFields` | Status and set-specific filters. |
| `formSchemaKey` | Zod schema/form descriptor key. |
| `relationshipRules` | UI-level relationship hints, such as Country before Port. |
| `sensitivity` | Public, Confidential, or Restricted cue for display behavior. |

Relationships:

- Drives ReferenceListView, ReferenceDetailView, and ReferenceFormDraft.
- Maps to provider/admin APIs in `component-methods.md`.

## ReferenceListQuery

Purpose: BFF query model for list/search/filter requests.

Attributes:

| Attribute | Description |
|---|---|
| `setKey` | Selected reference set. |
| `searchText` | Optional search string. |
| `statusFilter` | Active, inactive, or all. |
| `page` | Page number or cursor. |
| `pageSize` | Requested page size within allowed bounds. |
| `sort` | Stable sort field and direction. |
| `correlationId` | Request correlation id. |

Lifecycle:

```text
created by UI -> validated by BFF -> sent to reference-data-service -> mapped to ReferenceListView
```

## ReferenceListView

Purpose: Renderable list state for one reference set.

Attributes:

| Attribute | Description |
|---|---|
| `setDescriptor` | ReferenceSetDescriptor used by the view. |
| `records` | Current page of ReferenceSummaryView rows. |
| `pagination` | Page metadata. |
| `activeFilters` | Filters currently applied. |
| `permissionState` | Read/write capability flags. |
| `state` | Loading, empty, populated, error, or refreshing. |
| `message` | Empty/error/read-only message. |

## ReferenceSummaryView

Purpose: Compact row/card model for a reference record.

Attributes:

| Attribute | Description |
|---|---|
| `platformId` | Stable platform id. |
| `businessKey` | Set-specific natural key. |
| `displayLabel` | Main display value. |
| `status` | Active or inactive. |
| `relationshipSummary` | Parent/related record labels where applicable. |
| `eventStatus` | Optional latest publication status. |
| `updatedAt` | Last update timestamp. |

## ReferenceDetailView

Purpose: Full display model for record detail.

Attributes:

| Attribute | Description |
|---|---|
| `summary` | ReferenceSummaryView. |
| `fieldGroups` | Display groups for identifiers, business fields, relationships, and metadata. |
| `auditMetadata` | Created/updated/status-change metadata. |
| `history` | Recent ReferenceChangeHistoryEntry values. |
| `publicationStatus` | Latest PublicationStatusView. |
| `permissionState` | Allowed actions for this record. |
| `classificationNotice` | Sensitive-data cue where required. |

## ReferenceFormDraft

Purpose: Frontend form state for create/edit workflows.

Attributes:

| Attribute | Description |
|---|---|
| `mode` | Create or edit. |
| `setKey` | Reference set being edited. |
| `recordId` | Existing record id for edit. |
| `values` | Current RHF draft values. |
| `clientValidation` | Zod validation result. |
| `serverErrors` | Mapped service validation errors. |
| `dirtyFields` | Changed fields. |
| `submissionState` | Idle, validating, submitting, succeeded, or failed. |

Relationships:

- Built from ReferenceSetDescriptor.
- Submitted through BFF command routes.
- Maps service errors into ValidationErrorView.

## PermissionState

Purpose: Effective UI permissions for the current user and workflow.

Attributes:

| Attribute | Description |
|---|---|
| `canRead` | User may view set/list/detail. |
| `canCreate` | User may create records. |
| `canUpdate` | User may edit records. |
| `canDeactivate` | User may deactivate records. |
| `canReactivate` | User may reactivate records. |
| `denialReason` | Safe text explaining missing permission. |
| `requestAccessAvailable` | Whether request-access path is available. |

## PublicationStatusView

Purpose: UI model for event/outbox publication status.

Attributes:

| Attribute | Description |
|---|---|
| `status` | Pending, published, failed, retrying, stale, or unknown. |
| `eventId` | Event id where available. |
| `correlationId` | Correlation id where available. |
| `eventType` | `referencedata.<entity>.changed` where available. |
| `schemaVersion` | Event schema version. |
| `updatedAt` | Status update timestamp. |
| `message` | Human-readable status detail. |

## ReferenceChangeHistoryEntry

Purpose: Recent audit/history row shown in detail screens.

Attributes:

| Attribute | Description |
|---|---|
| `changedAt` | Change timestamp. |
| `actor` | User or system actor display. |
| `operation` | Created, updated, deactivated, reactivated, or publication status update. |
| `summary` | Before/after or concise change summary. |
| `eventId` | Related event id where available. |
| `correlationId` | Related correlation id. |

## BffRequestContext

Purpose: Server-side context shared by BFF route handlers.

Attributes:

| Attribute | Description |
|---|---|
| `session` | Approved app session. |
| `userId` | Current user id. |
| `permissions` | Effective permissions from identity-service or approved claims. |
| `correlationId` | Request correlation id. |
| `serviceClients` | Reference-data and identity service clients from `@erp/api-core`. |

## Entity Interaction Pattern

```text
ReferenceWorkspaceShell
  uses ReferenceSetDescriptor[]
  creates ReferenceListQuery
  renders ReferenceListView
  opens ReferenceDetailView
  edits ReferenceFormDraft

BFF route handler
  builds BffRequestContext
  checks PermissionState
  calls reference-data-service or identity-service
  maps service DTOs/errors into frontend view models
```

## Non-Owned Entities

Backend reference aggregates, authorization aggregates, outbox records, Avro event payloads, and actual role-permission policy remain owned by U02, U03, U04, and U07.
