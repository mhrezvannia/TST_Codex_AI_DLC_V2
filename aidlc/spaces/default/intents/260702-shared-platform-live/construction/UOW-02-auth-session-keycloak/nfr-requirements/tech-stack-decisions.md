# Tech Stack Decisions - UOW-02 Auth Session and Keycloak

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Decisions

| Area | Decision |
| --- | --- |
| Auth app | Next.js 15 route handlers in `apps/auth`. |
| Shared auth types | `packages/auth`. |
| Identity provider | Keycloak 24 in local Compose. |
| Validation | Existing TypeScript helpers and focused Vitest tests. |

## Rationale

This matches the existing stack and avoids introducing a new auth framework before Keycloak local flow is proven.

