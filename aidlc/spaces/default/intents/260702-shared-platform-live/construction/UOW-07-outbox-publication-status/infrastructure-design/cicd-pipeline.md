# CI/CD Pipeline - UOW-07 Outbox Publication Status

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Pipeline

1. Domain event mapper tests.
2. Outbox repository tests.
3. Publisher adapter tests with mocked broker/registry.
4. Avro compatibility checks.
5. Runtime smoke when Docker is available.

## Rollback

Disable live publisher and leave outbox pending rather than losing events.

