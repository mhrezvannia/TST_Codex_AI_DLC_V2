# Reliability Requirements - UOW-03 Identity Authorization

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Authorization denial is deterministic for unknown or missing subjects.
- Persistence outage produces controlled service error, not allow-by-default.
- Audit append failure for role assignment changes fails the change.
- Read-only catalog remains available if assignment persistence is down only where safe.

## Recovery

- Local seed re-apply can restore role assignments.
- Readiness reports identity persistence blockers separately.

