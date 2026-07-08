# Deployment Architecture - U06 Reference Data App

## Compute Model

`apps/reference-data` deploys as a Next.js App Router container with BFF route handlers. It is separate from `apps/auth` and owns presentation/session-adjacent workflows only, not reference domain state.

## Network Topology

Browser traffic reaches the app through Nginx. BFF handlers call `reference-data-service` for provider/admin/history/status data and `identity-service` for permission/session context. Backend services and databases are never called directly from browser code.

## Storage Strategy

The app stores no canonical reference data. Client/server state is bounded to UI/query cache and draft preservation. Canonical state remains in `reference-data-service` PostgreSQL.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Compose app behind Nginx with local backend dependencies. |
| Staging | Vault references, service routes, health/smoke evidence. |
| Production | Placeholder only; final scale/HA deferred. |

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
