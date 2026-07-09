# CI/CD Pipeline - U06

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run Yarn workspace install, TypeScript checks, Vitest/RTL tests, and Next.js build for `apps/charge-agreements`.

## Rollback

Revert UI app and proxy route changes together if build or smoke fails.
