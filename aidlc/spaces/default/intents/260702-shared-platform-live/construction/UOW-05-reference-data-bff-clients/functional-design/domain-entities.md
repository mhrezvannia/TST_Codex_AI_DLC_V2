# Domain Entities - UOW-05 Reference Data BFF Clients

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Entities

| Entity | Attributes | Lifecycle |
| --- | --- | --- |
| BffContext | session, correlationId, serviceBaseUrls | created per request |
| PermissionState | canRead, canWrite, reason, correlationId | loaded -> returned |
| ReferenceRecordView | id, set, code, displayName, status, version, eventStatus, correlationId | mapped from service -> returned |
| MutationDraft | set, code, displayName, status, reason, attributes, expectedVersion | received -> validated -> sent |
| BffError | status, code, message, correlationId, fieldIssues | mapped -> returned |

## Relationships

- BffContext is required for all service calls.
- MutationDraft maps to `ReferenceMutationCommand`.
- Service records map to UI view models.

