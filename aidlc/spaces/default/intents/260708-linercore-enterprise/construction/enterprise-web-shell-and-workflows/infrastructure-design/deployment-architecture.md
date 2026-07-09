# Deployment Architecture - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys the integrated Enterprise Web shell and workflows as a real API-backed frontend.

## Runtime Topology

```text
[Browser]
   |
   v
[nginx Reverse Proxy]
   |
   v
[Enterprise Web Next.js App]
   |
   +--> [Identity / Permissions]
   +--> [Reference Data APIs]
   +--> [Charge APIs]
   +--> [Booking APIs]
   +--> [CMM APIs]
   +--> [Evidence / Health Read Models]
```

Text fallback: browser traffic reaches Enterprise Web through nginx. Enterprise Web loads session/permissions and calls real backend APIs or presentation BFF handlers for workflow, exception, audit, and evidence views.

## Deployment Controls

| Concern | Design |
|---|---|
| App runtime | Next.js app in Yarn/Turbo workspace, stateless and routeable through nginx. |
| Auth/session | Keycloak-backed subject and safe effective permissions loaded from Identity. |
| Permissions | Route/action visibility only; backend services enforce authorization. |
| API access | Typed/OpenAPI clients and BFF presentation routes; no direct database access. |
| Evidence panels | Lazy-load logs, traces, contracts, audits, and health evidence. |
| No fake completion | Mock/prototype data cannot satisfy readiness tests. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports shell, route, workflow, work queue, audit/exception, and visual stability targets. |
| `security-design.md` | Enforces session, route/action permissions, backend-enforcement posture, no secrets, audit-safe actions, and accessibility. |
| `scalability-design.md` | Supports users, route groups, enterprise flows, work queue items, and audit/exception rows. |
| `reliability-design.md` | Implements typed clients, degraded states, retry-safe actions, stale/conflict handling, errors, and no fake readiness. |
| `logical-components.md` | Maps to EnterpriseShell, SessionPermissionLoader, RoutePermissionGuard, TypedApiClientLayer, WorkQueueView, WorkflowScreenRouter, EvidencePanelManager, ErrorAndDegradedStatePresenter, AuditExceptionViews, and AccessibleComponentHarness. |
| `components.md` | Preserves Enterprise Web as presentation owner, not business-rule owner. |
| `services.md` | Uses Enterprise Web, nginx, Identity, Reference Data, Charge, Booking, CMM, and operations/evidence surfaces. |
| `business-logic-model.md` | Implements session loading, permission routing, work queue, real API/BFF calls, evidence, and exceptions. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps Enterprise Web as presentation/workflow shell and avoids backend business-rule ownership.
- Route/action permissions are explicitly hints; backend authorization remains mandatory.
- Mock/prototype logic cannot satisfy readiness because tests must use real API/event-backed evidence.
