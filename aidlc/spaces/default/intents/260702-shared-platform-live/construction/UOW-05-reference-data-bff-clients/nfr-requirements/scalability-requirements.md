# Scalability Requirements - UOW-05 Reference Data BFF Clients

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Stateless BFF route handlers.
- Support local and test-runner concurrency without shared mutable static record state.
- Preserve pagination/filter parameters rather than fetching everything.

## Capacity

- Local target: 20 concurrent BFF requests without cross-request state corruption.

