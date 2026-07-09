# CI/CD Pipeline - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Pipeline

1. TypeScript typecheck.
2. ESLint.
3. Vitest route tests.
4. BFF error-mapping tests.
5. E2E smoke later when services are available.

## Rollback

Revert BFF client route changes; no database migration owned by this unit.

