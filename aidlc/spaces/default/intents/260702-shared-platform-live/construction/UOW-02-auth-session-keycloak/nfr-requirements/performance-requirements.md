# Performance Requirements - UOW-02 Auth Session and Keycloak

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

| Scenario | Target |
| --- | --- |
| Safe session summary | p95 under 500 ms locally when dependencies are healthy. |
| Sign-in redirect creation | under 250 ms excluding Keycloak network time. |
| Sign-out cookie clear | under 250 ms. |

## Constraints

- Permission lookup may degrade gracefully if identity-service is unavailable.
- No long blocking retries inside request handlers.

