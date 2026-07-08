# CI/CD Pipeline - U06 Reference Data App

## Pipeline Stages

| Stage | Checks |
|---|---|
| Install | Yarn/Turborepo from locked dependencies. |
| Type/lint | TypeScript strict and lint. |
| Tests | Unit/component/BFF behavior tests. |
| Accessibility | List/detail/forms/status/denied/read-only checks where configured. |
| Package policy | Reject prohibited package managers/libraries. |
| Build | Next.js build and deterministic image tag. |
| Smoke | Authenticated access, denied/read-only behavior, list/detail, one mutation, event status display. |

## Deployment Stages

Local uses Compose behind Nginx. Non-local deployment uses Vault references, backend service routes, readiness, smoke evidence, and registry tags.

## Rollback

Rollback uses immutable image tags and preserves backend canonical state. Draft/client cache state is disposable.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
