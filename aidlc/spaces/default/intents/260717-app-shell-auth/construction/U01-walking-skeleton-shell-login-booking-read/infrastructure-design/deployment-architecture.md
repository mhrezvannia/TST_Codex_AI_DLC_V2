# Deployment Architecture - U01 Walking Skeleton

## Source Context

This deployment architecture consumes U01 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U01 `business-logic-model.md`. It maps the walking skeleton to the existing local Docker Compose and Nginx topology.

## Compute Model

| Component | Deployment design | Notes |
| --- | --- | --- |
| `apps-shell` | New Next.js container built by `infrastructure/docker/next-app.Dockerfile` with workspace `@erp/app-shell`. | Hosts `/` and `/booking` protected shell routes. |
| `apps-auth` | Existing Next.js container. | Remains auth owner for sign-in/callback/session/sign-out routes. |
| `apps-booking` | Existing Next.js container. | Remains Booking BFF/UI source during W2-01; shell consumes stable interfaces. |
| `booking-service` | Existing Spring container. | Preserves read/list behavior and blank-actor hardening. |
| `identity-service` and Keycloak | Existing Compose services. | Provide live auth/session identity and later authorization evidence. |
| Nginx | Existing `nginx:1.27` service on host port `8088`. | Becomes accepted browser edge for shell/auth proof. |

## Network Topology

U01 uses the existing Compose network `linercore-local`. Browser traffic enters through Nginx, not direct app ports, for acceptance evidence:

```text
---------+       +-------+       +------------+
| Browser | ----> | Nginx | ----> | apps-shell |
+---------+       +-------+       +------------+
                      |                 |
                      v                 v
                 apps-auth        apps-booking
                      |                 |
                      v                 v
                  Keycloak       booking-service
```

Text fallback: Browser traffic reaches Nginx on `8088`; Nginx routes shell paths to `apps-shell`, auth paths to `apps-auth`, and shell/Booking calls continue through the existing Compose service network.

## Route Plan

| Route | Nginx target | Runtime requirement |
| --- | --- | --- |
| `/` | `http://apps-shell:3000/` | Protected shell landing. |
| `/booking` and `/booking/*` | `http://apps-shell:3000/booking...` | Mounted Booking read path in shell. |
| `/auth/` | Existing `http://apps-auth:3000/` | Preserve current auth route behavior. |
| `/health` | Existing Nginx local health response. | Can remain edge readiness check. |

Nginx should add shell locations before any catch-all. Existing `/reference-data/` routing is preserved for W0-02 and is not repurposed by U01.

## Environment Definitions

| Service | Required local configuration |
| --- | --- |
| `apps-shell` | `AUTH_BASE_URL` or equivalent route to `apps-auth`, `BOOKING_APP_URL` if shell calls Booking BFF HTTP, `BOOKING_SERVICE_URL` only if shell hosts BFF logic, `BOOKING_SERVICE_TOKEN` only server-side, and session cookie name compatibility for `lc_session`. |
| `apps-auth` | Existing identity-service/Keycloak configuration; no parallel auth provider. |
| `apps-booking` | Existing `BOOKING_SERVICE_URL=http://booking-service:8085` and `BOOKING_SERVICE_TOKEN`. |
| `booking-service` | Existing service token and dependency URLs; no U01 cloud-specific settings. |

## Resource Sizing

Reuse existing local constraints as a starting point: `apps-booking` is limited to `0.75` CPU and `512M` memory, `booking-service` to `1.0` CPU and `768M`. U01 may set `apps-shell` to the same or lower Next.js profile, for example `0.75` CPU and `512M`, unless local proof shows a concrete need.

## Preservation Boundary

U01 deployment architecture does not add AWS services, CDK, IAM, VPC, CDN, queues, caches, or new runtime auth services. W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries. W1's live-proof waiver remains BLOCKED at `compose-start`; U01 runtime blockers are W2-01 blockers.

