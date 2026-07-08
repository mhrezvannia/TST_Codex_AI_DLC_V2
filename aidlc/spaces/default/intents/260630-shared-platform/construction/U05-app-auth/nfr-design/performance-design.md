# Performance Design - U05 Auth Frontend App

## Performance Goals

U05 keeps the sign-in entrypoint, auth callback, current-session endpoint, sign-out handler, access-denied page, and request-access flow responsive while preserving the server-side BFF security model. It must not optimize by exposing tokens to browser code or letting browser-visible code call backend services directly.

## Render and Route Design

The sign-in, signed-out, access-denied, session display, and request-access views use Next.js App Router with server components where practical and client components only where interaction requires them. The initial sign-in route avoids loading unrelated domain data, large client bundles, or full authorization policy.

`proxy.ts` performs lightweight protected-route detection and basic session-cookie shape checks. It redirects unauthenticated users with a validated return URL and avoids full identity-service authorization calls in the route-protection path.

## BFF Handler Design

The callback handler measures state/nonce/PKCE validation, Keycloak code exchange, token validation, server-side session creation, and identity-service session-summary lookup as separate spans. The current-session handler returns compact safe session summaries and does not block on unrelated app data.

Request-access uses React Hook Form and Zod for bounded client/server validation. It stores or routes only the minimal safe context needed for human support review.

## Measurement

Metrics and traces cover sign-in render time, callback handler duration, Keycloak exchange duration, identity-service summary duration, current-session response time, sign-out handler duration, request-access submit duration, auth error classes, and callback failure classes. Every BFF log and safe user error state carries a correlation id.

CI should run the configured frontend type, lint, and test checks for `apps/auth` and shared package imports.

## Constraints

The design stays within Next.js App Router, React, TypeScript strict mode, Tailwind, `@erp/ui`, React Hook Form, Zod, TanStack Query where needed, Zustand only for bounded UI state, and Axios through `@erp/api-core`. It does not add prohibited frontend libraries or alternate auth libraries.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
