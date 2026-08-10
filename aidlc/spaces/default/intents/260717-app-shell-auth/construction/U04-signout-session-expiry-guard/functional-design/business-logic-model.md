# Business Logic Model - U04 Sign-Out and Session Expiry Guard

## Source Context

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U04 proves session lifecycle safety: sign-out clears the shell session, protected shell and Booking routes require login again, and stale BFF calls cannot proceed as `local-user`.

## Workflow

| Step | Component | Processing | Output |
| --- | --- | --- | --- |
| 1 | Shell user menu | User selects sign out from the authenticated shell. | Sign-out request/action. |
| 2 | Auth sign-out adapter | Submit `POST /api/auth/sign-out` to the existing `apps/auth/app/api/auth/sign-out/route.ts` handler. The handler builds `authConfig.keycloakLogoutUrl`, sets `post_logout_redirect_uri` to `/signed-out`, returns `redirectResponse(logoutUrl)`, and appends `clearCookieHeader(SESSION_COOKIE_NAME)` for `lc_session`. | `303` redirect to Keycloak logout with `Set-Cookie: lc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`. |
| 3 | Protected shell route | User revisits `/` or `/booking`. | No valid session found. |
| 4 | Shell guard | Redirect to auth or render auth-required status; no protected content. | Login required. |
| 5 | Booking BFF stale-call guard | `proxyBooking`, `loadBookings`, and `loadBooking` call a shared actor resolver before `serviceHeaders`; the resolver returns no actor after sign-out. | Missing subject fail-closed response before fetch to booking-service. |
| 6 | booking-service safety net | Blank actor remains denied/error, not `local-user`. | No stale backend action. |
| 7 | Evidence capture | Capture sign-out, reauth requirement, and failed stale Booking call. | U04 evidence. |

## Session State Transitions

| State | Trigger | Next state | Rule |
| --- | --- | --- | --- |
| AuthenticatedShell | User selects sign out | SigningOut | Existing auth sign-out is called. |
| SigningOut | Session cookie cleared | SignedOut | Raw tokens/session data no longer available to shell. |
| SignedOut | User opens protected route | AuthRequired | Redirect or auth-required status. |
| SignedOut | Stale Booking BFF call fires | FailClosed | No actor, no backend call as `local-user`. |

## Data Transformations

| Source | Transformation | Target |
| --- | --- | --- |
| User menu event | Server action or route request to existing sign-out. | Auth sign-out endpoint/helper. |
| Session cookie | Clear/delete using existing auth behavior. | Browser response. |
| Post-sign-out route request | Re-evaluate session from cookies. | Redirect/auth-required result. |
| Stale Booking request | Attempt actor resolution; actor missing. | Fail-closed BFF response and evidence. |

## Concrete Boundary Contracts

| Boundary | Contract |
| --- | --- |
| Shell sign-out action | Render a user-menu form or server action that posts to `/api/auth/sign-out`. Do not implement client-only logout. |
| Auth route response | Existing `apps/auth/app/api/auth/sign-out/route.ts` returns a redirect response to `authConfig.keycloakLogoutUrl` with `post_logout_redirect_uri=/signed-out` and appends `clearCookieHeader(SESSION_COOKIE_NAME)`. |
| Cookie clearing | `clearCookieHeader(SESSION_COOKIE_NAME)` expands to `lc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`; U04 evidence must capture this header or an equivalent browser cookie-cleared observation. |
| Booking BFF guard insertion point | Introduce or use `requireBookingActor(request)` before every protected BFF backend fetch. Covered fan-in for U04: `proxyBooking` API routes, server-side `loadBookings`, and server-side `loadBooking`. |
| Missing-actor response contract | API/BFF calls return `401` with code `AUTH_REQUIRED` when no session exists, or `403` with code `BOOKING_ACTOR_REQUIRED` when an authenticated context lacks a usable subject; response includes `correlationId` and never calls `serviceHeaders` with `local-user`. |
| Evidence for no backend call | Capture BFF-level log/test evidence that the missing-actor branch returned before `fetch(BOOKING_SERVICE_URL...)`, plus booking-service logs or request counters showing no post-sign-out request with `X-LinerCore-Actor-Id: local-user`. |

## Failure Paths

| Failure | Behavior |
| --- | --- |
| Sign-out endpoint errors | Show recoverable shell error with correlation id; do not pretend signed out. |
| Cookie not cleared | U04 DoD fails; protected routes must require login after sign-out. |
| Stale client call after sign-out | BFF fails closed; booking-service must not receive `local-user`. |
| Backend blank actor fallback still active | U04 fails; backend hardening from U01/U02 must remain enforced. |

## Traceability

| Requirement/story | U04 behavior |
| --- | --- |
| FR-03, FR-08, US-01, US-03 | Existing auth sign-out clears session and protected routes require login. |
| FR-05, FR-11, NFR-02, NFR-03, NFR-05 | Missing/stale actor fails closed and local bypass remains explicit/profile-limited. |
| NFR-07, NFR-09 | User menu and signed-out states stay in approved frontend patterns and responsive shell layout. |

## Architecture Review - Functional Design

Verdict: NOT-READY.

Findings:

1. Shell/auth sign-out boundary is not implementable without guessing. The design requires "existing auth sign-out behavior" and "Auth sign-out endpoint/helper", but it does not name the concrete entrypoint, call shape, redirect/error contract, or cookie-clearing requirements beyond `lc_session`. A developer could accidentally add a parallel sign-out path or clear only shell-visible state instead of the server-recognized session. Required change: specify the existing auth sign-out route/helper to call, expected method/input/output, cookie deletion semantics, and recoverable-error behavior.

2. Booking BFF fail-closed boundary is underspecified. The design requires stale Booking calls to re-resolve actor subject and never proceed as `local-user`, but it does not identify the covered BFF routes/actions, the exact guard insertion point before booking-service calls, the status/error envelope returned on missing actor, or the evidence mechanism that proves booking-service was not reached as `local-user`. Required change: define the BFF guard contract for each in-scope Booking request path and the observable evidence needed for U04.

Checks passed within the reviewed artifacts: upstream intent coverage is represented for FR/US/NFR traceability; token-safe behavior is stated; NFR-07 frontend library constraints are preserved; W1 live-proof waiver remains BLOCKED at `compose-start`; W2 evidence blockers are not masked as PASS; no later-unit authorization scope is claimed.

## Architecture Review - Functional Design - Iteration 2

Verdict: READY.

Required changes: none.

Checks passed within the reviewed artifacts:

- Sign-out boundary now names `POST /api/auth/sign-out`, the existing `apps/auth/app/api/auth/sign-out/route.ts` handler, the Keycloak logout redirect with `post_logout_redirect_uri=/signed-out`, and `lc_session` clearing via `clearCookieHeader(SESSION_COOKIE_NAME)`.
- Cookie deletion semantics are concrete: `lc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`, with evidence required through the header or equivalent browser cookie-cleared observation.
- Booking BFF fail-closed boundary covers `proxyBooking`, `loadBookings`, and `loadBooking`; the guard is inserted before `serviceHeaders` and before backend fetch.
- Missing/stale actor responses are specified as `401 AUTH_REQUIRED` for no session or `403 BOOKING_ACTOR_REQUIRED` for authenticated context without usable subject, including `correlationId`.
- Evidence requirements prove no backend `local-user` call by combining BFF early-return evidence before `fetch(BOOKING_SERVICE_URL...)` with booking-service logs or request counters showing no `X-LinerCore-Actor-Id: local-user` request after sign-out.
