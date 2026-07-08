# Deployment Architecture - U05 Auth App

## Compute Model

`apps/auth` deploys as a Next.js App Router container with BFF route handlers. It is separate from `apps/reference-data` and does not absorb reference admin or security-admin workflows.

The app can scale horizontally when session cookie/signing configuration is consistent across instances and server-side session validation remains deterministic.

## Network Topology

Browser traffic reaches `apps/auth` through Nginx over approved HTTPS routing. Server-side BFF routes call Keycloak for OIDC authorization/token/logout flows and `identity-service` for effective permission/session summaries.

Browser-visible code never calls Keycloak token endpoints, `identity-service`, or backend services directly.

## Session and Storage Strategy

OIDC transient values and app session envelopes use secure HttpOnly cookie/session mechanisms. Session summaries returned to browser code are safe projections only. No password store, token store in browser storage, Redux auth store, or custom identity provider is introduced.

Request-access storage/routing is configurable and does not grant permissions.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Compose app, local Keycloak realm/client, local identity-service, dev-only secrets. |
| Staging | Vault references, callback URL config, Nginx route, smoke evidence. |
| Production | Placeholder only; final HA/session policy is deferred. |

## Resource Sizing

Initial sizing is lightweight because U05 is an entrypoint/session app. Scale is driven by concurrent sessions, callback rate, current-session rate, and request-access submissions.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
