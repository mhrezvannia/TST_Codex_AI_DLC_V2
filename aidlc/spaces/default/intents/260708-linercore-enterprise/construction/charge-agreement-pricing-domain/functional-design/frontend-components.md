# Frontend Components - Charge Agreement Pricing Domain

## Source Context

This artifact consumes unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, component-methods.md, services.md, and functional-design-questions.md.

Frontend scope for charge-agreement-pricing-domain: agreement, tariff, pricing simulation, manual pricing, D&D rule, and audit evidence views.

## Component Scope

The frontend surface must use real APIs/events/contracts and respect backend ownership. It must not mutate Booking lifecycle, derive CMM status, or query Booking/CMM databases.

## Component Hierarchy

`	ext
charge-agreement-pricing-domainRouteOrPanel
  |
  +-- SummaryPanel
  +-- WorkTableOrTimeline
  +-- DetailDrawer
  +-- EvidenceRail
  +-- ExceptionPanel
`

Text fallback: the UI route or panel shows summary status, tabular/timeline work, details, evidence, and exceptions for charge-agreement-pricing-domain.

## Interaction Rules

- Authenticated access and route/action permissions come from Identity.
- UI commands call approved service APIs/BFF routes only.
- UI state is derived from service responses or event-backed evidence.
- UI does not copy prototype business logic or calculate backend-owned decisions.
- Exceptions and audit evidence remain visible to operators.

## Traceability

| Source | Frontend coverage |
|---|---|
| unit-of-work.md | Defines whether charge-agreement-pricing-domain includes direct UI responsibility or support evidence. |
| unit-of-work-story-map.md | Story coverage: US-CHG-001, US-CHG-002, US-CHG-003, US-CHG-005, US-CHG-006, US-CHG-007, US-UI-003. |
| requirements.md | Defines UI, security, audit, and workflow constraints. |
| components.md | Defines Enterprise Web and component ownership. |
| component-methods.md | Defines API/method expectations consumed by UI. |
| services.md | Defines service contracts and forbids UI-owned business rules. |

