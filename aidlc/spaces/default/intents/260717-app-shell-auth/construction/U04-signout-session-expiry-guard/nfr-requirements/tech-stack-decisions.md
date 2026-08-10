# Tech Stack Decisions - U04 Sign-Out and Session Expiry Guard

## Source Context

These decisions consume U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U04 uses existing auth and frontend/backend stack choices.

## Locked Choices

| Area | Decision | Rationale |
| --- | --- | --- |
| Sign-out route | Existing `POST /api/auth/sign-out`. | Reuse auth owner surface. |
| Cookie clearing | Existing `clearCookieHeader(SESSION_COOKIE_NAME)` for `lc_session`. | Preserves package auth contract. |
| Shell UI | Next.js App Router, React, TypeScript. | Existing frontend stack. |
| BFF guard | Existing Booking BFF helpers `proxyBooking`, `loadBookings`, `loadBooking` with actor resolver before `serviceHeaders`. | Covers known fan-in. |
| Runtime | Local Docker Compose, Nginx, Keycloak. | W2-01 acceptance target. |

## Prohibited Choices

- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- No new auth provider or parallel sign-out mechanism.
- No client-only logout proof.
- No backend fallback to `local-user` after sign-out.

## Configuration Decisions

| Configuration | Requirement |
| --- | --- |
| Keycloak logout URL | Use existing `authConfig.keycloakLogoutUrl`. |
| Post-logout redirect | `/signed-out`. |
| Missing actor code | `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` with correlation id. |
