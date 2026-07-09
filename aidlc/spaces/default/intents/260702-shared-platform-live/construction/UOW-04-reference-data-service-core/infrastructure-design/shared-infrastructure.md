# Shared Infrastructure - UOW-04 Reference Data Service Core

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Shared Resources

- PostgreSQL instance shared physically, schema owned by reference-data-service.
- identity-service dependency.
- Kafka/Schema Registry used by outbox unit.

## Boundaries

reference-data-service owns reference data; BFF owns presentation mapping.

