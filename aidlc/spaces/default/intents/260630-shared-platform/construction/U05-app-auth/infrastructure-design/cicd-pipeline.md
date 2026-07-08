# CI/CD Pipeline - U05 Auth App

## Pipeline Stages

U05 uses the frontend quality-gate pattern:

| Stage | Checks |
|---|---|
| Install | Yarn/Turborepo from locked dependencies. |
| Type | TypeScript strict checks. |
| Lint | Frontend lint and package-policy checks. |
| Tests | Unit/component tests for pages, route handlers, validation, and safe errors. |
| Accessibility | Checks for sign-in, signed-out, access-denied, session display, and request-access states where configured. |
| Build | Next.js app build and container image with deterministic tag. |
| Smoke | Sign-in/local equivalent, session display, access denied, sign-out, and correlation id evidence. |

## Deployment Stages

Local deployment uses Compose with Nginx, Keycloak, and identity-service. Non-local deployment uses Vault references, callback URL config, readiness checks, and smoke evidence.

## Rollback

Rollback relies on immutable image tags, compatible session/cookie configuration, and safe sign-out/session-clearing behavior. Permission state is owned by U02 and is not rolled back by the auth app.

## Secrets in CI/CD

CI logs redact cookie secrets, Keycloak secrets, service credentials, tokens, and Vault values. npm/pnpm workflows and prohibited frontend libraries fail gates.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
