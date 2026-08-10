# Business Rules - U05 Route Compatibility and Preservation

## Source Context

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They govern compatibility routing and prior-work preservation.

## Route Rules

| Rule | Statement |
| --- | --- |
| ROUTE-01 | Canonical W2-01 shell routes are `/booking`, `/booking/new`, and `/booking/[id]`. |
| ROUTE-02 | `/bookings`, `/bookings/new`, and `/bookings/[id]` remain compatibility inputs and must redirect or resolve to canonical shell routes. |
| ROUTE-03 | Compatibility routes must preserve protected session and actor propagation rules. |
| ROUTE-04 | Compatibility cannot bypass shell chrome, breadcrumbs, or user menu. |

## Preservation Rules

| Rule | Statement |
| --- | --- |
| PRES-01 | W0-01 platform/eventing files are not redesigned for W2-01. |
| PRES-02 | W0-02 reference-data seed/completeness surfaces and UI are not migrated or changed except with W2-01-specific justification. |
| PRES-03 | W1-01 Booking list/detail/create/action behavior remains the business surface being mounted. |
| PRES-04 | W2-02 design-system foundation is consumed, not rebuilt. |
| PRES-05 | Every touched prior-work file needs a W2-01-specific reason and targeted verification. |

## Frontend Rules

| Rule | Statement |
| --- | --- |
| UI-01 | Route redirects/resolution use existing Next.js/React/TypeScript patterns. |
| UI-02 | Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |
| UI-03 | Redirects preserve meaningful navigation and do not produce broken breadcrumbs. |

## Evidence Rules

| Rule | Statement |
| --- | --- |
| EVID-01 | U05 evidence includes observed `/bookings*` compatibility for list, new, and detail routes where data exists. |
| EVID-02 | U05 evidence includes preserved Booking list/detail/create behavior inside shell. |
| EVID-03 | U05 evidence includes a scoped diff review for W0-01, W0-02, W1-01, and W2-02. |
| EVID-04 | W1 live-proof waiver remains BLOCKED at `compose-start`, not PASS. |
