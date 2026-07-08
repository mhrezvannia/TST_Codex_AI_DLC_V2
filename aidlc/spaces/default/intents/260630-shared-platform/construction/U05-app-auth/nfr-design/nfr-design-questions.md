# NFR Design Questions - U05 Auth Frontend App

## Scope

This file records design questions resolved during NFR Design for `U05-app-auth`.

## Resolved Questions

### Q1. Where should OIDC and token handling run?

OIDC state, nonce, PKCE verifier storage, authorization-code exchange, token validation, refresh handling, logout coordination, and session creation all run in BFF/server-side code. Browser JavaScript receives only a safe session summary and never receives access tokens, refresh tokens, ID tokens, PKCE verifier, nonce secrets, client secrets, raw provider responses, or sensitive claims.

### Q2. How lightweight should route protection be?

`proxy.ts` performs only session-shape and protected-route checks needed for redirects and user experience. It must not perform full authorization evaluation or call multiple backend services on every route request. Authoritative authorization remains in BFF/server calls to `identity-service` and downstream service APIs.

### Q3. How should dependency failures affect users?

Keycloak configuration, authorization endpoint, token exchange, and logout failures produce safe user states with correlation ids. Identity-service session-summary failure produces a recoverable session/authorization state without exposing token internals. Local app session clearing succeeds independently from Keycloak logout redirect construction.

### Q4. How does U05 avoid becoming a security-admin portal?

Request-access captures safe subject context, requested resource/action where known, user message, and correlation id, then routes or records the request through the MVP support path. It never grants permissions automatically and does not implement full permission-review administration.

### Q5. How should the app scale as an entrypoint?

`apps/auth` stays separate from `apps/reference-data` and other domain apps. It uses shared packages for session types, API correlation behavior, and UI components, while keeping safe session payloads compact and request-access routing configurable.

## Open Questions

No blocking questions remain for this stage. Environment-specific cookie same-site posture, exact request-access target, and final Keycloak logout URL details can be bound during implementation/configuration without changing the design.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
