# Business Logic Model - Booking Confirmed Journey Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit booking-confirmed-journey-integration is cross-module Kafka integration. It owns booking.confirmed producer/consumer contract, outbox publication, CMM journey creation/reconciliation, schema compatibility, and message-pact evidence. Story coverage: US-BKG-005, US-BKG-006, US-CMM-001, US-CMM-002.

## Functional Scope

This unit designs the workflows and processing rules needed to Booking confirms booking, writes outbox event, publishes booking.confirmed, CMM consumes, deduplicates, reconciles revision, and creates/updates journey. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to booking-confirmed-journey-integration.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: Booking confirms booking, writes outbox event, publishes booking.confirmed, CMM consumes, deduplicates, reconciles revision, and creates/updates journey.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns booking.confirmed producer/consumer contract, outbox publication, CMM journey creation/reconciliation, schema compatibility, and message-pact evidence. |
| Boundary | This unit must not derive movement status or calculate pricing/D&D. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines booking-confirmed-journey-integration responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps booking-confirmed-journey-integration to US-BKG-005, US-BKG-006, US-CMM-001, US-CMM-002. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

