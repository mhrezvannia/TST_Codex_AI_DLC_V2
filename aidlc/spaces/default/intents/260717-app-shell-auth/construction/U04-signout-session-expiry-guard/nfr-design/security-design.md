# Security Design - U04 Sign-Out and Session Expiry Guard

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U04 security design proves session termination clears the server-recognized session and stale Booking calls cannot continue as `local-user`.

## Sign-Out Security Design

| Control | Design |
| --- | --- |
| Auth-owned endpoint | Shell sign-out posts to existing `POST /api/auth/sign-out`; client-only logout is not accepted. |
| Route owner | Existing `apps/auth/app/api/auth/sign-out/route.ts` remains the auth owner. |
| Cookie deletion | Response clears `lc_session` using `clearCookieHeader(SESSION_COOKIE_NAME)`, yielding `Path=/`, `HttpOnly`, `SameSite=Lax`, and `Max-Age=0`. |
| Logout redirect | Response redirects through `authConfig.keycloakLogoutUrl` with `post_logout_redirect_uri=/signed-out`. |
| Stale identity protection | Signed-out shell must not display stale user identity, raw tokens, or protected Booking data. |

## Stale-Call Guard Design

| Control | Design |
| --- | --- |
| Covered fan-in | `proxyBooking`, `loadBookings`, and `loadBooking` call a shared actor resolver before `serviceHeaders` and before backend fetch. |
| Missing session | Return `401 AUTH_REQUIRED` with correlation id before booking-service. |
| Missing usable subject | Return `403 BOOKING_ACTOR_REQUIRED` with correlation id before booking-service. |
| Backend safety net | booking-service blank actor hardening remains in place and must not convert missing actor to `local-user`. |
| Local/test bypass | Any bypass remains explicit, profile-gated, and logged; it cannot satisfy U04 protected-path proof. |

## Data Protection

- Raw OAuth/OIDC tokens, service tokens, and secrets remain server-side.
- Evidence may include pre-sign-out subject, cookie-cleared observation, error code, route/action, outcome, backend no-call observation, and correlation id.
- Evidence must not rely only on anonymous screenshots; it must tie stale-call behavior to the pre-sign-out subject/correlation.

## Threat Controls

| Threat | Mitigation |
| --- | --- |
| Client-only logout false proof | Existing auth route owns session cookie deletion and redirect. |
| Session fixation/stale UI | Protected routes re-read server session after sign-out. |
| Authorization bypass after sign-out | BFF returns before `serviceHeaders` and backend fetch when actor is absent. |
| `local-user` elevation | BFF early return plus backend no-`local-user` evidence. |
| Token leakage | HttpOnly cookie plus no raw token serialization in signed-out state or evidence. |

## Verification Design

- Route/header evidence confirms `POST /api/auth/sign-out`, Keycloak logout redirect, and `lc_session` deletion.
- UI/live proof confirms `/` and `/booking` require login after sign-out.
- BFF tests cover `proxyBooking`, `loadBookings`, and `loadBooking` missing-actor branches before backend fetch.
- Backend logs/request counters prove no post-sign-out request with `X-LinerCore-Actor-Id: local-user`.

