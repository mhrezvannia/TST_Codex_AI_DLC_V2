# Reliability Design - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means the UI presents real service-backed state, handles degraded backends honestly, and keeps command actions safe.

## Reliability Patterns

| Control | Design |
|---|---|
| Typed API clients | UI calls typed/generated clients or contract-backed wrappers where available. |
| Degraded states | Service degradation is visible in route, workflow, work queue, evidence, and health panels. |
| Retry-safe actions | Mutating commands use idempotency keys where service contracts require them. |
| Stale state | UI detects stale/conflicting versions and surfaces reload/resolve actions. |
| Error handling | Errors include actionable message, source service, correlation ID where available, and no hidden blocker. |
| No fake readiness | Mock/prototype logic cannot prove workflow completion. |

## State Model

Routes render explicit states: loading, ready, empty, degraded, stale, conflict, unauthorized, forbidden, failed, and partial. Partial evidence is shown as partial rather than green.

## Command Safety

Mutating actions carry subject, reason where required, idempotency key where required, correlation ID, and the current resource version. On conflict, the UI does not overwrite; it surfaces reload or resolve actions.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements typed clients, degraded states, retry-safe actions, stale/conflict handling, errors, and no fake readiness. |
| `performance-requirements.md` | Keeps degraded and loading states visible without replacing real API calls with mock state. |
| `security-requirements.md` | Preserves backend enforcement, audit context, route/action permissions, and accessibility. |
| `scalability-requirements.md` | Supports reliable workflow state across route, queue, audit, and exception scale. |
| `tech-stack-decisions.md` | Uses Next.js, React Query, Axios, TypeScript, shared packages, Vitest, React Testing Library, and UI/E2E tests. |
| `business-logic-model.md` | Implements API/BFF calls, evidence, exceptions, audit views, and workflow state handling. |
