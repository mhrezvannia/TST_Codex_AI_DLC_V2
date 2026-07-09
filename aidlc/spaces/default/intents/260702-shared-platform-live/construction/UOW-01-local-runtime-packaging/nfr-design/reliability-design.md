# Reliability Design - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Normalize statuses as `ready`, `blocked`, `warning`, `failed`.
- Every blocker includes remediation text.
- Evidence writes use temp file then rename where practical.
- Script exits nonzero only for blocked/fatal states when used as gate.

## Degradation

- Docker unavailable skips Compose checks.
- Java/Maven unavailable skips backend compile/test checks.

