# Business Logic Model - Shared Platform Reference Events

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

The unit shared-platform-reference-events is brownfield Shared Platform hardening. It owns reference set/record lifecycle, reference validation APIs, reference-data changed events, transactional outbox, Schema Registry and Kafka publisher reliability. Story coverage: US-SP-003, US-SP-004, US-CHG-001, US-BKG-001, US-CMM-004.

## Functional Scope

This unit designs the workflows and processing rules needed to maintain reference data, validate consumers, append reference changes, publish canonical events, and expose outbox health. It preserves the approved ownership boundaries from requirements.md, components.md, component-methods.md, and services.md.

## Core Workflow

1. Receive an authorized command, event, UI action, or runtime trigger relevant to shared-platform-reference-events.
2. Validate request shape, identity/security context, correlation, idempotency, and required reference data.
3. Execute the unit-owned behavior: maintain reference data, validate consumers, append reference changes, publish canonical events, and expose outbox health.
4. Persist or publish only the state/evidence owned by this unit.
5. Emit audit, contract, event, log, metric, and trace evidence required by the relevant stories.
6. Surface exceptions through the owning service/UI workflow without hiding blockers.

## Decision Points

| Decision | Rule |
|---|---|
| Ownership | This unit owns reference set/record lifecycle, reference validation APIs, reference-data changed events, transactional outbox, Schema Registry and Kafka publisher reliability. |
| Boundary | This unit must not own pricing, booking, CMM, D&D, or cross-service database joins. |
| Completion | Completion requires tests, contract/runtime evidence, and traceability, not documents or container startup alone. |
| Integration | Interactions use approved APIs/events/contracts from services.md; no cross-service database joins are allowed. |

## Traceability

| Source | Functional design coverage |
|---|---|
| unit-of-work.md | Defines shared-platform-reference-events responsibilities, boundaries, deployment model, and implementation notes. |
| unit-of-work-story-map.md | Maps shared-platform-reference-events to US-SP-003, US-SP-004, US-CHG-001, US-BKG-001, US-CMM-004. |
| requirements.md | Supplies functional, security, reliability, observability, and no-fake-completion constraints. |
| components.md | Defines component ownership and cross-component boundaries. |
| component-methods.md | Provides method, API, state, and operation expectations. |
| services.md | Defines service topology, storage, contracts, integration style, and scaling expectations. |

