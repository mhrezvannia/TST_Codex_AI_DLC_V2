# Frontend Components - Movement Status Booking Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

Frontend scope for movement-status-booking-integration: movement status evidence, lifecycle update, and stale/duplicate exception views.

## Component Scope

The frontend surface must use real APIs/events/contracts and respect backend ownership. It must not make Booking derive movement status or make CMM decide D&D relevance.

## Component Hierarchy

`	ext
movement-status-booking-integrationRouteOrPanel
  |
  +-- SummaryPanel
  +-- WorkTableOrTimeline
  +-- DetailDrawer
  +-- EvidenceRail
  +-- ExceptionPanel
`

Text fallback: the UI route or panel shows summary status, tabular/timeline work, details, evidence, and exceptions for movement-status-booking-integration.

## Interaction Rules

- Authenticated access and route/action permissions come from Identity.
- UI commands call approved service APIs/BFF routes only.
- UI state is derived from service responses or event-backed evidence.
- UI does not copy prototype business logic or calculate backend-owned decisions.
- Exceptions and audit evidence remain visible to operators.

## Traceability

| Source | Frontend coverage |
|---|---|
| unit-of-work.md | Defines whether movement-status-booking-integration includes direct UI responsibility or support evidence. |
| unit-of-work-story-map.md | Story coverage: US-BKG-007, US-BKG-008, US-CMM-005, US-CMM-006. |
| requirements.md | Defines UI, security, audit, and workflow constraints. |
| components.md | Defines Enterprise Web and component ownership. |
| component-methods.md | Defines API/method expectations consumed by UI. |
| services.md | Defines service contracts and forbids UI-owned business rules. |

