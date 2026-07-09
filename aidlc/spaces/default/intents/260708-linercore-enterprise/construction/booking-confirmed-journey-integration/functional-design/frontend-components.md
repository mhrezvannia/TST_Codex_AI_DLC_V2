# Frontend Components - Booking Confirmed Journey Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

Frontend scope for booking-confirmed-journey-integration: event evidence, journey creation status, and reconciliation exception views.

## Component Scope

The frontend surface must use real APIs/events/contracts and respect backend ownership. It must not derive movement status or calculate pricing/D&D.

## Component Hierarchy

`	ext
booking-confirmed-journey-integrationRouteOrPanel
  |
  +-- SummaryPanel
  +-- WorkTableOrTimeline
  +-- DetailDrawer
  +-- EvidenceRail
  +-- ExceptionPanel
`

Text fallback: the UI route or panel shows summary status, tabular/timeline work, details, evidence, and exceptions for booking-confirmed-journey-integration.

## Interaction Rules

- Authenticated access and route/action permissions come from Identity.
- UI commands call approved service APIs/BFF routes only.
- UI state is derived from service responses or event-backed evidence.
- UI does not copy prototype business logic or calculate backend-owned decisions.
- Exceptions and audit evidence remain visible to operators.

## Traceability

| Source | Frontend coverage |
|---|---|
| unit-of-work.md | Defines whether booking-confirmed-journey-integration includes direct UI responsibility or support evidence. |
| unit-of-work-story-map.md | Story coverage: US-BKG-005, US-BKG-006, US-CMM-001, US-CMM-002. |
| requirements.md | Defines UI, security, audit, and workflow constraints. |
| components.md | Defines Enterprise Web and component ownership. |
| component-methods.md | Defines API/method expectations consumed by UI. |
| services.md | Defines service contracts and forbids UI-owned business rules. |

