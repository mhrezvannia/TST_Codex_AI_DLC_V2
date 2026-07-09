# Business Logic Model - Enterprise Web Shell And Workflows

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit enterprise-web-shell-and-workflows is integrated frontend application. It owns authenticated shell, navigation, permissions, work queue, module routes, exceptions, audit views, and real API/event-backed workflows. Story coverage: US-SP-001, US-SP-003, US-CHG-001, US-CHG-003, US-CHG-005, all US-UI stories, selected Booking/CMM support stories.

## Functional Scope

This unit designs the workflows and processing rules needed to load session, route by permission, render work queue, call real APIs/BFF routes, display workflow evidence, and handle exceptions. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to enterprise-web-shell-and-workflows.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: load session, route by permission, render work queue, call real APIs/BFF routes, display workflow evidence, and handle exceptions.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns authenticated shell, navigation, permissions, work queue, module routes, exceptions, audit views, and real API/event-backed workflows. |
| Boundary | This unit must not own business rules or copy fake Claude prototype logic. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines enterprise-web-shell-and-workflows responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps enterprise-web-shell-and-workflows to US-SP-001, US-SP-003, US-CHG-001, US-CHG-003, US-CHG-005, all US-UI stories, selected Booking/CMM support stories. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

