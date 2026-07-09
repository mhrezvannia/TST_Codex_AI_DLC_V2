# Domain Entities - Enterprise Web Shell And Workflows

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

This unit's primary model concepts are: NavigationItem, WorkQueueItem, WorkflowRoute, ApiClientState, ExceptionViewModel, AuditTimelineItem, EvidencePanelModel.

## Entity Overview

| Entity | Purpose |
|---|---|
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |
| $_ | Supports enterprise-web-shell-and-workflows behavior and evidence. |

## Relationships

`	ext
[enterprise-web-shell-and-workflows command/event/input]
        |
        v
[Validation and boundary checks]
        |
        v
[Unit-owned model: NavigationItem]
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
| unit-of-work.md | Defines enterprise-web-shell-and-workflows model ownership. |
| unit-of-work-story-map.md | Maps entity behavior to US-SP-001, US-SP-003, US-CHG-001, US-CHG-003, US-CHG-005, all US-UI stories, selected Booking/CMM support stories. |
| requirements.md | Defines required attributes, state, audit, and evidence expectations. |
| components.md | Defines component-level entity ownership. |
| component-methods.md | Defines method and interaction constraints. |
| services.md | Defines storage, service contracts, and integration boundaries. |

