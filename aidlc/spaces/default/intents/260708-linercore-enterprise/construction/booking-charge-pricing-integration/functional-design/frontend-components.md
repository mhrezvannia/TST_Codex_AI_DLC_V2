# Frontend Components - Booking Charge Pricing Integration

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

Frontend scope for booking-charge-pricing-integration: pricing status and exception evidence inside booking workflows.

## Component Scope

The frontend surface must use real APIs/events/contracts and respect backend ownership. It must not perform Charge calculation or let Booking own pricing rules.

## Component Hierarchy

`	ext
booking-charge-pricing-integrationRouteOrPanel
  |
  +-- SummaryPanel
  +-- WorkTableOrTimeline
  +-- DetailDrawer
  +-- EvidenceRail
  +-- ExceptionPanel
`

Text fallback: the UI route or panel shows summary status, tabular/timeline work, details, evidence, and exceptions for booking-charge-pricing-integration.

## Interaction Rules

- Authenticated access and route/action permissions come from Identity.
- UI commands call approved service APIs/BFF routes only.
- UI state is derived from service responses or event-backed evidence.
- UI does not copy prototype business logic or calculate backend-owned decisions.
- Exceptions and audit evidence remain visible to operators.

## Traceability

| Source | Frontend coverage |
|---|---|
| unit-of-work.md | Defines whether booking-charge-pricing-integration includes direct UI responsibility or support evidence. |
| unit-of-work-story-map.md | Story coverage: US-CHG-002, US-CHG-003, US-CHG-004, US-BKG-002, US-UI-002. |
| requirements.md | Defines UI, security, audit, and workflow constraints. |
| components.md | Defines Enterprise Web and component ownership. |
| component-methods.md | Defines API/method expectations consumed by UI. |
| services.md | Defines service contracts and forbids UI-owned business rules. |

