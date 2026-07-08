# Infrastructure Design Questions - U05 Auth App

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U05-app-auth`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Deploy `apps/auth` as a separate Next.js App Router container behind Nginx. BFF route handlers perform OIDC, session, current-session, sign-out, access-denied, and request-access operations.

### Q2. Compute/storage/networking

[Answer]: Route browser traffic through Nginx to the auth app. Server-side BFF routes call Keycloak and `identity-service`. Session state uses secure HttpOnly cookie/session infrastructure; browser JavaScript never receives tokens.

### Q3. Monitoring approach

[Answer]: Monitor sign-in route render, callback handler duration, Keycloak exchange latency, identity-service summary latency, current-session latency, sign-out latency, request-access submissions, auth error classes, and correlation ids.

### Q4. CI/CD pipeline

[Answer]: Run Yarn/Turborepo install from lockfile, TypeScript strict checks, lint, tests, accessibility-relevant checks, package-policy checks, container build, and auth smoke for sign-in/local equivalent, session display, access denied, and sign-out.

### Q5. Secrets management

[Answer]: Non-local Keycloak client secrets, cookie/session signing secrets, identity-service credentials, and telemetry credentials are Vault references. Local dev values are local-only and never browser-visible.

### Q6. Scaling policy

[Answer]: Scale auth app containers horizontally. Keep safe session summaries compact. Do not add direct browser-to-service shortcuts or duplicate authorization policy in frontend state.

## Ambiguity Analysis

No blocking ambiguity remains. Exact callback URLs, cookie same-site posture, and request-access target are environment/configuration bindings.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
