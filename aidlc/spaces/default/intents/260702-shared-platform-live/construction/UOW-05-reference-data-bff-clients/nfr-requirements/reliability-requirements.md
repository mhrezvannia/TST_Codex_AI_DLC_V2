# Reliability Requirements - UOW-05 Reference Data BFF Clients

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- identity-service unavailable maps to permission-service unavailable state.
- reference-data-service unavailable maps to service-down state.
- BFF must not fall back to fixture success for mutations.
- Every error response includes correlation id.

## Degradation

- Read-only UI state may render when permission service denies or is unavailable, but mutation success must never be simulated.

