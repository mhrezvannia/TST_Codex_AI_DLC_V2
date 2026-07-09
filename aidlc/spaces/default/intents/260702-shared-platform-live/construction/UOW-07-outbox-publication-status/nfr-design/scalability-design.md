# Scalability Design - UOW-07 Outbox Publication Status

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Batch publisher supports 1 to 100 events.
- Worker id claim model allows future multi-worker extension.
- Status query filters prevent unbounded reads.

## Growth

- Downstream consumers can subscribe later without changing mutation transaction.

