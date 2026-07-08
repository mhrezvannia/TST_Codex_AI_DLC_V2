# Reliability Requirements - U05 Auth Frontend App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines failure behavior for sign-in, callback, session creation, sign-out, access denied, request access, and route protection. `business-rules.md` requires safe errors, session clearing on sign-out, validated return URLs, correlation propagation, and no token exposure. `requirements.md` fixes NFR-005, NFR-012, NFR-013, and Keycloak/on-prem assumptions.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Sign-in | Existing valid sessions redirect safely; missing config returns safe correlation-linked error. |
| Callback | State/nonce/PKCE mismatch clears transient cookies and fails safely. |
| Session creation | Partial sessions are cleared on failure. |
| Current session | Invalid or expired sessions return unauthenticated state without exposing internals. |
| Sign-out | Local app session is cleared even if Keycloak logout redirect cannot be completed. |
| Access denied | Denied users see stable guidance and request-access path, not broken routes. |

## Dependency Failure Behavior

| Dependency | Failure behavior |
|---|---|
| Keycloak authorization endpoint | Show safe sign-in unavailable/configuration error with correlation id. |
| Keycloak token exchange | Clear transient cookies and show retry/support message. |
| `identity-service` session summary | Show recoverable session/authorization state without token exposure. |
| Request-access route target | Show support instructions or queued failure state without granting access. |

## Health and Smoke Requirements

- App/BFF health route must support Nginx, smoke checks, and staging readiness.
- Walking skeleton must prove sign-in or approved local equivalent, session display, access denied, and correlation id evidence.
- Auth paths must be included in E2E/smoke checks before production promotion.
- Accessibility checks should cover sign-in, signed-out, access-denied, session display, and request-access states.

## Recovery Requirements

- Clearing local session must be possible independently from upstream Keycloak logout success.
- Safe return URL fallback prevents users from being trapped by invalid redirects.
- Correlation id must let support link UI errors to BFF logs and Keycloak/identity-service dependency failures.

## Non-Goals

- No final production SLA/SLO.
- No direct repair of Keycloak sessions.
- No permission-grant workflow in request-access.

