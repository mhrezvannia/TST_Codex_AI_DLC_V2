# Monitoring Design - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| Shell/session load | Budget breach or auth failure. |
| Route transition | Slow or failed workflow route. |
| API/BFF error | Service route degraded or correlation id missing. |
| Permission payload failure | UI degraded while backend still enforces. |
| Evidence panel load | Heavy evidence fails or blocks summary route. |
| Mock/prototype data | Readiness test failure. |
| Accessibility regression | Keyboard/focus/label/status checks fail. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors shell, route, workflow, work queue, evidence, and visual stability targets. |
| `security-design.md` | Monitors session, permissions, backend enforcement, and no-secret posture. |
| `scalability-design.md` | Groups by user, route, flow, queue, audit, and exception dimensions. |
| `reliability-design.md` | Alerts on degraded/stale/conflict states and fake readiness. |
| `logical-components.md` | Monitoring maps to shell, permission loader, API layer, work queue, evidence panels, errors, audit views, and accessibility harness. |
| `components.md` | Feeds Observability Platform. |
| `services.md` | Covers Enterprise Web and backend service routes. |
| `business-logic-model.md` | Observes shell, routing, work queue, API, evidence, and exception workflows. |
