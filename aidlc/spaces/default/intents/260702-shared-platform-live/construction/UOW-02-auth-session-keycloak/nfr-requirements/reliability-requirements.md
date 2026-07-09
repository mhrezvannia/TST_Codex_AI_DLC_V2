# Reliability Requirements - UOW-02 Auth Session and Keycloak

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Missing session returns unauthenticated summary, not 500.
- Invalid callback state clears transaction and returns controlled auth error.
- Keycloak unavailable is visible to the user and readiness output.
- Sign-out remains safe even when session cookie is absent.

## Degradation

- If identity-service permission lookup fails, return session with permission error metadata instead of token details.

