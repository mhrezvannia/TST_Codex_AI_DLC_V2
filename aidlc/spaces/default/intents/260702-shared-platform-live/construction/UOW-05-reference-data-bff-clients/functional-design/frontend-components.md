# Frontend Components - UOW-05 Reference Data BFF Clients

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Integration Components

| Component | Responsibility | State |
| --- | --- | --- |
| ReferenceDataProvider | Loads sets, permission state, selected records, and status via BFF routes. | loading, ready, error |
| BffErrorPresenter | Shows UI-safe BFF error states with correlation id. | hidden, validation, denied, unavailable |
| PublicationStatusLoader | Requests event status for selected record. | pending, published, retrying, failed, unavailable |

## Interaction Rules

- UI receives BFF URLs only.
- Loading preserves layout.
- Error presenters never expose tokens or raw stack traces.
- Correlation id is copyable or visible where support/debugging is expected.

