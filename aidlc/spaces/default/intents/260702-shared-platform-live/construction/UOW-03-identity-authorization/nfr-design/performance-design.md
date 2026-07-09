# Performance Design - UOW-03 Identity Authorization

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Index role assignments by subject id and active status.
- Cache static role/permission catalog in memory.
- Keep policy evaluation pure and allocation-light.

## Budgets

- Authorization p95 under 300 ms locally.
- Effective permissions p95 under 500 ms locally.

