# Frontend Components - UOW-02 Auth Session and Keycloak

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Components

| Component | Responsibility | State |
| --- | --- | --- |
| SignInActions | Continue with Keycloak or local bypass if enabled. | idle, redirecting, unavailable |
| SessionSummaryPanel | Shows safe subject, roles, permissions, auth mode, correlation id. | unauthenticated, authenticated, local-bypass |
| AuthStatusChip | Labels Keycloak, local, or unavailable state. | keycloak, local-bypass, error |

## Interaction Rules

- Sign-in action is first keyboard action.
- Local bypass button appears only when server reports enabled.
- Session summary uses visible text and description-list semantics.
- Error states include correlation id where available.

