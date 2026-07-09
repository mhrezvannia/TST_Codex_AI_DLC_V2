# Reliability Requirements - UOW-04 Reference Data Service Core

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Record, history, and outbox state survive service restart.
- Create/update/deactivate either completes all required persistence writes or fails.
- Stale version conflicts never overwrite newer state.
- Duplicate active natural keys are rejected.

## Recovery

- Local reset/reseed path must be documented.
- Readiness must report PostgreSQL unavailability distinctly.

