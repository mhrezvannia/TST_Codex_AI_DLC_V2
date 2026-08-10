# Deployment Architecture - U02 Booking Create Allow

## Source Context

This deployment architecture consumes U02 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U02 `business-logic-model.md`. It maps the real-subject Booking create/detail allow path to the existing local Compose/Nginx topology.

## Compute Model

| Component | Deployment design | U02 role |
| --- | --- | --- |
| Nginx | Existing browser edge on host port `8088`. | Entry for `/booking/new` and `/booking/[id]` proof. |
| `apps-shell` | New shell container from U01. | Protected create/detail routes and session-derived actor. |
| `apps-auth` and Keycloak | Existing auth runtime. | Login as `local.booking.user` or equivalent subject. |
| `apps-booking` | Existing Booking BFF/UI container. | Create/detail adapter, actor/correlation/idempotency propagation. |
| `booking-service` | Existing Spring container. | Create command, idempotency, persistence, and identity authorization adapter. |
| `identity-service` | Existing Spring container. | Authorizes `booking:create` and `booking:read` for the real subject. |
| PostgreSQL | Existing local database. | Existing Booking and identity persistence; no new database. |

## Network Topology

U02 keeps the U01 network path and adds booking-service to identity-service authorization:

```text
---------+   +-------+   +------------+   +-------------+   +-----------------+
| Browser |-> | Nginx |-> | apps-shell |-> | apps-booking |-> | booking-service |
+---------+   +-------+   +------------+   +-------------+   +--------+--------+
                                                                   |
                                                                   v
                                                            identity-service
```

Text fallback: The browser enters through Nginx, shell protects the route and supplies actor context, Booking BFF calls booking-service, and booking-service authorizes through identity-service before persisting.

## Route Plan

| Route | Runtime requirement |
| --- | --- |
| `/booking/new` | Protected shell route; create form submits with session-derived actor and idempotency. |
| `/booking/[id]` | Protected shell route; created Booking detail is loaded with the same actor/correlation model. |
| `/auth/` | Existing auth routes remain owner for login/session. |

Direct `apps-booking` host port evidence is diagnostic only. U02 PASS requires Nginx-entered shell routes.

## Environment Definitions

| Service | Required local configuration |
| --- | --- |
| `booking-service` | Add or verify `IDENTITY_SERVICE_URL=http://identity-service:8082` and a bounded identity authorization timeout config for the adapter. |
| `apps-booking` or shell-hosted BFF | Preserve `BOOKING_SERVICE_URL=http://booking-service:8085`, server-only `BOOKING_SERVICE_TOKEN`, actor/correlation/idempotency propagation. |
| `seed-loader` | Extend or verify seed file grants Booking `read`/`create` permissions to `booking-desk`, seeds `local.booking.user`, and preserves `local.reference.admin` without Booking permissions. |
| `apps-shell` | Uses U01 auth/session configuration and canonical `/booking/new` and `/booking/[id]` routes. |

## Resource Sizing

No new compute tier is introduced for U02. Existing `booking-service`, `identity-service`, `apps-booking`, and `apps-shell` local resources are expected to satisfy one-user local proof. Authorization timeout tuning is a code/config concern, not a new service.

## Preservation Boundary

U02 deployment architecture does not add AWS services, CDN, cache, queue, role-admin UI, new authorization service, or a new database. W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected. W1 waiver remains BLOCKED at `compose-start`.

