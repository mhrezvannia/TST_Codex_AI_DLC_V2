# Business Rules - UOW-01 Local Runtime Packaging

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Rules

1. Missing Java, Maven, or Docker is a prerequisite blocker, not a test failure.
2. Compose must not depend on undiscoverable local images without a build or dev profile.
3. Ports must be checked before service startup.
4. Local/on-prem Compose remains the topology; public cloud substitution is out of scope.
5. Quality evidence may be partial only when the output explicitly marks blocked prerequisites.

## Validation

- Node and Yarn versions are recorded.
- Java release must satisfy Java 21.
- Maven must satisfy 3.9+.
- Docker daemon must respond before Compose runtime checks.
- Required ports include auth app, reference-data app, Keycloak, PostgreSQL, Kafka, Schema Registry, Nginx, and observability profile ports.

