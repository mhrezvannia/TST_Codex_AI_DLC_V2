# Domain Entities - U05 REST API and OpenAPI

## DTOs

| DTO | Fields |
| --- | --- |
| `AgreementRequest` | Header fields and terms. |
| `AgreementResponse` | Header, status, version, terms, activity. |
| `AgreementSummaryResponse` | List row fields. |
| `AgreementSearchResponse` | Items and pagination. |
| `StatusActionRequest` | Reason/comment and actor context where local mode requires it. |
| `ActiveLookupResponse` | `matched`, agreement, terms, no-match reason. |
| `ApiErrorResponse` | `code`, `message`, `fields`, `correlationId`. |

## OpenAPI Tags

| Tag | Endpoints |
| --- | --- |
| Agreements | CRUD/search/detail. |
| Agreement Lifecycle | Approve, suspend, expire. |
| Agreement Lookup | Active lookup for Booking. |

## Mapping

DTOs are separate from domain aggregates and persistence entities. Mapping happens in the container/API adapter.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.