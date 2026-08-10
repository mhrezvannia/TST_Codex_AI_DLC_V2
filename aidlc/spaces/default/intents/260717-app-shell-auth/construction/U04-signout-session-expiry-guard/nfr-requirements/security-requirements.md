# Security Requirements - U04 Sign-Out and Session Expiry Guard

## Source Context

These security requirements consume U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U04 is security-critical because it proves session termination and stale-call containment.

## Sign-Out Security Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-01 | Shell sign-out posts to existing `/api/auth/sign-out`; no client-only logout is accepted. | Code review/live proof. |
| SEC-02 | Response clears `lc_session` with `Path=/`, `HttpOnly`, `SameSite=Lax`, and `Max-Age=0`. | Header/browser cookie evidence. |
| SEC-03 | Sign-out redirects through Keycloak logout with `post_logout_redirect_uri=/signed-out`. | Route/response evidence. |
| SEC-04 | Signed-out shell does not display stale user identity, raw tokens, or protected Booking data. | UI/browser storage check. |

## Stale-Call Security Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-05 | `proxyBooking`, `loadBookings`, and `loadBooking` guard actor resolution before `serviceHeaders` and backend fetch. | Unit/integration tests. |
| SEC-06 | Missing actor after sign-out returns `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` with correlation id. | BFF tests/evidence. |
| SEC-07 | No post-sign-out request reaches booking-service with `X-LinerCore-Actor-Id: local-user`. | BFF early-return evidence plus backend log/request counter. |
| SEC-08 | Local/test bypass remains explicit, profile-gated, and logged; it cannot satisfy U04 protected-path proof. | Config/code review. |

## Threat Controls

| Threat | Control |
| --- | --- |
| Session fixation/stale UI | Server-side protected routes re-check `lc_session` after sign-out. |
| Token leakage | Raw tokens never enter browser state and cookie is HttpOnly. |
| Authorization bypass after sign-out | BFF rejects missing actor before backend fetch. |
| False proof | Evidence must show pre-sign-out subject and correlation, not anonymous screenshots only. |
