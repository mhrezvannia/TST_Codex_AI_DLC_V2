# Component Methods - W2-01 App Shell and Auth

## Source Context

This method design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. Fresh MCP facts identify `safeSessionSummary`, `sessionFromRequest`, `serviceHeaders`, `proxyBooking`, `loadBookings`, `loadBooking`, `BookingApiController.actor`, and `IdentityAuthorizationController.authorize` as key seams.

## Shell Host Methods

| Method / function | Input | Output | Responsibility | Notes |
| --- | --- | --- | --- | --- |
| `requireShellSession(request)` | Next.js request/server context | `SessionSummary` or redirect | Resolve authenticated session for protected shell route in `apps/shell` | Wraps existing `sessionFromRequest`/`safeSessionSummary`; no raw token exposure |
| `renderShellLayout(session, routeContext, children)` | session, active nav, breadcrumbs, mounted content | React shell layout | Render top bar, nav, breadcrumbs, user menu, main content | Must support desktop/tablet/mobile states from refined mockups |
| `buildBreadcrumbs(routeContext)` | route id and optional booking reference | breadcrumb list | Produce `Home`, `Booking`, and detail breadcrumbs | Keeps breadcrumbs predictable for accessibility |
| `renderModuleAvailability(session)` | session roles/permissions | nav item states | Booking active; non-mounted modules disabled/link-only | Enforces FR-09 and W4-01 boundary |
| `signOutAction(request)` | session request | redirect/response | Reuse auth sign-out and clear session | Protected routes require login after completion |
| `redirectLegacyBookingRoute(path)` | `/bookings*` path | redirect response | Redirect legacy Booking browser routes to canonical shell `/booking*` routes | Preserves links while making shell route canonical |

## Auth Session Methods

Existing MCP facts:

- `sessionFromRequest(request)` reads `lc_session` and decodes an `AuthSession`.
- `safeSessionSummary(request)` returns a `SessionSummary`; current local bypass may create `local-user`.
- `/api/auth/session` returns `safeSessionSummary(request)`.

Required method behavior:

| Method / function | Change |
| --- | --- |
| `safeSessionSummary` or shell wrapper | For W2-01 protected shell paths, do not auto-create `local-user`; return unauthenticated or explicit local-only fixture subject. |
| `createLocalSession(subjectId)` | May remain for local/test bypass, but W2-01 live proof must use deterministic subjects such as `local.booking.user` and `local.reference.admin`. |
| `toSessionSummary(session, correlationId)` | Reuse as the safe session DTO for shell and user menu. |

## Booking BFF Methods

Existing MCP facts:

- `serviceHeaders(correlationId, idempotencyKey)` currently sets `x-linercore-actor-id` to `local-user`.
- `trace_path(serviceHeaders)` shows callers include `proxyBooking`, `loadJson`, Booking route handlers, `loadBookings`, and `loadBooking`.

Required method contracts:

| Method / function | Input | Output | Responsibility |
| --- | --- | --- | --- |
| `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)` | correlation id, authenticated subject, optional idempotency key | `Headers` | Create Booking service headers without static actor |
| `requireBookingActor(request)` | request/session context | actor subject or fail-closed result | Resolve authenticated subject for Booking BFF calls |
| `proxyBooking(request, path, method)` | request, backend path, method | proxied response | Forward actor/correlation/idempotency and map deny/error states |
| `loadBookings(query, session)` | query, session | Booking page result | Server-side list load with real subject |
| `loadBooking(id, session)` | booking id, session | Booking detail result | Server-side detail load with real subject |

Fail-closed rules:

- Missing subject on protected shell/Booking paths returns authentication-required or access-denied behavior; it must not retry as `local-user`.
- Local/test bypass must be explicit and profile-gated.

## Booking Backend Methods

Existing MCP fact:

- `BookingApiController.actor(actorSubjectId)` currently returns `local-user` when the header is blank and is called by Booking actions.

Required method behavior:

| Method / function | Change |
| --- | --- |
| `BookingApiController.actor` | For protected W2-01 paths, blank actor is an error/deny, not `local-user`. If compatibility requires fallback, isolate it to explicit local/test paths and log it. |
| Booking command handlers | Continue existing create/confirm/validate/price/reconfirm behavior; actor subject changes from static to real session subject. |
| Booking audit/evidence writing | Record real subject and correlation id for W2-01 allowed and denied evidence. |
| `BookingLocalIdentityFilter.doFilterInternal` | Keep service id/token validation; allow deterministic actor subjects instead of only `local-user`; blank actor remains invalid. |

## Identity Authorization Methods

Existing MCP fact:

- `IdentityAuthorizationController.authorize` handles `POST /internal/identity/authorize` and passes correlation id, token reference, resource, action, scope, and caller to `IdentityApplicationService.authorize`.

Required method behavior:

| Method / function | Input | Output | Responsibility |
| --- | --- | --- | --- |
| `IdentityBookingAuthorizationAdapter.authorize(subject, resource, action, scope, correlationId)` | session actor subject, resource `booking`, operation action, optional booking id, correlation | allow/deny decision | Call identity-service `POST /internal/identity/authorize` through booking-service authorization port |
| `mapAuthorizationDecision(decision)` | identity decision | shell/BFF result | Map allow to Booking action and deny to access-denied shell state |

Request mapping:

| Booking operation | identity resource | identity action | scope |
| --- | --- | --- | --- |
| list/detail | `booking` | `read` | booking id for detail, empty for list |
| create/draft | `booking` | `create` | empty |
| confirm/reconfirm | `booking` | `confirm` | booking id |
| validate | `booking` | `validate` | booking id |
| price | `booking` | `price` | booking id |

Failure behavior:

- Missing actor, unknown subject, deny decision, timeout, or identity-service error all fail closed.
- Deny and error decisions are recorded with `X-Correlation-Id` and surfaced as in-shell denied/error states.
- Seed/catalog work must add Booking permissions to the identity catalog and grant them to `booking-desk`.

## Evidence Methods

| Method / script | Responsibility |
| --- | --- |
| `captureW2LiveProof` | Exercise login, Booking allow, Booking deny, sign-out, detector 6d, `aidlc-audit`; write under `artifacts/w2-01-live/app-shell-auth/`. |
| `assertNoHardcodedAuth` | Verify mounted shell/Booking surfaces do not contain or exercise `local-user` fallback. |
| `assertPriorWorkPreserved` | Diff-review W0-01, W0-02, W1-01, W2-02 surfaces and capture targeted verification. |

## Method Traceability

| Story | Methods |
| --- | --- |
| US-01 | `requireShellSession`, `renderShellLayout`, auth session methods |
| US-02 | `requireBookingActor`, `serviceHeaders`, `proxyBooking`, `authorizeBookingAction`, backend actor handling |
| US-03 | `renderModuleAvailability`, `mapAuthorizationDecision`, `signOutAction` |
| US-04 | `loadBookings`, `loadBooking`, evidence methods, preservation checks |
