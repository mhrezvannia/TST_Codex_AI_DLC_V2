# Infrastructure Design Questions - U06 Reference Data App

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U06-app-reference-data`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Deploy `apps/reference-data` as a separate Next.js App Router container behind Nginx with BFF route handlers for reference APIs, identity permissions, event status, and contract views.

### Q2. Compute/storage/networking

[Answer]: Browser traffic goes through Nginx. BFF routes call `reference-data-service` and `identity-service` server-side. The app stores no canonical domain data and does not call service databases.

### Q3. Monitoring approach

[Answer]: Monitor list/detail/search/filter, form submit, status command, event-status, identity-service latency, reference-data-service latency, validation/conflict frequency, and correlation id support states.

### Q4. CI/CD pipeline

[Answer]: Run Yarn/Turborepo install, TypeScript strict, lint, tests, accessibility-relevant checks, package-policy checks, build, and smoke for denied/read-only/list/detail/one authorized mutation/status display.

### Q5. Secrets management

[Answer]: Browser code receives no service credentials. Non-local BFF service credentials, cookie/session config, and telemetry credentials use Vault references.

### Q6. Scaling policy

[Answer]: Scale app containers horizontally. Keep list/detail/status calls paginated and BFF-governed; do not use browser-side full dataset caches or local replicas.

## Ambiguity Analysis

No blocking ambiguity remains. Full mobile editing and downstream module screens remain outside this unit.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
