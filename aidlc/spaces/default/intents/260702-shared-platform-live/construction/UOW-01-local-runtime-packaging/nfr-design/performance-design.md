# Performance Design - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Run independent tool checks in sequence or bounded parallel groups with per-check timeout.
- Avoid Compose startup when Docker daemon check fails.
- Write evidence once after checks finish to avoid repeated filesystem churn.

## Budgets

| Check | Timeout |
| --- | --- |
| Node/Yarn version | 2 seconds each |
| Java/Maven version | 3 seconds each |
| Docker info | 5 seconds |
| Port scan | 5 seconds total |

