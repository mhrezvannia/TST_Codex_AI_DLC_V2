# Security Design - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Enterprise Web presents operational workflows but does not own backend business authorization.

## Security Controls

| Control | Design |
|---|---|
| Session | Keycloak-backed authenticated session with safe subject and permission summary. |
| Route/action permissions | Capability checks control visible routes and actions. |
| Backend enforcement | Backend services remain enforcement authorities; route hiding is advisory only. |
| Client secrets | No secrets in client bundles or committed env files. |
| Audit-safe actions | Manual fallback, override, exception, and sensitive actions carry subject, reason, correlation, and audit context. |
| Accessibility | WCAG 2.1 AA-oriented keyboard access, labels, focus states, status text, and error summaries. |

## API Boundary

UI calls typed/generated clients or BFF route handlers where aggregation is required for presentation. BFF handlers do not implement business rules and do not bypass service authorization.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements session, route/action permissions, backend enforcement, no client secrets, audit-safe actions, and accessibility controls. |
| `performance-requirements.md` | Keeps permission and audit context loading within shell and workflow budgets. |
| `scalability-requirements.md` | Scales route/action guards and accessible tables across route groups, queues, and audit rows. |
| `reliability-requirements.md` | Ensures denied/degraded/error states are visible and do not become hidden blockers. |
| `tech-stack-decisions.md` | Uses Next.js, React, TypeScript, shared auth packages, typed clients, and shared UI foundations. |
| `business-logic-model.md` | Implements session, permission routing, API calls, exceptions, and audit views. |
