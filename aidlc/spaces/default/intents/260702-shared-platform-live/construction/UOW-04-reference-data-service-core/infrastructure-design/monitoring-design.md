# Monitoring Design - UOW-04 Reference Data Service Core

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Signals

- List/detail/mutation latency.
- Mutation success/validation/denial/conflict counts.
- PostgreSQL health.
- Outbox enqueue count.

## Logs

Log correlation id, set, operation, result, reason; avoid raw PII dumps.

