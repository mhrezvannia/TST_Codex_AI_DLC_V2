# Business Rules - Container Movement Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The accepted recommended answers keep container-movement-domain within its approved boundary and require real evidence before completion.

## Ownership Rules

- container-movement-domain owns journeys, expected movements, movement capture, DCSA-aligned validation, ordering/deduplication, status derivation, and movement history.
- container-movement-domain must not decide D&D relevance, mutate Booking lifecycle, or calculate pricing/D&D.
- Public behavior must trace to unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, and services.md.
- Service interactions must use approved OpenAPI, AsyncAPI, Avro, Pact, message-pact, or typed client contracts where applicable.

## Validation Rules

| Rule | Statement |
|---|---|
| VAL-001 | Inputs must validate identity/security context, required reference data, correlation, and idempotency where applicable. |
| VAL-002 | Boundary violations fail closed and are visible in tests/review evidence. |
| VAL-003 | Exceptions must be auditable and surfaced to the owning workflow. |
| VAL-004 | Completion cannot be claimed from documents, mock screens, hardcoded results, or containers merely starting. |

## Evidence Rules

- Unit tests cover core logic and boundary failures.
- Integration or contract tests cover external seams.
- Local runtime compatibility is documented where applicable.
- Observability hooks preserve correlation across HTTP/events/logs/traces where applicable.
- UI evidence uses real APIs/events and does not own business rules unless this is the UI unit.

## Traceability

| Source | Business-rule coverage |
|---|---|
| unit-of-work.md | Unit responsibilities and boundaries. |
| unit-of-work-story-map.md | Story coverage: US-CMM-001, US-CMM-002, US-CMM-003, US-CMM-004, US-CMM-005, US-CMM-006, US-UI-004. |
| requirements.md | Functional and non-functional rule sources. |
| components.md | Component ownership boundaries. |
| component-methods.md | Method and state behavior constraints. |
| services.md | Service, storage, contract, and integration rules. |

