# Deployment Architecture - UOW-03 Identity Authorization

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Architecture

- Java Spring Boot service with local profile.
- Depends on PostgreSQL and Keycloak/subject resolution.
- Exposes internal identity endpoints to BFF and reference-data-service.

## Storage

Service-owned identity schema for role assignments and authorization audit.

