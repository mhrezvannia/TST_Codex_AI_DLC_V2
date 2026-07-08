# Performance Requirements - U05 Auth Frontend App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines sign-in, callback, current session, sign-out, access-denied, request-access, route protection, and integration workflows. `business-rules.md` fixes server-side OIDC handling, safe sessions, route protection, correlation ids, WCAG expectations, and frontend stack constraints. `requirements.md` fixes NFR-004, NFR-012, NFR-013, NFR-015, C-004, C-005, and C-006.

## Target Requirements

| Requirement | U05 obligation |
|---|---|
| Sign-in responsiveness | Initial sign-in page and route handlers must avoid unnecessary client bundle and server dependency work. |
| Callback latency | BFF callback must measure Keycloak code exchange and identity-service session summary latency separately. |
| Current session | Session summary route must return safe payloads without blocking on unrelated app data. |
| Request access | Form validation must be fast and bounded with RHF/Zod. |
| Observability | Logs/traces must expose BFF, Keycloak, and identity-service timing with correlation id. |

## Performance Constraints

- Browser JavaScript must not call backend services directly for performance shortcuts.
- Token exchange and session creation remain server-side even if it adds BFF latency.
- Route protection in `proxy.ts` must be lightweight and avoid full authorization evaluation.
- Frontend app code must use TypeScript strict mode and approved packages without adding prohibited libraries.

## Measurement Requirements

- Measure sign-in route render time, callback handler duration, Keycloak exchange duration, identity-service session summary duration, sign-out handler duration, and request-access submit duration.
- Track auth error rates and callback failure classes.
- Preserve correlation id across BFF logs and safe user error states.
- CI must run frontend type/lint/test checks where configured.

## Non-Goals

- U05 does not own p95 reference read targets.
- U05 does not optimize by exposing tokens to browser code.
- U05 does not implement full permission-review administration.

