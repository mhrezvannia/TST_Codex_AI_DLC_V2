# CI/CD Pipeline - U07

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run BFF/client tests with mocked Shared Platform services and smoke checks against live host-runtime services when available.

## Rollback

Revert integration clients independently from reference-data service code.
