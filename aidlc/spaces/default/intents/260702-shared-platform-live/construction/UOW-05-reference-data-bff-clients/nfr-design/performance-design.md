# Performance Design - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Create per-request BFF context with correlation id and service URLs.
- Use bounded fetch/axios timeouts.
- Avoid duplicate permission calls within one mutation request.
- Preserve pagination/filter query parameters.

## Budgets

- Permission p95 under 700 ms locally.
- List/detail p95 under 1 second locally.
- Mutation p95 under 1.5 seconds locally excluding async publish.

