# Domain Entities - Booking Confirmed Journey Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: BookingConfirmedEvent, BookingOutboxRecord, JourneyCreationCommand, BookingRevisionCursor, MessagePactInteraction, ConsumerOffset.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports booking-confirmed-journey-integration behavior and evidence. |
| $_ | Supports booking-confirmed-journey-integration behavior and evidence. |
| $_ | Supports booking-confirmed-journey-integration behavior and evidence. |
| $_ | Supports booking-confirmed-journey-integration behavior and evidence. |
| $_ | Supports booking-confirmed-journey-integration behavior and evidence. |
| $_ | Supports booking-confirmed-journey-integration behavior and evidence. |

## Relationships

`	ext
[booking-confirmed-journey-integration command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: BookingConfirmedEvent]
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
| unit-of-work.md | Defines booking-confirmed-journey-integration model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-BKG-005, US-BKG-006, US-CMM-001, US-CMM-002. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

