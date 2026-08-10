# Domain Entities - U01 Walking Skeleton

## Source Context

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U01 introduces no new Booking aggregate; it defines shell/session/read-path entities and preserves existing Booking domain ownership.

## Entity Catalog

| Entity / value object | Owner | Attributes | Lifecycle in U01 |
| --- | --- | --- | --- |
| ShellSession | `apps/shell` adapter over `packages/auth` | subject, display name, roles/permissions summary, correlation id, authenticated flag | Resolved per protected request; never stores raw tokens client-side. |
| ActorSubject | Shell/Booking BFF boundary | subject id, subject type if available, source session id/reference | Derived from `ShellSession`; required for Booking read calls. |
| ShellRouteContext | `apps/shell` | route id, pathname, active nav item, breadcrumbs | Built for `/` and `/booking` in U01. |
| BookingReadRequest | Booking BFF | query params, actor subject, correlation id, service id/token | Created only after actor resolution succeeds. |
| BookingReadResult | Existing Booking UI/BFF | booking list/detail read data, empty/error state, correlation id | Rendered inside shell using preserved W1 read/list semantics. |
| CorrelationContext | Edge/BFF/service boundary | `X-Correlation-Id`, optional trace context | Propagated from shell request to Booking evidence. |
| EvidenceRecord | Evidence harness | timestamp, route, subject, actor header, correlation id, outcome | Captured for U01 live proof. |

## Relationships

| Relationship | Cardinality | Rule |
| --- | --- | --- |
| ShellSession to ActorSubject | 1 to 0..1 | A valid session may produce one actor subject; no subject means fail closed. |
| ShellRouteContext to BookingReadRequest | 1 to 0..1 | `/booking` creates a Booking read only after authenticated actor resolution. |
| BookingReadRequest to BookingReadResult | 1 to 1 | Existing Booking read/list behavior returns data, empty state, or error. |
| BookingReadRequest to CorrelationContext | 1 to 1 | Every read request carries correlation evidence. |
| BookingReadResult to EvidenceRecord | 1 to 0..n | Live proof records enough evidence to show non-`local-user` actor and request correlation. |

## State Model

| State | Entry condition | Exit condition | User-visible result |
| --- | --- | --- | --- |
| Unauthenticated | No valid session for protected route | Auth flow completes | Redirect/status, no protected content. |
| AuthenticatedShell | Valid session and safe summary | User opens `/booking` | Shell chrome with user menu and Booking nav. |
| ActorResolved | Shell session has subject | Booking BFF read is built | Booking read proceeds with real actor. |
| ActorMissing | Session missing subject or local bypass would synthesize `local-user` | User reauthenticates or fixture is corrected | Fail-closed shell/BFF state; no backend call as `local-user`. |
| BookingReadLoaded | booking-service returns read/list data | User navigates away or later Bolt acts | Booking content inside shell. |
| BookingReadError | BFF/service returns error | Retry after fix | Error state with correlation id. |

## Persistence and Ownership

U01 does not add a new database entity. Existing Booking persistence remains owned by booking-service, and existing identity/session persistence remains owned by auth/Keycloak/identity-service surfaces. The only new durable output for U01 is live evidence under `artifacts/w2-01-live/app-shell-auth/` or a Bolt-local child directory.

## Invariants

- `ActorSubject` cannot equal an implicit protected-path fallback to `local-user`.
- `BookingReadRequest` cannot exist without an actor subject and correlation context.
- `ShellSession` shown to browser code cannot include raw OAuth/OIDC tokens.
- Booking domain entities remain in booking-service; shell does not become Booking domain owner.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system work are consumed through stable interfaces only.
