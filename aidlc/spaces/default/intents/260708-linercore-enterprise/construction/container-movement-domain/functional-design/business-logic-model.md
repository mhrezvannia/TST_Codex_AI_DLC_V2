# Business Logic Model - Container Movement Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit container-movement-domain is greenfield CMM service. It owns journeys, expected movements, movement capture, DCSA-aligned validation, ordering/deduplication, status derivation, and movement history. Story coverage: US-CMM-001, US-CMM-002, US-CMM-003, US-CMM-004, US-CMM-005, US-CMM-006, US-UI-004.

## Functional Scope

This unit designs the workflows and processing rules needed to create journey, derive expected movements, capture planned/estimated/actual events, validate DCSA fields, derive status, and publish status evidence. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to container-movement-domain.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: create journey, derive expected movements, capture planned/estimated/actual events, validate DCSA fields, derive status, and publish status evidence.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns journeys, expected movements, movement capture, DCSA-aligned validation, ordering/deduplication, status derivation, and movement history. |
| Boundary | This unit must not decide D&D relevance, mutate Booking lifecycle, or calculate pricing/D&D. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines container-movement-domain responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps container-movement-domain to US-CMM-001, US-CMM-002, US-CMM-003, US-CMM-004, US-CMM-005, US-CMM-006, US-UI-004. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

