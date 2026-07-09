# NFR Design Questions - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define UI performance budgets, route/action permission controls, backend enforcement, accessibility, scale baseline, degraded states, typed API clients, stale-state handling, and the integrated Next.js stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Typed API clients, visible degraded states, retry-safe idempotent actions, stale/conflict detection, actionable errors, and no mock readiness. |
| Scalability | First release supports 50 local users, 10 route groups, enterprise flows 1 through 5, 5,000 work queue items, and 10,000 audit/exception rows. |
| Performance | Shell usable <= 3 seconds, cached route transition p95 <= 500 ms, workflow screen p95 <= 2 seconds, work queue p95 <= 1.5 seconds. |
| Security | Keycloak session, route/action capability checks, backend enforcement, no client secrets, audit-safe actions, and WCAG-oriented accessibility. |
| Logical boundaries | Enterprise Web owns presentation, workflow orchestration UI, and evidence display; backend services own business rules and enforcement. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact route hierarchy, component names, and test IDs are implementation details constrained by this design.
