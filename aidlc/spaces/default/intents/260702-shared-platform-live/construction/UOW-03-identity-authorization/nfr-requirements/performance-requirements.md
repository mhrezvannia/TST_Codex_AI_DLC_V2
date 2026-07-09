# Performance Requirements - UOW-03 Identity Authorization

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

| Scenario | Target |
| --- | --- |
| Authorize request | p95 under 300 ms locally with PostgreSQL healthy. |
| Effective permissions | p95 under 500 ms locally. |
| Role catalog | p95 under 200 ms locally. |

## Constraints

- Authorization must avoid remote calls beyond subject resolution/persistence.
- Queries should use indexed subject id and role ids when PostgreSQL adapter is added.

