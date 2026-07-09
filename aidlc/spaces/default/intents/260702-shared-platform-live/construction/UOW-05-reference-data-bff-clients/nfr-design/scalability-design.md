# Scalability Design - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Keep route handlers stateless.
- No static mutable record source of truth.
- Future caching can be added only for read endpoints and must be invalidated after mutations.

## Capacity

- Local target: 20 concurrent BFF requests without shared-state corruption.

