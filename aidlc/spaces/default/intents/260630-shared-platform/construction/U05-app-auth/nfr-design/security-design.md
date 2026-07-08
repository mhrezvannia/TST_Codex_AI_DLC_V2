# Security Design - U05 Auth Frontend App

## Security Goals

U05 delegates authentication to Keycloak 24 and exposes a safe BFF session surface to browser code. It protects tokens, validates redirects and OIDC replay defenses, minimizes session data exposure, and prevents UI-only authorization from becoming the system control.

## OIDC and Session Controls

The sign-in route creates state, nonce, and PKCE verifier server-side and stores transient values in secure HttpOnly cookies with environment-appropriate same-site and secure settings. The callback validates state, nonce, and PKCE before token exchange or session creation. Token exchange, token validation, refresh handling, and logout coordination are server-side only.

Application sessions are represented to the browser by HttpOnly cookies and safe session summaries. Browser JavaScript never receives access tokens, refresh tokens, ID tokens, PKCE verifier, nonce secrets, client secrets, raw provider responses, or raw sensitive claims.

## Authorization and Data Minimization

Current-session responses contain only display name, internal subject id, permitted email, platform roles, allowed permission summaries, policy version, and correlation id. Role and permission summaries come from `identity-service`, not frontend constants.

Route protection is a UX/session guard. Protected service operations still require backend/BFF/service authorization. Access-denied views do not expose raw permission internals, token claims, provider errors, stack traces, or internal URLs.

## Redirect and Error Safety

Return URLs are validated against approved local routes; invalid values fall back to the default app route. Auth, callback, sign-out, and dependency failures return safe user-readable messages with correlation ids.

Sign-out always clears the local app session even when Keycloak logout redirect construction fails.

## Audit and Logging

Structured logs capture auth failures, denied access, request-access submissions, sign-out failures, callback failure class, result category, subject where safe, operation, and correlation id. Logs exclude tokens, PKCE verifier, nonce secrets, client secrets, raw provider responses, and sensitive claims.

Request-access captures safe subject context, requested resource/action where known, supplied user message, and correlation id; it does not grant or modify permissions.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
