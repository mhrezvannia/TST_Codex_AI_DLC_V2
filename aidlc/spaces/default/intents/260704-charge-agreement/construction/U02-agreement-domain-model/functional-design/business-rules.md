# Business Rules - U02 Agreement Domain Model

## Domain Invariants

| ID | Rule | Source |
| --- | --- | --- |
| U02-R1 | New agreements start in Draft. | `requirements.md` FR-1.1 |
| U02-R2 | Draft agreements can update header and charge terms. | `requirements.md` FR-1.2 |
| U02-R3 | Approval requires at least one valid charge term. | `requirements.md` FR-1.4 |
| U02-R4 | Suspended and Expired agreements are not active. | `requirements.md` FR-1.5, FR-1.6 |
| U02-R5 | Charge amount must be greater than zero. | `requirements.md` FR-2.3 |
| U02-R6 | Charge-term dates must fit inside agreement dates. | `requirements.md` FR-2.4 |

## State Transitions

| From | Action | To | Allowed |
| --- | --- | --- | --- |
| Draft | approve | Approved | Yes, when terms are valid |
| Draft | suspend | Suspended | No |
| Approved | suspend | Suspended | Yes |
| Approved | expire | Expired | Yes |
| Suspended | approve | Approved | No in MVP |
| Expired | update | Expired | No |

## Failure Rules

Domain failures return typed validation or illegal-state errors that U03 maps to application errors and U05 maps to HTTP responses.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.