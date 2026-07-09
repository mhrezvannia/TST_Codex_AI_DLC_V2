# Performance Design - UOW-07 Outbox Publication Status

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Use bounded outbox claim size.
- Publish outside mutation response path.
- Reuse Kafka/Schema Registry clients where adapter lifecycle allows.
- Query statuses by indexed event id, record id, set, status, and time range.

## Budgets

- Claim 25 events under 1 second locally.
- Publish 25 events under 5 seconds locally with healthy broker/schema registry.

