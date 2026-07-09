# Scalability Requirements - UOW-07 Outbox Publication Status

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Local publisher supports bounded batches of 1 to 100.
- Outbox query supports filters by event id, record id, reference set, status, and time range.
- Event model supports all nine MVP reference sets.

## Growth

- Downstream consumers can be added later without changing mutation transaction semantics.

