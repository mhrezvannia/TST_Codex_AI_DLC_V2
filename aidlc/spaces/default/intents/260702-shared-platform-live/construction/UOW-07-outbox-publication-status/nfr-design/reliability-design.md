# Reliability Design - UOW-07 Outbox Publication Status

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Persist outbox before any publish attempt.
- Retryable failures set status retrying and next attempt time.
- Permanent failures set failed with code/message.
- Published status records broker metadata only after successful send.

## Degradation

- Kafka down: retrying, not published.
- Schema Registry down: retrying.
- Incompatible schema: failed with evidence.

