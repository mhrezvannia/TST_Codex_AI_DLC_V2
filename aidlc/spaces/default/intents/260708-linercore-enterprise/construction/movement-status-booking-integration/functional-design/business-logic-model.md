# Business Logic Model - Movement Status Booking Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit movement-status-booking-integration is cross-module Kafka integration. It owns containermovement.status producer/consumer contract, CMM publication, Booking consumer lifecycle update, ordering/staleness handling, schema compatibility, and message-pact evidence. Story coverage: US-BKG-007, US-BKG-008, US-CMM-005, US-CMM-006.

## Functional Scope

This unit designs the workflows and processing rules needed to CMM publishes status, Booking consumes with dedupe/staleness checks, updates lifecycle, and records D&D trigger input evidence. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to movement-status-booking-integration.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: CMM publishes status, Booking consumes with dedupe/staleness checks, updates lifecycle, and records D&D trigger input evidence.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns containermovement.status producer/consumer contract, CMM publication, Booking consumer lifecycle update, ordering/staleness handling, schema compatibility, and message-pact evidence. |
| Boundary | This unit must not make Booking derive movement status or make CMM decide D&D relevance. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines movement-status-booking-integration responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps movement-status-booking-integration to US-BKG-007, US-BKG-008, US-CMM-005, US-CMM-006. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

