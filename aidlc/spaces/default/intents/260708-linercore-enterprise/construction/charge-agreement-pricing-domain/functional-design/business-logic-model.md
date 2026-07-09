# Business Logic Model - Charge Agreement Pricing Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit charge-agreement-pricing-domain is mixed Charge/Agreement extension. It owns agreements, tariffs, charge terms, active lookup, tariff fallback, itemised pricing, manual pricing, D&D rules, free time, rates, chargeable days, and commercial audit. Story coverage: US-CHG-001, US-CHG-002, US-CHG-003, US-CHG-005, US-CHG-006, US-CHG-007, US-UI-003.

## Functional Scope

This unit designs the workflows and processing rules needed to create and approve agreements, resolve active pricing, calculate itemised pricing, handle manual fallback, and prepare D&D rules. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to charge-agreement-pricing-domain.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: create and approve agreements, resolve active pricing, calculate itemised pricing, handle manual fallback, and prepare D&D rules.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns agreements, tariffs, charge terms, active lookup, tariff fallback, itemised pricing, manual pricing, D&D rules, free time, rates, chargeable days, and commercial audit. |
| Boundary | This unit must not mutate Booking lifecycle, derive CMM status, or query Booking/CMM databases. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines charge-agreement-pricing-domain responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps charge-agreement-pricing-domain to US-CHG-001, US-CHG-002, US-CHG-003, US-CHG-005, US-CHG-006, US-CHG-007, US-UI-003. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

