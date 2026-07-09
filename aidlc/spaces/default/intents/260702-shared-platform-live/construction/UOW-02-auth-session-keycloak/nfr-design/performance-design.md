# Performance Design - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Keep session summary cookie parsing local and cheap.
- Bound identity-service permission lookup with timeout.
- Avoid synchronous retry loops in request handlers.

## Budgets

| Operation | Budget |
| --- | --- |
| Session cookie decode | 50 ms |
| Session summary without identity lookup | 250 ms |
| Session summary with identity lookup | 500 ms p95 locally |

