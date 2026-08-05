# Component Inventory - TST_Codex_integ

## Frontend Components and Apps

| Component | Path | Responsibility | W2-01 relevance |
|---|---|---|---|
| Auth app | `apps/auth` | Sign-in, callback, session, request access, access denied, sign out. | Reuse for shell authentication. |
| Booking app | `apps/booking` | Booking list/detail/create and BFF proxy behavior. | First mounted module; static actor seam. |
| Reference Data app | `apps/reference-data` | Reference-data workbench. | Placeholder/link only in W2-01. |
| Charge Agreements app | `apps/charge-agreements` | Charge-agreement workbench. | Placeholder/link only in W2-01. |
| `@erp/ui` | `packages/ui` | Shared UI package. | Consume cautiously; W2-02 owns foundation. |
| `@erp/auth` | `packages/auth` | Shared auth helpers and local bypass helpers. | Candidate for shell/session reuse. |
| `@erp/api-core` | `packages/api-core` | API client patterns. | Candidate for BFF/client consistency. |

## Backend Services

| Service | Path | Responsibility | W2-01 relevance |
|---|---|---|---|
| identity-service | `services/identity-service` | Subjects, roles, authorization decisions, audit. | Required for real subject authorization. |
| booking-service | `services/booking-service` | Booking domain/application/API, pricing integration, local identity filter. | Required for mounted Booking proof. |
| reference-data-service | `services/reference-data-service` | Reference sets and records. | Existing dependency of Booking; not a shell migration target. |
| charge-agreement-service | `services/charge-agreement-service` | Agreements and pricing. | Existing Booking dependency; not W2-01 scope. |
| container-movement-service | `services/container-movement-service` | Journey/movement handling. | Existing W1 context; not W2-01 scope. |
| platform-messaging | `services/platform-messaging` | Kafka/outbox shared messaging patterns. | Preserve prior work; not central to shell auth. |

## Infrastructure Components

| Component | Path | Responsibility |
|---|---|---|
| Compose runtime | `compose.yaml` | Local PostgreSQL, Keycloak, Kafka, Schema Registry, services, apps, Nginx, observability profiles. |
| Nginx | `infrastructure/nginx` | Local browser edge routing. |
| Seeds | `infrastructure/seeds` and `scripts/seed-local.mjs` | Deterministic local data. |
| Quality/evidence scripts | `scripts/*` | Local readiness, contracts, smoke, W1 evidence, quality gates. |

## Hotspots

Fresh MCP hotspots relevant to W2-01:

- `apps/booking/lib/bookings.proxyBooking` and `serviceHeaders`.
- `apps/auth/lib/auth-server.sessionFromRequest`, `createLocalSession`, `safeSessionSummary`.
- `services/identity-service/.../IdentityApplicationService.authorize`.
- `services/booking-service/.../BookingLocalIdentityFilter.doFilterInternal`.
- `services/booking-service/.../BookingApiController.actor`.
