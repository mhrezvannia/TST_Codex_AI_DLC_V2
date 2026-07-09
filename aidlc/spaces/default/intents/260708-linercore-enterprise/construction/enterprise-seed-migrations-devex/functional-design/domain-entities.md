# Domain Entities - Enterprise Seed Migrations Devex

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: DatabaseOwner, MigrationPlan, SeedDataset, SeedFixture, ResetPlan, DevCommand, ValidationRun.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |
| $_ | Supports enterprise-seed-migrations-devex behavior and evidence. |

## Relationships

`	ext
[enterprise-seed-migrations-devex command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: DatabaseOwner]
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
| unit-of-work.md | Defines enterprise-seed-migrations-devex model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-SP-003, US-CHG-005, US-BKG-004, US-RUN-001, US-RUN-002, US-RUN-003. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

