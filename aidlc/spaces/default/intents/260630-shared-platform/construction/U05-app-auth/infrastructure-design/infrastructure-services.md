# Infrastructure Services - U05 Auth App

## Edge and Routing

Nginx routes browser traffic to `apps/auth` pages and BFF endpoints. Protected app routes use `proxy.ts` as a UX/session guard, not as the authoritative authorization control.

## Identity Provider

Keycloak 24 is the authentication provider. The BFF manages authorization-code + PKCE flow, callback validation, token exchange, token validation, and logout URL construction server-side.

## Authorization Service

`identity-service` supplies session-safe role/permission summaries. BFF routes call it server-side with correlation id and map failures into safe auth/session states.

## Secrets

Non-local Keycloak client secrets, cookie/session signing secrets, identity-service credentials, and observability/export credentials use Vault references. Local Compose values are development-only and must not be reused outside local.

## Caching and State

Safe session summaries may be cached only within session validity constraints. Zustand is limited to bounded UI state and must not hold tokens or duplicate authorization policy.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
