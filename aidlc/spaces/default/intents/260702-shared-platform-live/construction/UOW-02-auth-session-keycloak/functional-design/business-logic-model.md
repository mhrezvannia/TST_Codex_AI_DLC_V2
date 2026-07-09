# Business Logic Model - UOW-02 Auth Session and Keycloak

## Context

This Functional Design consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Workflow

1. User opens sign-in.
2. Auth BFF creates OIDC transaction and redirects to Keycloak.
3. Callback validates state and exchanges or records local session context.
4. Auth BFF requests effective permissions from identity-service when available.
5. Session API returns safe summary with no tokens.
6. If `AUTH_BYPASS=true` and local profile permits it, local session is generated and labelled.

## Error Handling

- Missing session returns unauthenticated summary.
- Invalid state returns auth error and clears transaction.
- Keycloak unavailable returns service-down state.
- Identity unavailable returns authenticated session with permission lookup error if token/session is otherwise valid.

