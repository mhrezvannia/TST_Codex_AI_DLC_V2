# Shared Infrastructure - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

| Resource | Shared by | Boundary |
|---|---|---|
| Enterprise Web shell | All workflows. | Presentation shell only. |
| Identity permissions | Enterprise Web and backend services. | UI hints only; backend enforces. |
| Typed API clients | Enterprise Web and contract tests. | Services own business behavior. |
| Evidence read models | Operations, quality, frontend. | Read-only evidence. |
| nginx route map | Frontend and backend local routes. | Local Runtime owns route conventions. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares frontend shell and routes while preserving budgets. |
| `security-design.md` | Enforces permission and backend-boundary posture. |
| `scalability-design.md` | Supports enterprise route/workflow growth. |
| `reliability-design.md` | Preserves degraded states and no fake readiness. |
| `logical-components.md` | Maps shared resources to Enterprise Web components. |
| `components.md` | Keeps Enterprise Web separate from domain services. |
| `services.md` | Supports approved web-to-service topology. |
| `business-logic-model.md` | Implements shared shell/workflow infrastructure. |
