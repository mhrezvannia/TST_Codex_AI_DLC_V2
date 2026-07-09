# Scalability Requirements - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The UI must support enterprise workflow density and operational scanning without becoming a mock data island.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Concurrent local simulated users | At least 50. |
| Module routes | At least 10 route groups across platform, pricing, booking, movement, D&D, operations, and admin views. |
| Enterprise flows | Flow 1 through Flow 5 visible through UI evidence where applicable. |
| Work queue items | At least 5,000 paginated items. |
| Audit/exception rows | At least 10,000 rows through paginated/filterable views. |

## Growth Requirements

- Tables are paginated, filterable, and stable under large row counts.
- Route-level code splitting and data loading keep shell usable.
- Evidence panels and drawers lazy-load heavy details.
- UI state remains derived from services/events, not copied business logic.

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines shell, route, work queue, evidence, and exception workflows. |
| `business-rules.md` | Defines ownership and no-fake-prototype rules. |
| `requirements.md` | Supplies FR-UI and E2E workflow requirements. |
| `technology-stack.md` | Supplies Next.js, React, TypeScript, React Query, and shared packages. |
| `nfr-requirements-questions.md` | Q3 sets UI scale baseline. |
