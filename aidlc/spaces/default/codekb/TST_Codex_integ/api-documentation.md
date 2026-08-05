# API Documentation - TST_Codex_integ

## Overview

The repository exposes internal/backend REST endpoints through Spring controllers and frontend BFF route handlers through Next.js apps. W2-01 primarily depends on auth/session BFF routes, Booking BFF proxy routes, Booking service routes, and identity-service authorization.

## Auth App Routes

Fresh MCP entry points in `apps/auth` include:

| Route/handler | Purpose |
|---|---|
| `GET apps/auth/app/api/auth/sign-in/route.ts` | Starts sign-in/OIDC transaction or local auth bypass path. |
| `GET apps/auth/app/api/auth/callback/route.ts` | Handles auth callback and creates session. |
| `GET apps/auth/app/api/auth/session/route.ts` | Returns current session summary. |
| `POST apps/auth/app/api/auth/request-access/route.ts` | Handles request-access flow. |
| `POST apps/auth/app/api/auth/sign-out/route.ts` | Redirects to Keycloak logout and clears session cookie. |
| `GET apps/auth/app/api/health/route.ts` | Health endpoint. |

## Identity Service APIs

The W2-01-critical endpoint is:

| Method | Path | Handler | Purpose |
|---|---|---|---|
| POST | `/internal/identity/authorize` | `IdentityAuthorizationController.authorize` | Accepts authorization request and calls `IdentityApplicationService.authorize`. |

`IdentityApplicationService.authorize` resolves the subject token reference, denies unknown subjects with audit, evaluates active role assignments, and appends deny audit decisions.

## Booking APIs and BFF

Fresh MCP route and code search results identify Booking BFF and backend seams:

- `apps/booking/lib/bookings.ts::serviceHeaders` builds backend request headers.
- `BookingApiController.create`, `createDraft`, `recent`, `detail`, and action endpoints consume `X-LinerCore-Actor-Id` and `X-Correlation-Id`.
- `BookingLocalIdentityFilter` validates service id, actor id, correlation id, and local service token.

Current W2-01 issue:

- `serviceHeaders` sets `x-linercore-actor-id` to `local-user`.
- `BookingApiController.actor` falls back to `local-user` when the actor subject id is blank.

## Other Backend API Surfaces

Fresh MCP route inventory includes:

- Charge agreement CRUD and lifecycle routes under `/api/charge-agreements`.
- Pricing request route `/pricing-requests`.
- Reference-data routes under `/reference-sets`.
- Container movement recent/detail/detail-by-booking routes.

These surfaces are context for shell navigation but are not mounted in W2-01 beyond placeholders/links.

## Contract and Runtime APIs

Scripts in `package.json` expose validation/evidence workflows:

- `contracts:validate`
- `contracts:verify`
- `contracts:verify:live`
- `readiness:local`
- `quality:gates`
- `w1:live-acceptance`
- `smoke:local`

W2-01 should add or reuse evidence scripts later for live login/shell/Booking subject proof.
