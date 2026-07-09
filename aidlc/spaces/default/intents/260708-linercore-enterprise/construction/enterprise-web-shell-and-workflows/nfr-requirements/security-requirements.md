# Security Requirements - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Enterprise Web presents operational workflows but does not own backend business authorization.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Session | Keycloak-backed authenticated session. |
| Route/action permissions | Capability checks control visible routes/actions. |
| Backend enforcement | Backend services remain enforcement authorities; route hiding is not sufficient. |
| Client secrets | No secrets in client bundles or committed env files. |
| Audit-safe actions | Manual fallback, override, exception, and sensitive actions carry subject, reason, correlation, and audit context. |
| Accessibility | WCAG 2.1 AA-oriented keyboard access, labels, focus states, status text, and error summaries. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines session, permission routing, API calls, exceptions, and audit views. |
| `business-rules.md` | Defines UI boundary and evidence rules. |
| `requirements.md` | Supplies FR-UI, NFR-SEC, and audit requirements. |
| `technology-stack.md` | Supplies Next.js, React, TypeScript, shared auth packages, and API client context. |
| `nfr-requirements-questions.md` | Q2 sets security and accessibility controls. |
