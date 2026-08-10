# Infrastructure Services - U04 Sign-Out and Session Expiry Guard

## Source Context

This infrastructure service design consumes U04 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U04 `business-logic-model.md`. It names the local services and configuration required for sign-out and stale-call safety.

## Service Inventory

| Service | Existing/New | U04 responsibility | Change |
| --- | --- | --- | --- |
| Nginx | Existing | Route shell/auth/sign-out/protected paths. | Reuse shell/auth routing; no cookie rewrite. |
| `apps-shell` | Existing from U01 | User menu and protected route checks. | Initiates existing auth sign-out only. |
| `apps-auth` | Existing | `POST /api/auth/sign-out`, `lc_session` clearing, Keycloak redirect. | Preserve owner and cookie semantics. |
| Keycloak | Existing | Logout redirect. | No new provider. |
| `apps-booking` | Existing | BFF stale-call early return. | Guard `proxyBooking`, `loadBookings`, `loadBooking`. |
| booking-service | Existing | Backend safety net and no-`local-user` observation. | Preserve blank actor rejection. |

## Configuration Contract

| Configuration | Owner | Rule |
| --- | --- | --- |
| Sign-out endpoint | `apps-auth` | `POST /api/auth/sign-out` is the only accepted logout route. |
| Cookie clear | `apps-auth`/packages auth | `lc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`. |
| Logout redirect | `apps-auth` | `authConfig.keycloakLogoutUrl` with `post_logout_redirect_uri=/signed-out`. |
| Missing actor code | Booking BFF | `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` with correlation id. |
| Covered BFF fan-in | `apps-booking` | `proxyBooking`, `loadBookings`, `loadBooking` before `serviceHeaders` and backend fetch. |

## Storage and Data Services

U04 adds no durable session store, cache, database, or queue. The session authority remains the existing HttpOnly cookie/auth route behavior.

## Service Discovery

Use existing Compose DNS and Nginx browser entry. `apps-shell` can reach `apps-auth` through the configured local route or internal URL, but the accepted proof must observe browser behavior through Nginx.

## Security Services

No new secrets management surface is introduced. Evidence must avoid raw cookie values, tokens, service tokens, and secrets. The only accepted cookie evidence is header attributes or browser cookie-cleared observation.

## Shared Infrastructure Boundary

U04 reuses U01 shell and U02 actor-hardening infrastructure. It does not change identity catalog, Booking domain persistence, W0-01 platform/eventing, W0-02 reference-data, or W2-02 design-system foundation.

