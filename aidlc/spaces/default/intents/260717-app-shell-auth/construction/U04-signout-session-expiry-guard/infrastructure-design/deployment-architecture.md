# Deployment Architecture - U04 Sign-Out and Session Expiry Guard

## Source Context

This deployment architecture consumes U04 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U04 `business-logic-model.md`. It maps sign-out and stale-call containment to existing local Compose/Nginx/auth/Booking infrastructure.

## Compute Model

| Component | Deployment design | U04 role |
| --- | --- | --- |
| Nginx | Existing browser edge. | Routes shell protected paths and auth sign-out flow through accepted local entry. |
| `apps-shell` | Shell host from U01. | User menu initiation and protected-route reauth checks. |
| `apps-auth` | Existing auth route owner. | Owns `POST /api/auth/sign-out`, cookie clearing, and Keycloak logout redirect. |
| Keycloak | Existing auth runtime. | Receives logout redirect and returns to `/signed-out`. |
| `apps-booking` | Existing Booking BFF/UI container. | Stops stale calls before `serviceHeaders` and backend fetch. |
| booking-service | Existing Spring container. | Safety net rejects blank actor and must not see post-sign-out `local-user`. |

## Network Topology

```text
Sign-out: Browser -> Nginx -> apps-shell -> apps-auth -> Keycloak -> /signed-out
Stale call: Browser -> Nginx -> apps-shell/apps-booking BFF -> early fail-closed
```

Text fallback: The shell initiates sign-out but does not own logout internals. Existing auth clears `lc_session` and redirects through Keycloak. After sign-out, protected shell routes require login and stale Booking BFF calls return before booking-service.

## Route Plan

| Route | Runtime requirement |
| --- | --- |
| Shell user menu sign-out | Posts to existing `/api/auth/sign-out`; no client-only logout. |
| `/auth/` | Existing Nginx/auth route remains available for auth endpoints. |
| `/signed-out` | Existing auth/shell reachable route after Keycloak logout. |
| `/` and `/booking` after sign-out | Protected shell routes re-check session and require login. |
| Booking BFF fan-in | `proxyBooking`, `loadBookings`, `loadBooking` fail before backend fetch when actor is absent. |

## Environment Definitions

| Service | Required local configuration |
| --- | --- |
| `apps-auth` | Existing `authConfig.keycloakLogoutUrl`, session cookie helpers, and `SESSION_COOKIE_NAME=lc_session` behavior. |
| `apps-shell` | Sign-out action/form points to existing auth endpoint and uses server-side session checks. |
| `apps-booking` | BFF actor resolver available in every covered fan-in; no backend URL called on missing actor. |
| `booking-service` | Blank actor safety net remains enabled; no `local-user` fallback for stale protected requests. |

## Preservation Boundary

U04 deployment architecture does not introduce a parallel auth provider, shared session store, cookie-rewrite proxy, cache, polling worker, AWS service, or new runtime. It preserves W0-01, W0-02, W1-01, and W2-02 boundaries and keeps W1 waiver BLOCKED at `compose-start`.

