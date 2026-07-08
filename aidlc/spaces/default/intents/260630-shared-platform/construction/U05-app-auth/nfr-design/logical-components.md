# Logical Components - U05 Auth Frontend App

## Component Overview

`apps/auth` is a Next.js App Router application and BFF surface. It renders authentication-related pages, owns server-side OIDC interaction with Keycloak 24, creates and clears server-managed app sessions, retrieves safe session summaries from `identity-service`, and exposes correlation-linked auth support states.

## Components

### Sign-In Page

Renders the internal sign-in entrypoint. It detects existing valid session state where available, offers sign-in, and shows safe configuration or dependency errors with correlation id.

### OIDC Start Route Handler

Creates state, nonce, and PKCE verifier; stores transient values in secure HttpOnly cookies; validates the return URL; and redirects to the Keycloak authorization endpoint.

### Callback Route Handler

Validates state, nonce, and PKCE verifier, exchanges the authorization code server-side, validates the token response, creates the app session, retrieves a safe identity-service session summary, clears transient cookies, and redirects to the approved return URL or session page.

### Session Store and Cookie Envelope

Owns server-managed session creation, validation, expiration, and clearing. Browser code sees only HttpOnly cookie behavior and safe session summaries, never tokens or raw provider claims.

### Current Session BFF Endpoint

Reads the server-side session, validates session validity, calls or safely reuses the identity-service session summary within session constraints, and returns display-safe session data with correlation id.

### Sign-Out Handler

Clears the local app session independently from upstream logout success, builds a Keycloak logout redirect when configured, and routes users to the signed-out page.

### Access Denied Page

Renders safe denied-state guidance, correlation id, and request-access entrypoint. It does not expose raw permission internals, token claims, provider errors, or stack traces.

### Request Access Flow

Uses React Hook Form and Zod for bounded validation. It attaches safe subject context, requested resource/action where known, user message, and correlation id, then records or routes the request through the MVP support channel without granting permissions.

### Route Protection Proxy

Checks protected route patterns and basic session cookie presence/shape, redirects unauthenticated users to sign-in with a validated return URL, and avoids full authorization evaluation.

### Integration Adapters

Keycloak adapter handles server-side OIDC and logout URL construction. Identity-service adapter retrieves effective permissions/session summary through approved server-side REST/OpenAPI calls. `@erp/api-core` centralizes HTTP error envelopes and correlation behavior.

### Observability Layer

Emits structured logs, metrics, and traces for sign-in, callback, Keycloak exchange, identity-service summary, session creation, current-session, sign-out, denied access, request-access, and failure classes.

## Dependency Direction

Pages and route handlers depend on server utilities and shared package interfaces. Server utilities depend on Keycloak and identity-service adapters. Browser components do not depend on backend service clients, tokens, or authorization-policy internals.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.
