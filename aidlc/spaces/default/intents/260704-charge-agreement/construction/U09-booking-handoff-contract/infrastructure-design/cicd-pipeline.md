# CI/CD Pipeline - U09

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run active-lookup contract tests before allowing Booking implementation to start.

## Rollback

Treat breaking active-lookup changes as contract-breaking and block merge.
