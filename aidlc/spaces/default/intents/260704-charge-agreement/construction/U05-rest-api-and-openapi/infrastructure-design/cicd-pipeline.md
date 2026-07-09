# CI/CD Pipeline - U05

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run controller/API tests, OpenAPI contract validation, and smoke checks after backend build.

## Rollback

Revert endpoint/controller and contract changes together if compatibility breaks.
