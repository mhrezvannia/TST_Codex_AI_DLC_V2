# CI/CD Pipeline - U04

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run repository tests with in-memory fakes first and Postgres-backed checks when local/CI database is available.

## Rollback

Rollback schema and adapter changes together.
