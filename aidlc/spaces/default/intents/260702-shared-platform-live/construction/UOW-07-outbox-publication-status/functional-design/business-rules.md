# Business Rules - UOW-07 Outbox Publication Status

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Rules

1. Every successful reference-data mutation creates an outbox event when outbox is configured.
2. Publisher must register or verify schema before publishing.
3. Kafka unavailable creates retrying status, not silent success.
4. Schema incompatibility creates failed contract/publication evidence.
5. Status queries must include correlation id or event/record identifiers for traceability.
6. Downstream consumers are out of scope for this intent.

## Retry Rules

- Retryable failures include temporary broker or registry unavailability.
- Permanent failures include incompatible schema or invalid payload shape.
- Retry intervals are explicit and visible in status.

