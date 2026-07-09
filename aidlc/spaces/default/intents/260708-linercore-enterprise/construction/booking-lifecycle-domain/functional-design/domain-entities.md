# Domain Entities - Booking Lifecycle Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: Booking, BookingRevision, BookingParty, RoutingLeg, EquipmentRequirement, PricingSnapshot, BookingException, LifecycleEvent, DndTriggerCandidate.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |
| $_ | Supports booking-lifecycle-domain behavior and evidence. |

## Relationships

`	ext
[booking-lifecycle-domain command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: Booking]
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
| unit-of-work.md | Defines booking-lifecycle-domain model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-BKG-001, US-BKG-003, US-BKG-004, US-BKG-006, US-BKG-007, US-UI-002. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

