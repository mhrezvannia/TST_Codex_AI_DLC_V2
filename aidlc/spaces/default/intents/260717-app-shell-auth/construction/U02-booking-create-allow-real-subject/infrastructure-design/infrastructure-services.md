# Infrastructure Services - U02 Booking Create Allow

## Source Context

This infrastructure service design consumes U02 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U02 `business-logic-model.md`. It identifies the local services and configuration contracts for authorized Booking create/detail.

## Service Inventory

| Service | Existing/New | U02 responsibility | Change |
| --- | --- | --- | --- |
| Nginx | Existing | Edge route for shell create/detail proof. | Reuse U01 shell routing. |
| `apps-shell` | New from U01 | Protected `/booking/new` and `/booking/[id]`. | No additional service. |
| `apps-booking` | Existing | BFF/create/detail adapter. | Require actor/correlation/idempotency before backend create/detail. |
| `booking-service` | Existing | Booking create, idempotency, persistence, detail retrieval. | Add/use identity-service authorization adapter before mutation. |
| `identity-service` | Existing | Permission catalog and authorize API. | Seed Booking permissions and `local.booking.user`. |
| `seed-loader` | Existing | Deterministic local fixture setup. | Extend seed/catalog data; no role-admin UI. |
| PostgreSQL | Existing | Booking and identity persistence. | Reuse existing local schemas; no new storage. |

## Configuration Contract

| Configuration | Owner | Rule |
| --- | --- | --- |
| `IDENTITY_SERVICE_URL` | `booking-service` | Compose DNS URL `http://identity-service:8082` for `/internal/identity/authorize`. |
| Authorization timeout | `booking-service` | Bounded timeout; deny/error/timeout blocks create before mutation. |
| Booking permissions | identity catalog/seed | `booking:read` and `booking:create` are required for `booking-desk`; preserved action permissions may remain if W1 UI uses them. |
| Allow user | identity catalog/seed | `local.booking.user` has `booking-desk` access. |
| Deny user | identity catalog/seed | `local.reference.admin` remains without Booking permissions. |
| Service token | `apps-booking`/server-side env | `BOOKING_SERVICE_TOKEN` remains server-side and out of browser/evidence. |

## Storage and Data Services

U02 uses existing booking-service persistence for created Bookings and existing identity-service persistence for permissions. It does not add caches, queues, replicas, sharding, object storage, or a shell-owned create state store.

## Service Discovery

Use existing Compose service names:

- `apps-shell:3000` for shell route hosting.
- `apps-booking:3000` if shell calls existing Booking BFF over HTTP.
- `booking-service:8085` for Booking create/detail.
- `identity-service:8082` for authorization.

Browser evidence must use Nginx host port `8088`.

## Security Services

No new secrets manager, role-admin UI, or policy-management service is introduced. The security posture is service-to-service authorization through existing identity-service plus deterministic local seed data. Raw tokens, service tokens, and cookies are not evidence fields.

## Shared Infrastructure Boundary

U02 extends shared identity seed/catalog data and booking-service configuration only where required for W2-01 real-subject proof. It does not rewrite W0-01 eventing, W0-02 reference-data, W1 Booking domain semantics, or W2-02 design-system foundation.

