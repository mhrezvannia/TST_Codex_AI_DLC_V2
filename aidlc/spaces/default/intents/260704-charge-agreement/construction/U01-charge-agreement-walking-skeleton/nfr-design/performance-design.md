# Performance Design - U01

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep `/actuator/health` and module-info in-memory and dependency-free. The UI shell loads local static view-model defaults before any status polling.

## Validation

Host-runtime smoke checks call backend health/module-info and UI route with bounded HTTP timeouts.
