# Performance Requirements - UOW-04 Reference Data Service Core

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

| Scenario | Target |
| --- | --- |
| List records, page size 25 | p95 under 500 ms locally. |
| Detail by id | p95 under 300 ms locally. |
| Create/update/deactivate | p95 under 750 ms locally excluding async publish. |
| History query | p95 under 500 ms locally. |

## Constraints

- Page size capped at 100.
- List and detail queries must not load all sets when one set is requested.

