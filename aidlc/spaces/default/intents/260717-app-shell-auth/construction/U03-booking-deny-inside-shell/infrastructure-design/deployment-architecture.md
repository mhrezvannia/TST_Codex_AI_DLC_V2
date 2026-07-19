# Deployment Architecture - U03 Booking Deny

## Source Context

This deployment architecture consumes U03 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U03 `business-logic-model.md`. It maps the authenticated denied Booking path to the existing local Compose/Nginx topology.

## Compute Model

| Component | Deployment design | U03 role |
| --- | --- | --- |
| Nginx | Existing browser edge. | Entry for protected `/booking` deny proof. |
| `apps-shell` | Shell host from U01. | Renders protected shell frame and denied state. |
| `apps-auth` and Keycloak | Existing auth runtime. | Authenticates `local.reference.admin`. |
| `apps-booking` | Existing Booking BFF/UI container. | Propagates actor/correlation and maps backend deny to shell state. |
| `booking-service` | Existing Spring container. | Calls identity-service before read/action; maps deny to 403. |
| `identity-service` | Existing Spring container. | Evaluates deny fixture without Booking permissions. |

## Network Topology

U03 uses the same U01/U02 local network path:

```text
Browser -> Nginx -> apps-shell -> apps-booking -> booking-service -> identity-service
```

Text fallback: A signed-in `local.reference.admin` reaches `/booking` through Nginx and shell. Booking BFF/backend sends the real subject to identity-service. Identity denies, and the shell renders access denied.

## Route Plan

| Route | Runtime requirement |
| --- | --- |
| `/booking` | Protected shell route; must attempt backend authorization for deny evidence. |
| `/auth/` | Existing auth owner; authenticates deny subject. |
| Request-access/back/home actions | In-shell safe recovery actions; no new service required. |

The deny path must not be implemented by hiding the route, returning 404, or substituting an empty list.

## Environment Definitions

| Service | Required local configuration |
| --- | --- |
| `identity-service`/seed-loader | Preserve `local.reference.admin` without Booking permissions after U02 adds `local.booking.user`. |
| `booking-service` | Same identity-service URL/timeout contract as U02; deny/error/timeout fail closed. |
| `apps-booking` or shell BFF | Propagate session-derived actor and correlation; no `local-user` fallback. |
| `apps-shell` | Denied UI route/state inside shell with request-access/back actions. |

## Preservation Boundary

U03 deployment architecture adds no infrastructure beyond U01/U02 configuration. It does not add AWS, CDN, cache, queue, policy-admin UI, new authorization service, or design-system foundation. W0-01, W0-02, W1-01, and W2-02 remain protected; W1 waiver remains BLOCKED at `compose-start`.

