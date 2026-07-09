# CI/CD Pipeline - U01

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Add Maven module compile, frontend typecheck/build, and host-runtime smoke checks once the skeleton exists.

## Rollback

Revert the new service/app wiring and proxy route if skeleton checks fail.
