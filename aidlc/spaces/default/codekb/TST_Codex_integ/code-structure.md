# Code Structure - TST_Codex_integ

## Repository Layout

| Path | Purpose |
|---|---|
| `apps/auth` | Next.js auth app with sign-in, callback, session, request-access, access-denied, signed-out, and health routes. |
| `apps/booking` | Next.js Booking app with list/detail/create/action BFF behavior. |
| `apps/reference-data` | Next.js reference-data workbench. |
| `apps/charge-agreements` | Next.js charge-agreement workbench. |
| `packages/*` | Shared frontend packages: `api-core`, `auth`, `config`, `shared-types`, `transformers`, `ui`, `utils`. |
| `services/*` | Java service bounded contexts and platform messaging. |
| `contracts` | API/event contract assets and examples. |
| `infrastructure` | Docker, database, env, observability, nginx, and seed assets. |
| `scripts` | Local runtime, seed, readiness, quality, contract, and W1 evidence scripts. |
| `aidlc` | AI-DLC spaces, intents, codekb, memory, and audit artifacts. |

## Languages and File Counts

Fresh MCP index reports:

- Java: 361 files
- TypeScript: 76 files
- YAML: 56 files
- SQL: 6 files
- TOML: 5 files
- HTML: 4 files
- JavaScript: 1 file
- Bash: 1 file
- CSS: 1 file

## Frontend Structure

Frontend apps are workspace packages. App-level routes and BFF handlers are under `apps/<name>/app`, with supporting libraries under `apps/<name>/lib`.

W2-01 hotspots:

- `apps/auth/lib/auth-server.ts` for session cookie helpers and local session creation.
- `apps/auth/app/api/auth/*` for sign-in, callback, session, request-access, sign-out.
- `apps/booking/lib/bookings.ts` for Booking BFF service headers and proxy behavior.
- `apps/booking/app` for Booking list/detail/create surfaces.

## Backend Structure

Backend services are under `services/<service>` and follow Java service structure. Fresh MCP package counts show the largest service contexts are:

- `booking-service` (600 graph nodes)
- `charge-agreement-service` (408)
- `reference-data-service` (402)
- `container-movement-service` (319)
- `identity-service` (218)
- `platform-messaging` (47)

## W2-01 Code Seams

- Static browser/BFF actor header: `apps/booking/lib/bookings.ts`.
- Backend actor fallback: `services/booking-service/container/.../BookingApiController.java`.
- Local service identity guard: `services/booking-service/container/.../BookingLocalIdentityFilter.java`.
- Identity authorization API: `services/identity-service/container/.../IdentityAuthorizationController.java`.
- Authorization application service: `services/identity-service/application-service/.../IdentityApplicationService.java`.
