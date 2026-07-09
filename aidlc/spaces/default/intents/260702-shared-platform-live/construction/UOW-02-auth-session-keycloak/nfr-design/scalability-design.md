# Scalability Design - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Keep Auth BFF stateless aside from client cookies.
- Avoid in-memory session maps.
- Externalize Keycloak and identity-service URLs through env/config.

## Capacity

- Supports one local app instance now and multiple stateless instances later.

