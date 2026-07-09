# CI/CD Pipeline - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Pipeline

1. Typecheck `apps/auth` and auth package.
2. Run auth route/page tests.
3. Validate no token fields in session responses.
4. Run local Keycloak smoke when Docker is available.

## Rollback

Revert auth route changes; no database migration required in this unit.

