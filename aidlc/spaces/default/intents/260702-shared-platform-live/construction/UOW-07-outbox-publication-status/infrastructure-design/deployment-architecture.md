# Deployment Architecture - UOW-07 Outbox Publication Status

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Architecture

- Outbox state is stored in reference-data-service PostgreSQL schema.
- Publisher runs inside reference-data-service path for local B01.
- Kafka and Schema Registry run as Compose backing services.

## Compute

One local service instance and bounded publish batches.

