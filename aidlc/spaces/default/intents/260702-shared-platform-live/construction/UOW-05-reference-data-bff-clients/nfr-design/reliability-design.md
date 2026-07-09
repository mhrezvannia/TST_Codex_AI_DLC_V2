# Reliability Design - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Timeout service calls.
- Map identity unavailable to permission unavailable.
- Map reference-data unavailable to service-down state.
- Include correlation id on all errors.
- Never fall back to local accepted drafts for mutation success.

## Degradation

- Read-only mode can render on permission denial; mutation simulation is prohibited.

