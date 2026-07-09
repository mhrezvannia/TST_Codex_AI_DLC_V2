# Business Rules - U09 Booking Handoff Contract

## Contract Rules

| ID | Rule | Source |
| --- | --- | --- |
| U09-R1 | Booking consumes active lookup through REST, not direct database access. | `services.md` |
| U09-R2 | No-match is a deterministic business result. | `requirements.md` FR-4.3 |
| U09-R3 | Draft, Suspended, and Expired agreements are excluded. | `requirements.md` FR-4.2 |
| U09-R4 | Customer Booking must not start before verified active lookup exists. | `project.md` mandates |

## Compatibility Rules

1. Keep response fields stable once Booking starts consuming them.
2. Additive changes are preferred over breaking changes.
3. Include correlation IDs for troubleshooting cross-module calls.

## Failure Rules

Invalid query is 400. Service failure is 503. Valid no-match remains 200 with `matched=false`.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.