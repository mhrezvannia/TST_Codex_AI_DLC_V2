# CI/CD Pipeline - U03

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run application-service tests with fake ports in Maven before adapter/API tests.

## Rollback

Revert use-case and port changes if tests reveal boundary coupling.
