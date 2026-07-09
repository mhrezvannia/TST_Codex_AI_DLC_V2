# Business Logic Model - Booking Charge Pricing Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit booking-charge-pricing-integration is cross-module HTTP integration. It owns Booking to Charge pricing request/response seam, OpenAPI/Pact expectations, idempotency, timeout/retry/circuit breaker behavior, and pricing snapshot handoff. Story coverage: US-CHG-002, US-CHG-003, US-CHG-004, US-BKG-002, US-UI-002.

## Functional Scope

This unit designs the workflows and processing rules needed to Booking prepares pricing request, calls Charge, handles success/failure/manual fallback, stores auditable pricing snapshot, and surfaces pricing evidence. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to booking-charge-pricing-integration.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: Booking prepares pricing request, calls Charge, handles success/failure/manual fallback, stores auditable pricing snapshot, and surfaces pricing evidence.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns Booking to Charge pricing request/response seam, OpenAPI/Pact expectations, idempotency, timeout/retry/circuit breaker behavior, and pricing snapshot handoff. |
| Boundary | This unit must not perform Charge calculation or let Booking own pricing rules. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines booking-charge-pricing-integration responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps booking-charge-pricing-integration to US-CHG-002, US-CHG-003, US-CHG-004, US-BKG-002, US-UI-002. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

