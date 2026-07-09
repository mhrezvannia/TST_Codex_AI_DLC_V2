# Infrastructure Design Questions - UOW-04 Reference Data Service Core

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Answers

- Deployment: `reference-data-service` Java service in local Compose/dev profile.
- Storage: PostgreSQL records, history, outbox.
- Monitoring: service health, mutation/error counts, persistence health.

