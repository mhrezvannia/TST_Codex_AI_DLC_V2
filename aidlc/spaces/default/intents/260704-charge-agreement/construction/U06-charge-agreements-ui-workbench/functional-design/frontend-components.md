# Frontend Components - U06 Charge Agreements UI Workbench

## Component Tree

| Component | Responsibility |
| --- | --- |
| `ChargeAgreementWorkbench` | Owns page state and coordinates panels. |
| `AgreementFilters` | Customer/status/lane/date filters. |
| `AgreementTable` | Search results and selection. |
| `AgreementDetail` | Header, terms, activity, and status actions. |
| `AgreementEditor` | Create/edit form. |
| `ChargeTermRows` | Dynamic term row editing. |
| `ValidationSummary` | Focusable error summary. |
| `ActiveLookupPreview` | Booking lookup form and result. |
| `RuntimeStatusBanner` | Backend/auth/reference status. |

## API Integration

Use `apps/charge-agreements/lib/service-clients.ts` for BFF calls and `apps/charge-agreements/lib/charge-agreements.ts` for view models and fallback fixtures.

## Interaction Constraints

Buttons use existing icon/component conventions where available. Layout uses stable panel dimensions so loading/error/status text cannot resize the workbench unexpectedly.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.