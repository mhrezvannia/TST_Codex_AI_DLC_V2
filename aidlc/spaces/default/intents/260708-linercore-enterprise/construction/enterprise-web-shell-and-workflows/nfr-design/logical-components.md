# Logical Components - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define where Enterprise Web shell, route, workflow, permission, evidence, performance, and reliability patterns apply.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| EnterpriseShell | Authenticated layout, navigation, module framing, and global status. | Shell load and navigation. |
| SessionPermissionLoader | Loads Keycloak-backed subject and safe effective permissions. | Auth/session state. |
| RoutePermissionGuard | Applies route/action visibility from capabilities. | UI permission hints. |
| TypedApiClientLayer | Wraps OpenAPI/generated clients and BFF presentation calls. | Service access. |
| WorkQueueView | Displays paginated operational work and exceptions. | Queue performance. |
| WorkflowScreenRouter | Routes pricing, booking, movement, D&D, operations, and admin workflows. | Module workflow navigation. |
| EvidencePanelManager | Lazy-loads logs, traces, contract, audit, and health evidence. | Detail load and proof display. |
| ErrorAndDegradedStatePresenter | Shows loading, degraded, stale, conflict, failed, and partial states. | Honest UI state. |
| AuditExceptionViews | Presents paginated/filterable audit and exception rows. | Evidence scale. |
| AccessibleComponentHarness | Enforces keyboard, labels, focus, status text, and error summaries. | Accessibility. |

## Boundary Model

Enterprise Web owns authenticated shell, navigation, permissions presentation, work queue, module routes, exception views, audit views, and real API/event-backed workflow presentation.

Enterprise Web does not own backend business rules, authorization enforcement, pricing logic, booking lifecycle rules, movement status derivation, D&D calculation, or mock/prototype readiness.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Auth/session failure | Shell unauthorized/re-auth state. | No protected route render. |
| Permission payload failure | Route/action visibility degraded. | Backend still enforces. |
| Service route failure | Affected workflow degraded. | Source service and correlation ID shown. |
| Stale/conflict state | Command blocked or resolve flow shown. | Version/correlation evidence. |
| Heavy evidence load failure | Evidence panel partial/failed. | Summary route remains usable. |
| Mock/prototype fallback | Readiness invalid. | Tests block fake completion. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Shell load and route transition | EnterpriseShell, SessionPermissionLoader, WorkflowScreenRouter. |
| Route/action permissions | RoutePermissionGuard. |
| Typed service-backed state | TypedApiClientLayer. |
| Work queue/audit scale | WorkQueueView and AuditExceptionViews. |
| Lazy evidence | EvidencePanelManager. |
| Degraded/stale/error states | ErrorAndDegradedStatePresenter. |
| Accessibility | AccessibleComponentHarness. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support shell, route, workflow, work queue, audit/exception, and visual stability targets. |
| `security-requirements.md` | Components enforce session, route/action permissions, backend-enforcement posture, no secrets, audit-safe actions, and accessibility. |
| `scalability-requirements.md` | Components support users, route groups, enterprise flows, work queue items, and audit/exception rows. |
| `reliability-requirements.md` | Components implement typed clients, degraded states, retry-safe actions, stale/conflict handling, errors, and no fake readiness. |
| `tech-stack-decisions.md` | Components map to Next.js, React, TypeScript, typed/OpenAPI clients, Axios, React Query, shared packages, and test tooling. |
| `business-logic-model.md` | Components implement session loading, permission routing, work queue, real API/BFF calls, workflow evidence, and exception handling. |
