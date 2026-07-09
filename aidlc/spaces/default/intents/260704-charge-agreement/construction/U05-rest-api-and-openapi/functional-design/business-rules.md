# Business Rules - U05 REST API and OpenAPI

## API Rules

| ID | Rule | Source |
| --- | --- | --- |
| U05-R1 | Validation failures return 400 with field-level details when available. | `requirements.md` FR-3.5 |
| U05-R2 | Active lookup no-match returns 200 with `matched=false`. | `requirements.md` FR-4.3 |
| U05-R3 | Status actions are command endpoints and record actor/timestamp through U03. | `requirements.md` NFR-5 |
| U05-R4 | API must not expose reference-data mutation endpoints. | `requirements.md` FR-5.3 |
| U05-R5 | Contract must be usable by future Booking without database coupling. | `services.md` |

## Error Model

| Category | HTTP | Payload fields |
| --- | --- | --- |
| Validation | 400 | `code`, `message`, `fields`, `correlationId` |
| Forbidden | 403 | `code`, `message`, `correlationId` |
| Not found | 404 | `code`, `message`, `correlationId` |
| Conflict | 409 | `code`, `message`, `correlationId` |
| Upstream unavailable | 503 | `code`, `message`, `correlationId` |

## Security Rules

Do not trust browser-provided actor blindly outside local bypass; the authorization adapter must supply or validate effective identity when hardened.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.