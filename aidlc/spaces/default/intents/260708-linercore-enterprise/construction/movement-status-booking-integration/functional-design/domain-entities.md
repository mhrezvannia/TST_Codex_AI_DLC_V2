# Domain Entities - Movement Status Booking Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: MovementStatusEvent, MovementStatusConsumerState, BookingLifecycleUpdate, StaleStatusDecision, EventOrderingKey, StatusMessagePact.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports movement-status-booking-integration behavior and evidence. |
| $_ | Supports movement-status-booking-integration behavior and evidence. |
| $_ | Supports movement-status-booking-integration behavior and evidence. |
| $_ | Supports movement-status-booking-integration behavior and evidence. |
| $_ | Supports movement-status-booking-integration behavior and evidence. |
| $_ | Supports movement-status-booking-integration behavior and evidence. |

## Relationships

`	ext
[movement-status-booking-integration command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: MovementStatusEvent]
        |
        v
[Audit, contract, event, UI, runtime, or readiness evidence]
`

Text fallback: the unit receives a command/event/input, validates boundaries and context, updates only its owned model, and produces evidence for downstream units.

## Lifecycle States

- draft or eceived
- alidated
- ctive or processing
- completed
- exception
- rchived where audit/history requires it

## Traceability

| Source | Entity coverage |
|---|---|
| unit-of-work.md | Defines movement-status-booking-integration model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-BKG-007, US-BKG-008, US-CMM-005, US-CMM-006. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

