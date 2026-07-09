# Domain Entities - Container Movement Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: ContainerJourney, ExpectedMovement, MovementEvent, MovementValidationResult, MovementStatus, MovementHistory, DedupeKey.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports container-movement-domain behavior and evidence. |
| $_ | Supports container-movement-domain behavior and evidence. |
| $_ | Supports container-movement-domain behavior and evidence. |
| $_ | Supports container-movement-domain behavior and evidence. |
| $_ | Supports container-movement-domain behavior and evidence. |
| $_ | Supports container-movement-domain behavior and evidence. |
| $_ | Supports container-movement-domain behavior and evidence. |

## Relationships

`	ext
[container-movement-domain command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: ContainerJourney]
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
| unit-of-work.md | Defines container-movement-domain model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-CMM-001, US-CMM-002, US-CMM-003, US-CMM-004, US-CMM-005, US-CMM-006, US-UI-004. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

