# Frontend Components - U03 Reference Domain and Provider/Admin APIs

## Source Trace

This U03 frontend/BFF integration design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U03 is a backend service unit. It does not implement `apps/reference-data`, but it defines the API and view-model capabilities that U06 consumes.

## Reference Set Descriptor Model

Purpose: Let `apps/reference-data` render navigation, labels, capabilities, and forms without duplicating backend ownership.

Fields:

| Field | Purpose |
|---|---|
| `setKey` | Stable set key such as `party-customer`, `location-port`, or `trade-lane`. |
| `displayName` | UI label. |
| `description` | Short set purpose. |
| `supportsCreate` | Whether create is enabled for current authorization/context. |
| `supportsUpdate` | Whether update is enabled. |
| `supportsDeactivate` | Whether deactivate/reactivate is enabled. |
| `defaultSort` | Stable sort for list views. |
| `searchFields` | Safe fields available for text search. |
| `classification` | Sensitivity hint for UI/audit display. |

## Reference Summary View Model

Purpose: Compact list/table/card payload for all nine reference sets.

Fields:

| Field | Purpose |
|---|---|
| `id` | Stable reference id. |
| `setKey` | Reference set key. |
| `code` | Business code. |
| `displayName` | Human-readable name. |
| `status` | Active/inactive. |
| `version` | Concurrency version. |
| `secondaryText` | Optional set-specific summary. |
| `updatedAt` | Last update timestamp. |

## Reference Detail View Model

Purpose: Detail payload used by U06 for detail/edit screens.

Fields:

| Field | Purpose |
|---|---|
| `summary` | Common `ReferenceSummary` fields. |
| `attributes` | Set-specific display attributes. |
| `relationships` | Safe linked records such as Country parent or Region pair. |
| `auditSummary` | Created/updated/status metadata safe for the caller. |
| `availableActions` | Create/update/deactivate/reactivate/read-only actions based on authorization. |
| `eventStatusHint` | Placeholder for U04/U06 event status display. |

## Validation Error Model

Purpose: Preserve draft values and render field-level errors in U06.

Fields:

| Field | Purpose |
|---|---|
| `field` | Field path or relationship path. |
| `code` | Machine-readable validation code. |
| `message` | User-readable message. |
| `severity` | Error or warning. |
| `correlationId` | Support trace id. |

## BFF Consumption Pattern

```text
apps/reference-data route
  -> BFF route handler checks session and calls identity-service where needed
  -> BFF calls reference-data-service provider/admin OpenAPI
  -> BFF maps DTOs through @erp/transformers
  -> UI renders table, detail, form, read-only, validation, or denied state
```

Browser JavaScript does not call `reference-data-service` directly.

## U06 Component Inputs Enabled by U03

| Future U06 component | U03 data needed |
|---|---|
| ReferenceSetNavigation | Reference set descriptors. |
| ReferenceRecordTable | Paged `ReferenceSummary` results. |
| ReferenceRecordDetail | `ReferenceDetail` payload and relationship labels. |
| ReferenceRecordForm | Set-specific editable fields and validation errors. |
| StatusBadge | Active/inactive status from every record. |
| ChangeHistoryPanel | Recent `ReferenceChange` entries. |
| ReadOnlyNotice | Available actions and authorization-denied mapping. |

## API Error States for UI

| API condition | UI implication |
|---|---|
| Validation error | Keep draft values and show field-level messages. |
| Duplicate key | Show code/business-key conflict near code field. |
| Stale version | Prompt refresh/reload before edit retry. |
| Authorization denied | Show read-only or access-denied state. |
| Not found | Show missing/deleted/inactive-aware detail state. |
| Dependency unavailable | Show retry/support message with correlation id. |

## Validation Rules

- UI-facing DTOs must expose stable ids and business codes but no internal database keys.
- Sensitive Party/Customer fields must be classified so U06 can avoid overexposure.
- API responses must provide enough relationship labels to avoid UI-side database joins.
- Available actions are hints for UX; backend authorization remains authoritative.
- U03 must not implement React components, app routes, or BFF handlers.

## Out of Scope

- U06 screen/component implementation.
- U04 event publication status implementation beyond placeholder hints.
- U09 seed data values.
- Charge, Booking, or Container Movement screens or consumer replicas.
