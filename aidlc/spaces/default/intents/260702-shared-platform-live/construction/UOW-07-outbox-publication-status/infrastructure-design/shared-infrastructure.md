# Shared Infrastructure - UOW-07 Outbox Publication Status

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Shared Resources

- PostgreSQL outbox table.
- Kafka broker.
- Schema Registry.
- Avro contract catalog.

## Boundaries

reference-data-service publishes; downstream consumers are out of scope for this intent.

