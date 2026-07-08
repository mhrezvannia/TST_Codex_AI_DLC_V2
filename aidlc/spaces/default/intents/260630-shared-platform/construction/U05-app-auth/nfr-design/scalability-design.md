# Scalability Design - U05 Auth Frontend App

## Scalability Goals

U05 scales as a separate, lightweight Next.js App Router application and BFF surface for internal carrier staff authentication. It remains an entrypoint and support/session app, not a broad domain portal or IAM administration console.

## App Boundary

`apps/auth` stays separate from `apps/reference-data` and future domain applications. Other apps may link to sign-in, access-denied, signed-out, and current-session behavior, but U05 does not absorb their domain workflows.

Browser-visible code does not fan out to backend services. Backend calls use BFF route handlers and server utilities through approved shared package clients.

## Shared Package Strategy

U05 imports `@erp/auth`, `@erp/api-core`, `@erp/ui`, and `@erp/shared-types` for session models, API envelopes, correlation behavior, and UI components. It avoids duplicating authorization policy in frontend constants or global state.

Zustand may hold bounded UI state only, such as transient view state. It must not become a global permission cache or policy engine.

## Capacity Hooks

The app tracks concurrent sessions, callback rate, current-session route rate, sign-in failures, request-access submissions, Keycloak latency, and identity-service latency. Safe session summaries remain compact and can be cached within session validity constraints when implementation proves a need.

Request-access routing/storage remains configurable so later workflow changes do not require redesigning the auth app.

## Deployment Shape

Nginx route separation preserves the ability to scale auth app traffic independently from reference-data UI traffic. U05 does not introduce a customer identity scale model or enterprise IAM portal concerns into the MVP.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
