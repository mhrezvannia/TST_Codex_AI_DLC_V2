# NFR Design Questions - UOW-07 Outbox Publication Status

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Answers

- Design pattern: durable outbox, bounded publisher batches, retryable/permanent failure classification.
- Security design: contract-limited payloads and no secret/token event content.
- Reliability design: status updates only after actual publisher result.

