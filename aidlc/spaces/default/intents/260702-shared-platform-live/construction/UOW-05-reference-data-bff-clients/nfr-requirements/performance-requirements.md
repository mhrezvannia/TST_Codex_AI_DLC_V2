# Performance Requirements - UOW-05 Reference Data BFF Clients

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

| Scenario | Target |
| --- | --- |
| Permission lookup route | p95 under 700 ms locally. |
| Reference list/detail BFF route | p95 under 1 second locally. |
| Mutation BFF route | p95 under 1.5 seconds locally excluding async publication. |

## Constraints

- BFF should avoid duplicate service calls per request.
- Timeouts should be shorter than browser-perceived hang thresholds.

