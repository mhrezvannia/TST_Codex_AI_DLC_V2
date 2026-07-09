# Infrastructure Services - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| Enterprise Web Next.js app | Authenticated shell, workflows, work queue, evidence, audit/exception views. |
| nginx | Local frontend/API routing and callback paths. |
| Identity Service/Keycloak | Session and effective permissions. |
| Backend services | Real workflow data and actions. |
| Contract Platform | Typed/OpenAPI clients and contract evidence. |
| Observability Platform | Logs/traces/metrics/evidence views. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides shell/route/workflow/evidence performance infrastructure. |
| `security-design.md` | Applies session, permission hints, no-secret, and backend-enforcement controls. |
| `scalability-design.md` | Supports route groups, flows, queues, and audit/exception views. |
| `reliability-design.md` | Supports typed clients, degraded states, stale/conflict handling, and no fake readiness. |
| `logical-components.md` | Allocates frontend infrastructure to Enterprise Web components. |
| `components.md` | Keeps frontend ownership distinct from backend domains. |
| `services.md` | Integrates Enterprise Web with approved services. |
| `business-logic-model.md` | Supports shell, routing, API/BFF, evidence, and exception workflows. |
