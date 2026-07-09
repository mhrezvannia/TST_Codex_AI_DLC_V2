# Business Rules - UOW-02 Auth Session and Keycloak

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Rules

1. Token values are never returned in session summaries.
2. Correlation id is included in every auth/session response.
3. Local bypass must be visibly labelled as local.
4. `safeReturnUrl` must reject unsafe external returns.
5. Session cookies are HTTP-only and scoped to the app path.
6. Permission lists come from identity-service where available, not static UI assumptions.

## Validation

- Session summary contains subject, display name, roles, permissions, policy version, auth mode, and correlation id.
- Sign-out clears session cookie.
- Access-request route preserves requested area and correlation id.

