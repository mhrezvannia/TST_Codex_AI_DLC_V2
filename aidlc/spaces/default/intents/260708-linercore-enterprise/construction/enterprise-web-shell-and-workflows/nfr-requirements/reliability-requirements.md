# Reliability Requirements - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means the UI presents real service-backed state, handles degraded backends honestly, and keeps command actions safe.

## Reliability Controls

| Control | Requirement |
|---|---|
| Typed API clients | UI calls typed/generated clients or contract-backed wrappers where available. |
| Degraded states | Service degradation is visible in route/workflow status. |
| Retry-safe actions | Mutating commands use idempotency keys where service contracts require them. |
| Stale state | UI detects stale/conflicting versions and surfaces reload/resolve actions. |
| Error handling | Errors include actionable message, source service, correlation ID where available, and no hidden blocker. |
| No fake readiness | Mock/prototype logic cannot prove workflow completion. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines API/BFF calls, evidence, exceptions, and audit views. |
| `business-rules.md` | Defines no business-rule ownership and no fake prototype logic. |
| `requirements.md` | Supplies FR-UI, NFR-REL, NFR-OBS, and no-fake-completion constraints. |
| `technology-stack.md` | Supplies Next.js, React Query, Axios, TypeScript, and shared packages. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |
