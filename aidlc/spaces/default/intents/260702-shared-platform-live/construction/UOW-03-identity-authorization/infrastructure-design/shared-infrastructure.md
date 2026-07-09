# Shared Infrastructure - UOW-03 Identity Authorization

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Shared Resources

- PostgreSQL instance shared physically, schema owned by identity-service.
- Keycloak shared with auth.
- Compose network shared with apps and reference-data-service.

## Boundaries

identity-service owns authorization data; reference-data-service consumes decisions.

