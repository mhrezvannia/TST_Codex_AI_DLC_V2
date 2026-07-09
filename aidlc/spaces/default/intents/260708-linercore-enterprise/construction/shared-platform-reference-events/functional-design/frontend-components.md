# Frontend Components - Shared Platform Reference Events

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

Frontend scope for shared-platform-reference-events: reference data maintenance, validation evidence, and outbox/event health views.

## Component Scope

The frontend surface must use real APIs/events/contracts and respect backend ownership. It must not own pricing, booking, CMM, D&D, or cross-service database joins.

## Component Hierarchy

`	ext
shared-platform-reference-eventsRouteOrPanel
  |
  +-- SummaryPanel
  +-- WorkTableOrTimeline
  +-- DetailDrawer
  +-- EvidenceRail
  +-- ExceptionPanel
`

Text fallback: the UI route or panel shows summary status, tabular/timeline work, details, evidence, and exceptions for shared-platform-reference-events.

## Interaction Rules

- Authenticated access and route/action permissions come from Identity.
- UI commands call approved service APIs/BFF routes only.
- UI state is derived from service responses or event-backed evidence.
- UI does not copy prototype business logic or calculate backend-owned decisions.
- Exceptions and audit evidence remain visible to operators.

## Traceability

| Source | Frontend coverage |
|---|---|
| unit-of-work.md | Defines whether shared-platform-reference-events includes direct UI responsibility or support evidence. |
| unit-of-work-story-map.md | Story coverage: US-SP-003, US-SP-004, US-CHG-001, US-BKG-001, US-CMM-004. |
| requirements.md | Defines UI, security, audit, and workflow constraints. |
| components.md | Defines Enterprise Web and component ownership. |
| component-methods.md | Defines API/method expectations consumed by UI. |
| services.md | Defines service contracts and forbids UI-owned business rules. |

