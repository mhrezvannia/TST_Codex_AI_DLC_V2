# Shared Infrastructure - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Shared Resources

- Compose network.
- PostgreSQL.
- Keycloak.
- Kafka.
- Schema Registry.
- Nginx.
- Optional observability profile.

## Access Boundaries

Apps access services through configured endpoints. Browser traffic enters through BFF/Nginx, not Java services directly.

