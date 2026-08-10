# Frontend Components - U04 Sign-Out and Session Expiry Guard

## Source Context

This frontend design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U04 designs user-menu sign-out, signed-out route behavior, and stale Booking call handling.

## Component Hierarchy

| Component | Owner | Responsibility |
| --- | --- | --- |
| `UserMenuSignOutAction` | `apps/shell` | Exposes sign-out as the final session-ending user menu action. |
| `SignOutHandler` | shell/auth adapter | Posts to existing `/api/auth/sign-out`, follows Keycloak logout redirect, and clears `lc_session`. |
| `AuthRequiredShellState` | `apps/shell` | Shows redirect/auth-required state after signed-out access. |
| `ProtectedRouteRecheck` | `apps/shell` | Revalidates session on `/` and `/booking` after sign-out. |
| `StaleBookingCallGuard` | Booking BFF adapter | Guards `proxyBooking`, `loadBookings`, and `loadBooking` before `serviceHeaders`/backend fetch when a post-sign-out request lacks actor subject. |

## Interaction Flow

1. User opens shell user menu while authenticated.
2. User selects sign out.
3. Shell/auth adapter invokes existing sign-out and clears session.
4. User opens `/` or `/booking`; protected route requires login.
5. Any pending Booking BFF request resolves no actor and fails closed.
6. Evidence captures the route reauth and stale-call failure.

## Props and State

| Data | Component | Constraint |
| --- | --- | --- |
| Safe session display | `UserMenuSignOutAction` | Display-only; no raw tokens. |
| Sign-out status | `SignOutHandler`, `AuthRequiredShellState` | Loading, success, recoverable error. |
| Route target | `ProtectedRouteRecheck` | `/` and `/booking` both protected. |
| Stale call correlation | `StaleBookingCallGuard` | Captured without retrying as `local-user`. |

## API and Response Contracts

| Interaction | Contract |
| --- | --- |
| User-menu sign-out | Submit `POST /api/auth/sign-out`; successful response is a redirect toward Keycloak logout and then `/signed-out`. |
| Cookie deletion | The response clears `lc_session` using `Max-Age=0`, `HttpOnly`, `SameSite=Lax`, and `Path=/`. |
| Post-sign-out protected shell route | `/` and `/booking` re-run server-side session checks and redirect/auth-required instead of rendering shell content. |
| Post-sign-out Booking BFF request | `proxyBooking`, `loadBookings`, and `loadBooking` return `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` with `correlationId` before calling booking-service. |

## Accessibility and UX Rules

- Sign-out is keyboard reachable from the user menu.
- Focus returns to a stable signed-out/auth-required heading or redirect status.
- Loading and error states use text, not spinner-only feedback.
- Mobile user menu does not overlap shell navigation or breadcrumbs.
- Error text includes correlation id where available.

## Frontend Constraints

- Use existing Next.js/React/TypeScript workspace patterns.
- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not store tokens in browser state.
- Do not mask sign-out failure as success.
