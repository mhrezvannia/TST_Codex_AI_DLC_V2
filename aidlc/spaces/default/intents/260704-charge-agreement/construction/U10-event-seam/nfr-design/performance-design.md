# Performance Design - U10

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Fact creation is in-memory and cheap. Live broker performance is deferred until Kafka is available.

## Validation

Unit tests verify publisher port calls without starting Kafka.
