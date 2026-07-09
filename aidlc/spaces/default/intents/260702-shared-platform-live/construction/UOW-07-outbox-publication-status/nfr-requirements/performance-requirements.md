# Performance Requirements - UOW-07 Outbox Publication Status

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

| Scenario | Target |
| --- | --- |
| Claim 25 outbox events | under 1 second locally. |
| Publish batch of 25 | under 5 seconds locally when broker/schema services are healthy. |
| Event status query | p95 under 500 ms locally. |

## Constraints

- Batch size must be bounded.
- Publication must not block mutation response after outbox enqueue.

