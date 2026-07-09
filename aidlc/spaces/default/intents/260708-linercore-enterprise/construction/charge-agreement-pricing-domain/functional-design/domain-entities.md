# Domain Entities - Charge Agreement Pricing Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: Agreement, Tariff, ChargeTerm, PricingRequest, PricingResult, PricingAudit, DndRule, FreeTimeRule, ManualPricingCase.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |
| $_ | Supports charge-agreement-pricing-domain behavior and evidence. |

## Relationships

`	ext
[charge-agreement-pricing-domain command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: Agreement]
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
| unit-of-work.md | Defines charge-agreement-pricing-domain model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-CHG-001, US-CHG-002, US-CHG-003, US-CHG-005, US-CHG-006, US-CHG-007, US-UI-003. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

