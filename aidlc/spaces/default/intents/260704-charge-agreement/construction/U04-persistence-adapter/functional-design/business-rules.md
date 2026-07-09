# Business Rules - U04 Persistence Adapter

## Storage Rules

| ID | Rule | Source |
| --- | --- | --- |
| U04-R1 | Agreement save is transactional across header, terms, and activity. | `requirements.md` NFR-5 |
| U04-R2 | Reference IDs are stored as immutable external IDs. | `requirements.md` FR-5.3 |
| U04-R3 | Search pagination must be deterministic. | `requirements.md` FR-3.1 |
| U04-R4 | Active candidate queries must exclude Draft, Suspended, and Expired rows. | `requirements.md` FR-4.2 |

## Schema Constraints

1. Agreement number is required.
2. Customer ID is required.
3. Validity dates are required.
4. Term amount is required and positive.
5. Term charge code and currency IDs are required.

## Failure Rules

Duplicate or constraint failures become application validation or conflict errors. Database unavailability becomes an upstream/service-unavailable result for U05 mapping.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.