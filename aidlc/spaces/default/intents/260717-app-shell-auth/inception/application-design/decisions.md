# Architecture Decisions - W2-01 App Shell and Auth

## Source Context

These decisions consume `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. They are scoped to W2-01's vertical program intent and preserve prior merged work.

## ADR-001 - Use One Next.js Shell Host for W2-01

### Context

W2-01 requires a single authenticated shell with Booking as the first mounted module. The source W2-01 statement already answered the architecture direction as one Next.js shell app.

### Decision

Use a new `apps/shell` Next.js host for protected shell routes, global navigation, breadcrumbs, user menu, sign-out, and Booking route composition. `apps/auth` remains the auth app/routes owner, and `apps/booking` remains the Booking BFF/UI source during W2-01.

### Alternatives Considered

| Alternative | Reason rejected |
| --- | --- |
| Micro-frontend/module federation host | Too much platform complexity for W2-01 and not needed for one mounted module. |
| Nginx-stitched app islands | Preserves the current gap and does not create one shell ownership boundary. |
| Full ERP module migration | W4-01 scope, not W2-01. |

### Consequences

- Clear shell ownership for auth/session/navigation.
- Booking is the first module integration point.
- Later W4-01 migrations can reuse shell patterns.
- W2-01 must add `apps/shell` to the workspace/Compose/Nginx topology.

## ADR-001A - Canonical Shell Route Namespace

### Context

Existing Booking UI routes live under `/bookings`, while the W2-01 shell UX and refined mockups use singular `/booking` as the module navigation label.

### Decision

Use canonical shell routes `/`, `/booking`, `/booking/new`, and `/booking/[id]` in `apps/shell`. Existing `/bookings`, `/bookings/new`, and `/bookings/[id]` browser paths redirect to the canonical shell routes when reached through Nginx/shell. Existing `apps/booking` internals may remain behind the adapter during W2-01, but the user-facing route and live proof use `/booking*`.

### Consequences

- Breadcrumbs and protected route matching are deterministic.
- Old links have an explicit compatibility path.
- Future W4-01 module routes can follow singular module labels in the shell.

## ADR-002 - Reuse Existing Auth and Session Helpers

### Context

`apps/auth` already has sign-in, callback, session, request-access, access-denied, and sign-out routes. `packages/auth` defines `SessionSummary`, `AuthSession`, and helper functions.

### Decision

Reuse existing auth routes and session DTOs. Add shell-specific protected-route behavior around them rather than creating a second auth mechanism.

### Consequences

- Tokens remain server-side/HttpOnly.
- Existing local bypass logic must be constrained so W2-01 protected paths do not silently create `local-user`.
- Deterministic local users are required for live proof.

## ADR-003 - Change Booking Actor Propagation at the BFF Boundary

### Context

MCP confirms `apps/booking/lib/bookings.serviceHeaders` sets `x-linercore-actor-id` to `local-user`, and `trace_path(serviceHeaders)` shows it feeds route handlers and load functions. Requirements FR-05 and FR-12 require a real subject.

### Decision

Change the Booking BFF header contract so protected calls require a session-derived actor subject. Missing subject fails closed. Keep service token/id headers as service identity, but user actor becomes the authenticated subject.

### Alternatives Considered

| Alternative | Reason rejected |
| --- | --- |
| Patch each route handler separately | Higher duplication and risk of one route still using `local-user`. |
| Leave BFF unchanged and patch backend only | Backend cannot distinguish an intentionally static actor from a real user. |
| Pass raw OAuth token to browser | Violates BFF/token security baseline. |

### Consequences

- Centralized fix covers list/detail/create/action fan-in.
- Callers must pass session/actor context.
- Tests must cover no missing-actor fallback.

## ADR-004 - Harden Backend Blank Actor Behavior

### Context

MCP confirms `BookingApiController.actor` currently returns `local-user` when actor subject is blank and is called by Booking actions.

### Decision

For protected W2-01 paths, blank actor becomes an error/deny condition, not a default user. If local/test compatibility requires fallback, isolate it behind explicit local profile/bypass checks and log it.

Implementation boundary: all booking-service API handlers reject blank `X-LinerCore-Actor-Id` except an explicit local/test bypass guarded by profile/flag and deterministic fixture subject. `BookingLocalIdentityFilter` keeps service-token validation but accepts valid deterministic actors such as `local.booking.user` and `local.reference.admin`, rather than only `local-user`.

### Consequences

- Backend cannot mask missing shell/BFF subject propagation.
- Detector 6d and live evidence can verify hardcoded-auth removal.
- Existing local tests may need deterministic subjects.

## ADR-005 - Use identity-service for Real-Subject Authorization

### Context

identity-service exposes `/internal/identity/authorize`, and requirements demand allow and deny proof for real subjects.

### Decision

Booking access decisions for mounted shell actions use a booking-service adapter from its existing authorization port to identity-service `POST /internal/identity/authorize`. Requests map subject/token reference from `X-LinerCore-Actor-Id`, resource `booking`, action `read/create/confirm/validate/price`, scope as booking id when available, caller `booking-service`, and inbound correlation id. Deny, unknown subject, timeout, or identity-service error fail closed and map to in-shell denied/error state.

### Consequences

- Authorization evidence is centralized and auditable.
- Identity catalog/seed work must add Booking permissions, grant them to `booking-desk`, seed `local.booking.user`, and preserve `local.reference.admin` without Booking access for deny proof.
- Deep role-admin UX remains out of scope.

## ADR-006 - Local Compose/Nginx Is the Target Platform

### Context

`team-practices.md` and `requirements.md` require local/on-prem Compose with Nginx and Keycloak. The stage includes AWS platform support, but W2-01 has no cloud acceptance requirement.

### Decision

Design the application topology for existing Docker Compose and Nginx. Do not add AWS infrastructure, CDK, VPC, IAM, cloud deployment, or cost model work to W2-01.

### Consequences

- Acceptance evidence must enter through local Nginx.
- Compose dependency failures are honest blockers, not test-pass substitutes.
- Later deployment stages should preserve the same local topology unless a separate intent changes deployment scope.

## ADR-007 - Preserve Prior Work Through Stable Interfaces

### Context

The user explicitly required preserving W0-01, W0-02, W1-01, and W2-02, and not rewriting W1's live-proof waiver as PASS.

### Decision

W2-01 consumes prior work through stable interfaces:

- W0-01 platform/eventing is not redesigned.
- W0-02 reference-data seed/completeness and UI are not modified or migrated.
- W1-01 Booking behavior is preserved; only shell/session actor propagation changes.
- W2-02 design-system foundation is consumed, not rebuilt.
- W1 live-proof waiver remains explicit as BLOCKED at `compose-start`.

### Consequences

- Diff review and targeted checks become part of live evidence.
- Any touched prior-work file requires W2-01-specific justification.
- W2-01 remains a vertical slice, not an umbrella redesign.

## Decision Summary

| Decision | Requirement/story support |
| --- | --- |
| One shell host | FR-01, US-01, US-03 |
| Reuse auth helpers | FR-02, FR-03, US-01 |
| Session actor at BFF | FR-05, US-02 |
| Backend blank actor fail-closed | FR-05, NFR-03, US-02 |
| identity-service authorization | FR-06, FR-07, US-02, US-03 |
| Compose/Nginx platform | NFR-08, US-04, `team-practices.md` |
| Prior-work preservation | NFR-06, NFR-10, US-04 |
