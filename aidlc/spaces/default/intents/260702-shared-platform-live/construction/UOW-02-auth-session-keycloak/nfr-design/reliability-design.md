# Reliability Design - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Missing session returns unauthenticated summary.
- Invalid transaction clears cookie and returns controlled auth error.
- Keycloak-down state is explicit.
- Sign-out is idempotent.

## Degradation

- If identity-service is unavailable, return session plus permission lookup unavailable state instead of failing with 500.

