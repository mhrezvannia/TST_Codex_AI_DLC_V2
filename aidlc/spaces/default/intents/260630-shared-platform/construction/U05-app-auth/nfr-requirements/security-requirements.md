# Security Requirements - U05 Auth Frontend App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines Keycloak sign-in/callback, server-managed app session, safe session summary, sign-out, access denied, request access, and route protection. `business-rules.md` prohibits custom auth, token exposure, unsafe return URLs, and raw provider errors. `requirements.md` fixes Keycloak 24, least privilege, access logging, transport security, frontend stack, and customer identity exclusion.

## Authentication and Session Requirements

- `apps/auth` delegates authentication to Keycloak 24.
- OIDC code exchange, token validation, refresh handling, and logout coordination happen server-side.
- Browser JavaScript must never receive access tokens, refresh tokens, id tokens, PKCE verifier, nonce secrets, or raw sensitive claims.
- Session cookies must be HttpOnly and configured with secure same-site behavior appropriate to the environment.
- Callback must validate state, nonce, and PKCE verifier before creating a session.

## Authorization and Data Minimization

- Current-session responses expose only session-safe summaries.
- Role and permission summaries come from `identity-service`, not frontend constants.
- Route protection is not a substitute for backend authorization checks.
- Access-denied pages must not reveal raw permission internals or token claims.
- Request-access submissions must not grant permissions automatically.

## Error and Redirect Security

- Return URLs must be validated to prevent open redirects.
- Auth failures return safe user-readable messages and correlation ids.
- Error pages must not expose token contents, client secrets, raw provider errors, stack traces, or internal URLs.
- Sign-out must clear the application session even when Keycloak logout redirect fails.

## Audit and Logging Requirements

- Auth failures, denied access, request-access submissions, and sign-out failures must produce structured logs with correlation id.
- Logs must not include tokens, PKCE verifier, nonce secrets, client secrets, or raw provider responses.
- Request-access capture includes safe subject context, requested resource/action where known, user message where supplied, and correlation id.

## Threat Considerations

| Threat | Required mitigation |
|---|---|
| Token theft through browser storage | Server-side token handling and HttpOnly cookies. |
| CSRF/OIDC replay | State, nonce, PKCE validation and same-site cookie posture. |
| Open redirect | Validated return URL and approved default route fallback. |
| Policy leakage | Safe access-denied messages and no raw permission internals. |
| UI-only authorization bypass | Backend/BFF/service authorization remains authoritative. |

## Non-Goals

- No custom authentication provider or password store.
- No customer-facing shipper/BCO identity.
- No full permission-review administration UI.

