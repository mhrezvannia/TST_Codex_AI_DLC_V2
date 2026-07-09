# NFR Requirements Questions - UOW-05 Reference Data BFF Clients

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Answers

- BFF latency target: p95 under 1 second locally for list/detail/mutation proxy calls.
- Security target: browser never calls Java services directly; no token exposure.
- Reliability target: service-down errors map to 503 with correlation id.

