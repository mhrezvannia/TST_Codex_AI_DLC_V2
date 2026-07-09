# CI/CD Pipeline - enterprise-web-shell-and-workflows

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Gates

| Gate | Blocking rule |
|---|---|
| Typecheck/lint | TypeScript strict and ESLint pass with no explicit `any`. |
| Unit/component tests | Shell, permissions, routes, degraded states, evidence panels pass. |
| Contract/API tests | Calls use approved typed/OpenAPI clients or BFF handlers. |
| E2E workflow tests | Real API/event-backed workflows pass; mock/prototype logic cannot satisfy readiness. |
| Accessibility tests | Keyboard, focus, labels, status text, and error summaries pass. |
| Security tests | Route hiding is not treated as backend authorization. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests shell, route, queue, audit, and evidence budgets. |
| `security-design.md` | Enforces auth, permission, no-secret, and backend-enforcement gates. |
| `scalability-design.md` | Validates route/workflow/queue/audit scale. |
| `reliability-design.md` | Proves typed clients, degraded states, stale/conflict handling, and no fake readiness. |
| `logical-components.md` | Maps CI checks to Enterprise Web components. |
| `components.md` | Preserves frontend/backend boundaries. |
| `services.md` | Covers approved service integrations. |
| `business-logic-model.md` | Covers shell, routing, API/BFF, evidence, and exception workflows. |
