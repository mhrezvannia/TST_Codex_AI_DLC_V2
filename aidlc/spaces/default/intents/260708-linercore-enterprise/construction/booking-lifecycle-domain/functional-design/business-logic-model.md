# Business Logic Model - Booking Lifecycle Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit booking-lifecycle-domain is greenfield Booking service. It owns booking drafts, validation, pricing orchestration state, confirmation, amendments, reconfirmation, revisioning, lifecycle status, exception queues, D&D trigger evaluation, and booking audit. Story coverage: US-BKG-001, US-BKG-003, US-BKG-004, US-BKG-006, US-BKG-007, US-UI-002.

## Functional Scope

This unit designs the workflows and processing rules needed to create booking, validate references/capacity, request pricing, store pricing snapshot, confirm, amend, reconfirm, and handle exceptions. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to booking-lifecycle-domain.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: create booking, validate references/capacity, request pricing, store pricing snapshot, confirm, amend, reconfirm, and handle exceptions.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns booking drafts, validation, pricing orchestration state, confirmation, amendments, reconfirmation, revisioning, lifecycle status, exception queues, D&D trigger evaluation, and booking audit. |
| Boundary | This unit must not calculate prices, D&D rates/free time, or movement status. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines booking-lifecycle-domain responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps booking-lifecycle-domain to US-BKG-001, US-BKG-003, US-BKG-004, US-BKG-006, US-BKG-007, US-UI-002. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

