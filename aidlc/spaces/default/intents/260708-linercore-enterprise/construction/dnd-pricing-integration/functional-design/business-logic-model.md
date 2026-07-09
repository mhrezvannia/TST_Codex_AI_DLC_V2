# Business Logic Model - D&D Pricing Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit dnd-pricing-integration is cross-module Booking to Charge D&D integration. It owns Booking D&D boundary trigger, pricing.dnd-request/result seam, Charge D&D calculation handoff, manual fallback, and audit evidence. Story coverage: US-CHG-006, US-BKG-008, US-UI-003.

## Functional Scope

This unit designs the workflows and processing rules needed to Booking identifies D&D-relevant boundary, sends D&D request, Charge calculates result, Booking stores snapshot, and exceptions route to manual handling. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to dnd-pricing-integration.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: Booking identifies D&D-relevant boundary, sends D&D request, Charge calculates result, Booking stores snapshot, and exceptions route to manual handling.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns Booking D&D boundary trigger, pricing.dnd-request/result seam, Charge D&D calculation handoff, manual fallback, and audit evidence. |
| Boundary | This unit must not let Booking calculate D&D or let CMM decide D&D relevance. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines dnd-pricing-integration responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps dnd-pricing-integration to US-CHG-006, US-BKG-008, US-UI-003. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

