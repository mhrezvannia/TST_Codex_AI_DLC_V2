# Tech Stack Decisions - U05 Auth Frontend App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines `apps/auth`, BFF route handlers, Keycloak OIDC, session summaries from `identity-service`, and shared package use. `business-rules.md` mandates Next.js App Router, TypeScript strict mode, Yarn, Tailwind, TanStack Query where needed, Zustand for bounded UI state, React Hook Form/Zod, Axios through `@erp/api-core`, and `@erp/ui`. `requirements.md` fixes C-004, C-005, C-006, NFR-013, and NFR-015.

## Decision Summary

U05 uses the approved frontend stack and server-side BFF integration pattern. It does not introduce alternate auth libraries, browser token storage, or prohibited frontend packages.

## Frontend and BFF Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Framework | Next.js App Router and React | Mandated for frontend apps. |
| Language | TypeScript strict mode | Required by NFR-015. |
| Package manager/workspace | Yarn and Turborepo | Mandated; npm/pnpm lockfiles prohibited. |
| Styling/UI | Tailwind and `@erp/ui` | Approved UI stack and shared components. |
| Forms/validation | React Hook Form and Zod | Request-access validation and safe form handling. |
| Server data | TanStack Query where needed | Approved async-data package for session/status calls. |
| UI state | Zustand only for bounded UI state | Avoids duplicating authorization policy in frontend state. |
| HTTP client | Axios through `@erp/api-core` | Centralizes error envelope and correlation behavior. |
| Auth provider | Keycloak 24 via server-side OIDC | Binding authentication provider. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Browser token storage | Violates token safety and BFF model. |
| Direct browser-to-service calls | Violates U01/U05 boundary and security requirements. |
| Custom auth provider/password store | Violates Keycloak 24 constraint. |
| Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, Moment.js | Prohibited by project rules. |
| Full permission-review UI in U05 | Explicitly outside MVP scope. |

## Implementation Guidance for Later Units

- U05 uses U02 session/effective-permission APIs and must not duplicate role policy.
- U06 may link to auth/access-denied behavior but owns reference-data workflows.
- U08 must gate TypeScript, lint, tests, and accessibility-relevant checks.
- U10 must consume auth BFF logs, metrics, health, and correlation evidence.

