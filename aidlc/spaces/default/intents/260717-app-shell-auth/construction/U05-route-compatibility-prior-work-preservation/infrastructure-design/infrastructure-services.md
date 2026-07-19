# Infrastructure Services - U05 Route Compatibility and Preservation

## Source Context

This infrastructure service design consumes U05 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U05 `business-logic-model.md`. It names the services and non-runtime evidence resources for route compatibility.

## Service Inventory

| Service/resource | Existing/New | U05 responsibility | Change |
| --- | --- | --- | --- |
| Nginx | Existing | Browser edge for `/bookings*` and `/booking*`. | Forward legacy routes to `apps-shell`. |
| `apps-shell` | Existing from U01 | Compatibility redirect routes and canonical protected shell routes. | Add fixed redirect handlers and validation rules. |
| `apps-booking` | Existing | Booking BFF/UI after canonical route. | No legacy-route prefetch or standalone proof. |
| booking-service | Existing | Booking domain behavior. | No compatibility routing concern. |
| Preservation diff report | Evidence artifact | W0-01/W0-02/W1-01/W2-02 touch review. | Build/evidence-time only. |

## Configuration Contract

| Configuration | Owner | Rule |
| --- | --- | --- |
| Nginx legacy forwarding | `infrastructure/nginx/default.conf` | `/bookings*` reaches `apps-shell:3000` unchanged. |
| Redirect status | `apps-shell` | GET compatibility routes return 308 when valid. |
| Query allowlist | `apps-shell` | `/bookings` keeps `page`, `pageSize`, `sort`, `direction`, `status`, `q`; `/bookings/new` and `/bookings/[id]` drop all query params. |
| Encoded handling | `apps-shell` | Decode once, re-encode valid values, drop invalid query values, shell 404 invalid ids. |
| Preservation scope | Evidence tooling | W0-01, W0-02, W1-01, W2-02 touched paths require W2-01 reason and targeted check. |

## Storage and Data Services

U05 adds no storage, cache, queue, database, search service, or route lookup table. Compatibility route state is static source code/configuration. Preservation evidence is committed artifact data, not application state.

## Service Discovery

Use existing Compose DNS: Nginx proxies to `apps-shell:3000`; canonical shell routes continue to existing `apps-booking`, booking-service, and auth services as defined by prior units.

## Security Services

No new security service is introduced. Security comes from fixed redirect mapping, no open redirect input, canonical route auth/session/actor checks, and no backend call before compatibility redirect.

## Shared Infrastructure Boundary

U05 protects current Nginx routes for `/auth/`, `/reference-data/`, `/health`, and canonical shell routes. It must not route legacy Booking URLs to standalone `apps-booking` outside the shell for acceptance.

