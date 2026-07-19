# Domain Entities - U04 Sign-Out and Session Expiry Guard

## Source Context

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U04 models session lifecycle and stale-call guard state; it adds no new Booking persistence entities.

## Entity Catalog

| Entity / value object | Owner | Attributes | U04 role |
| --- | --- | --- | --- |
| ShellSession | auth/shell boundary | subject, cookie reference, authenticated flag, expiry | Cleared by sign-out and rechecked on protected routes. |
| SignOutCommand | `apps/shell`/auth adapter | method `POST`, path `/api/auth/sign-out`, session reference, correlation id, target redirect | Invokes existing auth sign-out. |
| AuthRequiredState | `apps/shell` | route, message/status, redirect target | Result after signed-out user opens protected routes. |
| StaleBookingCall | Booking BFF boundary | route/action, missing actor, correlation id | Represents a post-sign-out or expired-session request. |
| FailClosedResult | Booking BFF/booking-service | status `401` or `403`, code `AUTH_REQUIRED` or `BOOKING_ACTOR_REQUIRED`, reason, correlation id | Prevents stale request from reaching/acting as `local-user`. |
| U04EvidenceRecord | evidence harness | sign-out timestamp, route check, stale-call result, correlation id | Proves session lifecycle guard. |

## Relationships

| Relationship | Cardinality | Rule |
| --- | --- | --- |
| ShellSession to SignOutCommand | 1 to 1 | A valid session can produce a sign-out command. |
| SignOutCommand to AuthRequiredState | 1 to 1 | Once cleared, protected routes require authentication. |
| Signed-out request to StaleBookingCall | 0..n | Pending browser behavior may still attempt a BFF request. |
| StaleBookingCall to FailClosedResult | 1 to 1 | Missing actor maps to fail-closed, not fallback. |
| FailClosedResult to U04EvidenceRecord | 1 to 1..n | Evidence captures stale-call prevention. |

## State Model

| State | Meaning | Transition |
| --- | --- | --- |
| Authenticated | Shell has valid session. | User chooses sign out. |
| SigningOut | Auth sign-out is in progress. | Cookie/session cleared or error. |
| SignedOut | No valid protected session remains. | Protected route opens or auth begins again. |
| AuthRequired | Protected route blocks business content. | User signs in. |
| StaleCallBlocked | Booking request lacks actor after sign-out. | Evidence captured. |

## Invariants

- Signed-out shell state cannot include protected Booking data.
- A stale Booking request cannot create, read, or mutate data as `local-user`.
- Client state is not authority for authentication; server-side session is rechecked.
- U04 does not change Booking domain state except by proving stale calls do not proceed.
- `proxyBooking`, `loadBookings`, and `loadBooking` cannot call `serviceHeaders` until actor resolution succeeds.
