# Scalability Requirements - UOW-02 Auth Session and Keycloak

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Support local single-user and test-runner usage.
- Keep Auth BFF stateless except session cookie/transaction cookie.
- Avoid in-memory server session stores that break multi-process local runtime.

## Capacity

- Local target is 10 concurrent auth/session requests without stale shared mutable state.

