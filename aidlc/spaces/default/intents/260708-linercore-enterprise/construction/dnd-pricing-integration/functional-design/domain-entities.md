# Domain Entities - D&D Pricing Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: DndTrigger, DndPricingRequest, DndPricingResult, FreeTimeBreakdown, ChargeableDayLine, DndException, DndAuditLink.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports dnd-pricing-integration behavior and evidence. |
| $_ | Supports dnd-pricing-integration behavior and evidence. |
| $_ | Supports dnd-pricing-integration behavior and evidence. |
| $_ | Supports dnd-pricing-integration behavior and evidence. |
| $_ | Supports dnd-pricing-integration behavior and evidence. |
| $_ | Supports dnd-pricing-integration behavior and evidence. |
| $_ | Supports dnd-pricing-integration behavior and evidence. |

## Relationships

`	ext
[dnd-pricing-integration command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: DndTrigger]
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
| unit-of-work.md | Defines dnd-pricing-integration model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-CHG-006, US-BKG-008, US-UI-003. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

