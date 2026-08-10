# Infrastructure Services - U01 Walking Skeleton

## Source Context

This infrastructure service design consumes U01 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U01 `business-logic-model.md`. It lists the local services and configuration changes needed for the walking skeleton.

## Service Inventory

| Service | Existing/New | U01 responsibility | Change |
| --- | --- | --- | --- |
| `nginx` | Existing | Browser edge and correlation header. | Add `/` and `/booking*` routing to `apps-shell`; preserve `/auth/` and `/reference-data/`. |
| `apps-shell` | New | Protected shell host and Booking read mount. | Add Compose service and image `linercore/apps-shell:local`. |
| `apps-auth` | Existing | Auth routes and session cookie owner. | Reuse; no parallel auth service. |
| `apps-booking` | Existing | Booking BFF/UI source. | Preserve current service while changing actor contract in code-generation. |
| `booking-service` | Existing | Booking read/list API. | Preserve behavior and reject blank actors. |
| `identity-service` | Existing | Identity and later authorization owner. | Reuse; no U01-specific infrastructure change. |
| `postgres`, `keycloak`, `kafka`, `schema-registry` | Existing shared services. | Required local dependencies for app/full profiles. | Preserve current configuration. |

## Configuration Contract

| Configuration | Owner | Rule |
| --- | --- | --- |
| Shell workspace | `compose.yaml` | Build with `WORKSPACE: "@erp/app-shell"` once `apps/shell` exists. |
| Shell route | `infrastructure/nginx/default.conf` | Route `/` and `/booking*` to `apps-shell:3000`. |
| Auth route | Existing Nginx/app auth | Keep `/auth/` to `apps-auth:3000`; shell must not duplicate auth APIs. |
| Booking backend URL | Booking BFF/server-side code | Use Compose DNS `http://booking-service:8085`; no browser service URL exposure. |
| Service token | Server-side env only | `BOOKING_SERVICE_TOKEN` stays server-side and out of browser/evidence. |
| Session cookie | Auth package/session helpers | Preserve `lc_session` HttpOnly behavior. |

## Storage and Data Services

U01 does not add databases, caches, queues, search services, object storage, or CDN. It consumes existing PostgreSQL-backed services and the existing Kafka/Schema Registry platform dependencies without redesigning W0-01 eventing or W0-02 reference data.

## Service Discovery

Use Compose service names on the `linercore-local` network:

- `apps-shell:3000`
- `apps-auth:3000`
- `apps-booking:3000`
- `booking-service:8085`
- `identity-service:8082`
- `keycloak:8080`

Browser evidence uses Nginx host port `8088`; direct app ports are supporting diagnostics only and cannot satisfy U01 PASS.

## Security Services

No new secrets manager or IAM service is introduced for U01. Local secrets remain environment-variable based through existing Compose conventions. DevSecOps constraints:

- Do not expose raw tokens, service tokens, or `lc_session` to browser JavaScript.
- Keep service tokens in server-side env only.
- Keep local/test bypass explicit and profile-gated; it cannot satisfy protected shell proof.

## Shared Infrastructure Boundary

All existing shared services remain owned by their prior intents. U01 adds a shell service and Nginx route only; it does not replatform Booking, identity, reference-data, charge agreement, platform/eventing, observability, or CI infrastructure.

