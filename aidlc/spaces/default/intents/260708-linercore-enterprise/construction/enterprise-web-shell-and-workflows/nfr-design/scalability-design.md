# Scalability Design - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The UI must support enterprise workflow density and operational scanning without becoming a mock data island.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Concurrent local simulated users | At least 50. |
| Module route groups | At least 10 across platform, pricing, booking, movement, D&D, operations, and admin. |
| Enterprise flows | Flow 1 through Flow 5 visible through UI evidence where applicable. |
| Work queue items | At least 5,000 paginated items. |
| Audit/exception rows | At least 10,000 rows through paginated/filterable views. |

## UI Scaling Patterns

| Concern | Design |
|---|---|
| Tables | Server-backed pagination, filters, stable columns, and compact row actions. |
| Route code | Route-level code splitting and shared shell chunk reuse. |
| Evidence panels | Lazy-load heavy logs, traces, contract, and audit details. |
| Workflow state | Derived from services/events, not copied frontend business logic. |
| Query cache | Typed query keys scoped by module, filter, id, and stale/fresh state. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Work queue p95 exceeds 1.5 seconds | Tighten server filters, pagination, and summary projections. |
| Audit view p95 exceeds 2 seconds | Lazy-load details and add filter presets. |
| Route bundle grows | Split module routes and defer heavy workflow panels. |
| Permission payload grows | Use capability digest and module-scoped permission checks. |
| Evidence panels slow route load | Defer panels until opened or requested. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements user, route, flow, work queue, audit, and exception scale. |
| `performance-requirements.md` | Uses pagination, code splitting, and lazy loading to preserve UI budgets. |
| `security-requirements.md` | Scales route/action permission, audit context, no-secret, and accessibility controls. |
| `reliability-requirements.md` | Keeps service-derived state, stale detection, error states, and no fake readiness at scale. |
| `tech-stack-decisions.md` | Uses Next.js, React, TypeScript, React Query, typed clients, and shared packages. |
| `business-logic-model.md` | Implements shell, route, work queue, evidence, exception, and API/BFF workflows. |
