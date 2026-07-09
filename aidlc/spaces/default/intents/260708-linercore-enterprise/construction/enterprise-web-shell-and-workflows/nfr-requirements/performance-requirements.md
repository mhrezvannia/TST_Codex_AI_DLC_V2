# Performance Requirements - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Enterprise Web performance targets cover authenticated shell load, navigation, API-backed workflows, work queues, exception views, audit views, and evidence panels.

## UI Performance Targets

| Operation | Target |
|---|---|
| Authenticated shell usable | <= 3 seconds locally after auth callback completes. |
| Route transition with cached data | p95 <= 500 ms. |
| Primary API-backed workflow screen | p95 <= 2 seconds under seeded local load. |
| Work queue paginated load | p95 <= 1.5 seconds for seeded data. |
| Audit/exception paginated load | p95 <= 2 seconds for seeded data. |

## Frontend Constraints

- UI responsiveness cannot be achieved by replacing real API/event-backed state with mock state.
- Dense operational screens must avoid layout shift and text overlap under expected data volumes.
- Slow backend responses surface loading/degraded/error states without hiding blockers.

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines session loading, permission routing, work queue, API/BFF calls, evidence, and exceptions. |
| `business-rules.md` | Defines real API/event-backed workflow and no-prototype-logic rules. |
| `requirements.md` | Supplies FR-UI, FR-E2E, NFR-OBS, and no-fake-completion constraints. |
| `technology-stack.md` | Supplies Next.js, React, TypeScript, React Query, Axios, Yarn/Turbo, and shared package context. |
| `nfr-requirements-questions.md` | Q1 sets UI performance targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- UI NFRs are measurable across shell load, route transition, API-backed workflow screens, work queues, and audit/exception views.
- Security and accessibility requirements preserve backend authorization, client secret safety, capability-based route/action behavior, and WCAG-oriented keyboard/label/status expectations.
- Reliability requirements make degraded service states visible and prohibit mock/prototype business logic as readiness evidence.
- Technology decisions correctly use a new integrated Next.js app with existing shared packages and Claude UI as visual baseline only.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact route/data loading patterns, error/degraded-state contracts, and accessibility acceptance checks.
- Build and Test must prove route permissions, denied paths, API-backed state, no mock completion, and UI performance budgets.
