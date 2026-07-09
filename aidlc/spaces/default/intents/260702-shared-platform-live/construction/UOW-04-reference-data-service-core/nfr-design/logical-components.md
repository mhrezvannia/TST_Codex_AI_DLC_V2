# Logical Components - UOW-04 Reference Data Service Core

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Components

| Component | Responsibility | Failure domain |
| --- | --- | --- |
| ReferenceDataApplicationService | Coordinates commands/queries. | Java service process. |
| ReferenceRepository | Records persistence. | PostgreSQL. |
| ReferenceChangeRepository | History persistence. | PostgreSQL. |
| OutboxRepository | Event state persistence. | PostgreSQL. |
| AuthorizationClientPort | Mutation authorization. | identity-service. |

## Shared Resources

- Reference-data PostgreSQL schema.
- identity-service endpoint.

