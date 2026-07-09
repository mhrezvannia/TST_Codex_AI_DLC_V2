# Infrastructure Design Questions - UOW-07 Outbox Publication Status

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Answers

- Deployment: reference-data-service publisher path plus Kafka/Schema Registry.
- Storage: PostgreSQL outbox table.
- Monitoring: publication status, retry/failure, broker metadata.

