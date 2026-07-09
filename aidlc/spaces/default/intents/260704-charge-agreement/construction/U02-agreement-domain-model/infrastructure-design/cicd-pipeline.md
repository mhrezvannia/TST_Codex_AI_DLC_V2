# CI/CD Pipeline - U02

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run Maven unit tests for `domain-core` on every build.

## Rollback

Revert aggregate/value-object changes if invariants or module boundaries fail.
