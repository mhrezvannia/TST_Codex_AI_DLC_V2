# Performance Design - UOW-04 Reference Data Service Core

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Use paged list queries with bounded page size.
- Index by reference set, active status, code, and id.
- Keep publication asynchronous through outbox.
- Avoid loading all reference sets for one-set list calls.

## Budgets

- List p95 under 500 ms locally.
- Mutation p95 under 750 ms locally excluding async publish.

