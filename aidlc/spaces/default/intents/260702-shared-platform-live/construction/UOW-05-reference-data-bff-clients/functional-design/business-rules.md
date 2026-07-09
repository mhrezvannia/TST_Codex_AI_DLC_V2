# Business Rules - UOW-05 Reference Data BFF Clients

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Rules

1. Browser traffic never calls Java services directly.
2. BFF routes must not report successful mutation from local static arrays.
3. Every BFF response includes or propagates correlation id.
4. Unauthorized mutation returns 403 and does not persist.
5. Validation failures preserve user input shape and return field issues.
6. Service unavailable returns 503 with service name and recovery hint.

## Error Mapping

| Source | BFF response |
| --- | --- |
| no session | 401 |
| authorization deny | 403 |
| record not found | 404 |
| stale version | 409 |
| validation failure | 422 |
| service unavailable | 503 |

