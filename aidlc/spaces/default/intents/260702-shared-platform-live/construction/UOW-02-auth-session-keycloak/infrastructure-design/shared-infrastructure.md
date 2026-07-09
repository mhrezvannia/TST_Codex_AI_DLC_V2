# Shared Infrastructure - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Shared Resources

- Keycloak realm/client/users shared with seed apply.
- identity-service shared with Reference Data BFF/service.
- Nginx shared local gateway.

## Boundaries

Auth app owns session summary, not authorization policy.

