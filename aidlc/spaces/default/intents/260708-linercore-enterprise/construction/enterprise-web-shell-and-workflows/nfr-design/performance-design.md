# Performance Design - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Enterprise Web performance covers authenticated shell load, navigation, API-backed workflows, work queues, exception views, audit views, and evidence panels.

## UI Budgets

| Operation | Target | Design control |
|---|---|---|
| Authenticated shell usable | <= 3 seconds locally after auth callback. | Load session, permissions, shell chrome, and first route data separately with visible loading states. |
| Cached route transition | p95 <= 500 ms. | Route-level code splitting and React Query cache reuse. |
| Primary API-backed workflow screen | p95 <= 2 seconds. | Fetch page summary first; lazy-load heavy evidence drawers. |
| Work queue paginated load | p95 <= 1.5 seconds. | Server-backed pagination, filters, stable table dimensions, and no client full-scan. |
| Audit/exception paginated load | p95 <= 2 seconds. | Paginated/filterable views with deferred detail panels. |

## Data Loading Strategy

The shell loads identity and permissions first, then route summaries, then detail drawers/panels. Heavy evidence, audit detail, and exception history lazy-load on demand. Cached route transitions reuse typed query keys and invalidate only affected resources after mutations.

## Visual Stability

Dense operational screens use fixed table tracks, constrained panels, stable row heights, explicit overflow, and responsive detail drawers to avoid layout shift and text overlap under expected data volumes.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements shell load, route transition, workflow screen, work queue, audit/exception, and frontend constraints. |
| `security-requirements.md` | Keeps session, route/action permissions, audit-safe actions, and accessibility in UI paths. |
| `scalability-requirements.md` | Uses pagination, filters, lazy evidence, and code splitting for user/route/queue/audit scale. |
| `reliability-requirements.md` | Shows loading, degraded, stale, conflict, and error states without mock readiness. |
| `tech-stack-decisions.md` | Uses Next.js, React, TypeScript, typed/OpenAPI clients, Axios, React Query, shared packages, and UI tests. |
| `business-logic-model.md` | Implements session loading, permission routing, work queue, API/BFF calls, evidence, and exception workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design turns each UI performance target into concrete loading, caching, pagination, and lazy-detail controls.
- It preserves service-backed workflow state and rejects prototype business logic as readiness.
- Visual stability is addressed explicitly for dense operational screens.
- Residual implementation risk is in API summary endpoints, query-key discipline, and accessibility/performance test coverage.
