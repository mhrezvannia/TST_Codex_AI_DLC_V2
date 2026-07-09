# Frontend Components - Enterprise Web Shell And Workflows

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

Frontend scope for enterprise-web-shell-and-workflows: primary enterprise shell, module workspaces, forms, tables, timelines, drawers, and evidence rails.

## Component Scope

The frontend surface must use real APIs/events/contracts and respect backend ownership. It must not own business rules or copy fake Claude prototype logic.

## Component Hierarchy

`	ext
enterprise-web-shell-and-workflowsRouteOrPanel
  |
  +-- SummaryPanel
  +-- WorkTableOrTimeline
  +-- DetailDrawer
  +-- EvidenceRail
  +-- ExceptionPanel
`

Text fallback: the UI route or panel shows summary status, tabular/timeline work, details, evidence, and exceptions for enterprise-web-shell-and-workflows.

## Interaction Rules

- Authenticated access and route/action permissions come from Identity.
- UI commands call approved service APIs/BFF routes only.
- UI state is derived from service responses or event-backed evidence.
- UI does not copy prototype business logic or calculate backend-owned decisions.
- Exceptions and audit evidence remain visible to operators.

## Traceability

| Source | Frontend coverage |
|---|---|
| unit-of-work.md | Defines whether enterprise-web-shell-and-workflows includes direct UI responsibility or support evidence. |
| unit-of-work-story-map.md | Story coverage: US-SP-001, US-SP-003, US-CHG-001, US-CHG-003, US-CHG-005, all US-UI stories, selected Booking/CMM support stories. |
| requirements.md | Defines UI, security, audit, and workflow constraints. |
| components.md | Defines Enterprise Web and component ownership. |
| component-methods.md | Defines API/method expectations consumed by UI. |
| services.md | Defines service contracts and forbids UI-owned business rules. |

