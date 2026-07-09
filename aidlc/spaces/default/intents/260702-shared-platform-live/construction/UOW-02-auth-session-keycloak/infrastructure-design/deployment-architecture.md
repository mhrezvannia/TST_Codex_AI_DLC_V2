# Deployment Architecture - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Architecture

- `apps-auth` runs as Next.js app container or dev process.
- Keycloak runs in Compose with deterministic realm/client/user bootstrap.
- Auth app routes through Nginx or direct local port during development.

## Storage

Session state is cookie-based; Keycloak owns identity provider state.

