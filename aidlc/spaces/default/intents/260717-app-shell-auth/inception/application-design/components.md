# Components - W2-01 App Shell and Auth

## Source Context

This component design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. It uses fresh codebase-memory MCP facts for `apps/auth`, `apps/booking`, `packages/auth`, booking-service, and identity-service seams.

## Architectural Boundary

W2-01 adds one shell-host boundary and modifies actor propagation across the mounted Booking path. It does not merge all ERP apps, rewrite Booking domain behavior, change W0-01 platform/eventing, alter W0-02 reference-data seed/completeness surfaces, or take over W2-02 design-system foundation work.

## Component Catalog

| Component | Type | Path / owner | Responsibility | W2-01 change |
| --- | --- | --- | --- | --- |
| Shell Host App | New Next.js app | `apps/shell` | Protected shell routes, top bar, side nav, breadcrumbs, user menu, sign-out, mounted module route frame | Add W2-01 shell frame and protected route composition; add Compose service and Nginx route for shell |
| Auth Session Adapter | Existing/reused frontend auth component | `apps/auth/lib/auth-server.ts`, `packages/auth` | Read session cookie, produce safe session summary, local bypass checks | Reuse; constrain local bypass so protected W2-01 paths do not silently create `local-user` |
| Auth Routes | Existing Next.js routes | `apps/auth/app/api/auth/*` | sign-in, callback, session, request-access, sign-out | Reuse from shell; no parallel auth |
| Booking Module Adapter | New shell integration wrapper | `apps/shell/app/booking/*` around preserved Booking UI/contracts | Mount Booking list/detail/create/action inside shell layout | Adds session/authorization guard and shell breadcrumbs |
| Booking BFF Client | Existing Booking frontend service client | `apps/booking/lib/bookings.ts` | Proxy Booking requests to booking-service | Change `serviceHeaders` contract to require session-derived actor subject |
| Booking UI Pages | Existing Booking pages | `apps/booking/app/bookings/*` | list/detail/create/action surfaces | Preserve behavior; render within shell or through mounted route composition |
| Authorization Adapter | New or reused frontend/server helper | Shell/BFF server side | Resolve allow/deny from session roles or identity-service decision where available | Supplies denied state and request-access flow |
| identity-service Authorization API | Existing backend service | `services/identity-service` `/internal/identity/authorize` | Subject role/permission decisions and audit | Reuse for real-subject authorization evidence |
| booking-service API | Existing backend service | `services/booking-service` | Booking command/query endpoints and audit/evidence | Stop accepting blank actor fallback for protected W2-01 paths; retain explicit local/test behavior only where safe |
| Live Evidence Harness | New evidence artifact/scripts | `artifacts/w2-01-live/app-shell-auth/` and existing audit tools | Capture live proof through Nginx, Keycloak, shell, Booking, identity, detector 6d, `aidlc-audit` | Adds deterministic W2-01 evidence package |

## Component Responsibilities

### Shell Host App

- Owns global shell layout and protected route boundary.
- Lives in a new `apps/shell` workspace package so auth stays an auth surface and Booking stays a domain surface.
- Adds a `shell` service to `compose.yaml` and an Nginx edge route that makes the shell the browser entry.
- Reads safe session state server-side.
- Renders non-mounted modules as disabled placeholders or external links.
- Provides user menu sign-out.
- Mounts Booking as the only W2-01 business module.

### Auth Session Adapter

- Uses existing `SessionSummary`/`AuthSession` concepts from `packages/auth`.
- Reads `lc_session` via server-side cookie helpers.
- Exposes subject, subject type, display name, roles, permissions, and correlation id.
- Does not expose raw tokens to browser JavaScript.
- Does not create a production-like `local-user` session on protected W2-01 paths.

### Booking Module Adapter

- Bridges shell route context to existing Booking pages/actions.
- Supplies shell breadcrumbs and navigation state.
- Ensures Booking calls receive the authenticated subject and correlation context.
- Converts authorization deny responses into the in-shell access-denied state.

### Booking BFF Client

- Centralizes Booking service headers.
- Requires an actor subject input for protected calls.
- Propagates `x-correlation-id`, W3C Trace Context where available, service id, service token, and idempotency key.
- Fails closed if protected actor subject is absent.

### Backend Authorization and Evidence

- booking-service continues owning Booking domain actions.
- identity-service continues owning authorization decisions.
- W2-01 adds a Booking authorization adapter from booking-service's existing authorization port to identity-service `POST /internal/identity/authorize`.
- Authorization request mapping: subject/token reference = `X-LinerCore-Actor-Id`, resource = `booking`, action = `read`, `create`, `confirm`, `validate`, or `price` matching the Booking operation, scope = booking id where available, caller = `booking-service`, correlation id = inbound `X-Correlation-Id`.
- Timeout/failure behavior: authorization timeout, unknown subject, missing subject, or deny all fail closed and record deny/error evidence with correlation id.
- Seed and catalog changes: add `booking:read`, `booking:create`, `booking:confirm`, `booking:validate`, and `booking:price` permissions or equivalent identity catalog entries; grant them to `booking-desk`; add `local.booking.user` with `booking-desk`; keep `local.reference.admin` without Booking permissions for deny proof.
- W2-01 evidence records the real subject, not `local-user`, for allowed and denied paths.

## Route Ownership

| Route | Owner | Design decision |
| --- | --- | --- |
| `/` | `apps/shell` | Canonical authenticated shell landing through Nginx. |
| `/booking` | `apps/shell` + Booking Module Adapter | Canonical mounted Booking list inside shell. |
| `/booking/new` | `apps/shell` + Booking Module Adapter | Canonical mounted Booking create path. |
| `/booking/[id]` | `apps/shell` + Booking Module Adapter | Canonical mounted Booking detail/action path. |
| `/bookings`, `/bookings/new`, `/bookings/[id]` | compatibility routing | Redirect to canonical `/booking*` routes when reached through shell/Nginx; preserved Booking app internals may keep these routes until code migration removes duplication. |
| Auth API routes | `apps/auth` | Reused rather than duplicated. |
| Booking API/BFF routes | `apps/booking` initially, callable only with shell/session actor context | Preserve behavior but require actor subject. Later consolidation into `apps/shell` is out of W2-01 unless needed for the actor contract. |

## Backend Enforcement Boundary

- All booking-service HTTP/API requests that reach Booking command/query handlers require non-blank `X-LinerCore-Actor-Id`; blank or whitespace actor returns an authorization/client error and is audited with correlation id.
- `BookingApiController.actor` no longer supplies `local-user` as the general fallback. If a local/test bypass is retained, it must be behind an explicit local profile flag, name the deterministic fixture subject, and log bypass usage.
- `BookingLocalIdentityFilter` must accept `booking-bff` service identity while no longer constraining valid actor subjects to only `local-user`; valid actors for W2-01 include `local.booking.user` and `local.reference.admin`, and production-like profiles should accept any authenticated subject that identity-service can resolve.
- Missing service id/token remains a service-auth failure separate from user actor authorization.

## Preservation Guards

- W0-01 platform/eventing: no event/outbox/messaging redesign; only display/carry correlation/evidence needed for W2-01.
- W0-02 reference-data: consume existing lookup behavior; do not alter seed/completeness surfaces or migrate reference-data UI.
- W1-01 Booking: preserve list/detail/create/action behavior and explicit live-proof waiver/BLOCKED status.
- W2-02 design system: consume existing primitives and record gaps; no broad foundation rewrite.

## Review

Verdict: NOT-READY

Findings:

1. Shell host ownership is still deferred to implementation. `components.md` says the Shell Host path is "chosen during implementation" and `decisions.md` allows either a new app or an evolved existing app. Application design is the point where this must be fixed. The current codebase has `apps/auth`, `apps/booking`, and Nginx routes for `/auth/` and `/reference-data/`, with no existing shell route. Required change: choose the concrete shell host owner/path and state whether W2-01 evolves `apps/auth`, creates a new app, or consolidates another app, including the affected Compose workspace and Nginx service.
2. Route namespace remains ambiguous. The design offers `/` or `/app` and `/booking` or `/app/booking`, while the existing Booking UI is under `/bookings` and the current Nginx config does not route Booking through the edge. This leaves developers unable to wire redirects, callbacks, protected route matching, breadcrumbs, and live proof consistently. Required change: select one canonical shell entry route and one canonical mounted Booking route, then map old/current `/bookings` behavior explicitly through redirect, preservation, or route reuse.
3. Booking-to-identity authorization is not implementable from the artifact as written. The design says Booking actions use identity-service or an equivalent seam, but the current Booking service uses a local `AuthorizationPort`/`BookingLocalAuthorization`, `BookingLocalIdentityFilter` only allows `booking-bff` to act as `local-user`, and the identity catalog/seed data do not currently define Booking permissions or `local.booking.user`. Required change: specify the exact authorization integration contract: either add a Booking `AuthorizationPort` adapter to `/internal/identity/authorize` with request/response mapping, timeout/fail-closed behavior, service configuration, and audit evidence, or explicitly define the local equivalent seam and why it satisfies FR-06 for W2-01 live proof. Also name the required booking permissions/role grants and seed/fixture changes for `local.booking.user` and `local.reference.admin`.
4. Backend hardening needs a concrete compatibility rule. The artifact correctly identifies `BookingApiController.actor` fallback to `local-user`, but it only says to deny blank actor "for protected W2-01 paths" while the backend API does not know whether a request came from a shell-protected path. Required change: define the enforcement boundary in code terms, such as making all Booking API blank actors fail closed except an explicitly profile-gated local/test bypass, and update `BookingLocalIdentityFilter` allowed actors consistently with the new deterministic subject model.

Ready aspects:

- The dependency direction is sound: shell/auth depends on Booking BFF, Booking service depends on identity/reference/charge/platform services, and no UI or identity-service dependency cycle is introduced.
- Security posture is directionally correct: raw tokens stay server-side, protected paths fail closed, actor propagation is centralized at `serviceHeaders`, and `local-user` fallback is treated as a risk to remove from mounted paths.
- W2-01 scope discipline is mostly preserved: no AWS/cloud expansion is introduced, W0-01/W0-02/W1-01/W2-02 are protected through stable interfaces, and W1 live-proof waiver/BLOCKED handling remains explicit rather than converted to PASS.

## Review - Iteration 2

Verdict: READY

Findings:

1. Iteration-1 blocker 1 is addressed. The shell host is now fixed as new `apps/shell`, with explicit Compose service and Nginx ownership in `components.md`, `services.md`, and ADR-001/ADR-006.
2. Iteration-1 blocker 2 is addressed. The canonical route namespace is `/`, `/booking`, `/booking/new`, and `/booking/[id]`, with `/bookings*` preserved as compatibility redirects to `/booking*`.
3. Iteration-1 blocker 3 is addressed. The design now defines the booking-service authorization adapter to identity-service `POST /internal/identity/authorize`, request/action mapping, fail-closed behavior for missing/unknown/denied/timeout/error cases, required Booking permissions and seed grants, and live evidence for allow/deny subjects.
4. Iteration-1 blocker 4 is addressed. Backend hardening is now stated in code terms: all booking-service API handlers reject blank `X-LinerCore-Actor-Id` except an explicit local/test bypass, `BookingApiController.actor` must stop general `local-user` fallback, and `BookingLocalIdentityFilter` must keep service-token validation while accepting deterministic real actor subjects.

Required changes:

- None before construction. Implementation must preserve these contracts exactly; any fallback to hardcoded `local-user`, ambiguous `/bookings` ownership, or authorization behavior that does not fail closed should be treated as a construction blocker.
