# Shared Infrastructure - U01 Walking Skeleton

## Source Context

This shared infrastructure design consumes U01 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U01 `business-logic-model.md`. It names the shared local resources U01 uses and protects from redesign.

## Shared Resource Inventory

| Shared resource | Existing owner | U01 use | Boundary |
| --- | --- | --- | --- |
| Compose network `linercore-local` | Platform/local runtime | Connect shell, auth, Booking, identity, and Nginx. | Reuse only. |
| Nginx service | Local edge | Add shell route entries. | Preserve `/auth/`, `/reference-data/`, and `/health`. |
| PostgreSQL | Existing services | Indirectly used by identity and booking-service. | No schema/storage redesign. |
| Keycloak | Auth runtime | Existing login provider. | No new provider or realm redesign in U01. |
| Kafka/Schema Registry | W0-01 platform/eventing | Existing dependencies for services. | No eventing redesign. |
| `apps-auth` | Auth surface | Session/auth routes. | Reuse; no parallel auth. |
| `apps-booking` and booking-service | W1 Booking | Booking read/list behavior and BFF. | Preserve behavior; harden actor boundary. |
| Reference/charge services | Prior domain services | Existing Booking dependencies. | No UI migration or domain redesign. |

## Access Boundaries

- Browser accesses W2-01 through Nginx.
- Nginx accesses `apps-shell`, `apps-auth`, and preserved routes over Compose DNS.
- Shell/BFF server-side code accesses service URLs and service tokens.
- Browser code never receives service tokens or raw session tokens.
- booking-service remains the backend owner for Booking data and rejects blank actors.

## Cross-Unit Ownership

U01 establishes shared shell/Nginx infrastructure used by U02-U06. Later units may extend the same `apps-shell` service and route table, but they must not reinterpret U01's constraints:

- no AWS/cloud acceptance path
- no cache/CDN/queue/new runtime service
- no broad design-system foundation
- no W1 waiver PASS rewrite
- no `local-user` protected fallback

## Preservation Controls

| Prior work | Control |
| --- | --- |
| W0-01 platform/eventing | Keep Kafka/Schema Registry/platform services untouched except normal dependency reuse. |
| W0-02 reference-data | Preserve `/reference-data/` Nginx route and service dependencies. |
| W1-01 Booking | Preserve existing Booking runtime and behavior while changing actor propagation only where W2-01 requires. |
| W2-02 design-system foundation | Consume existing primitives/patterns; no shared styling stack change. |

## Failure Isolation

If `apps-shell` fails, existing `apps-auth`, `apps-booking`, reference-data, Booking backend, and platform services should remain independently diagnosable. If Nginx route changes break existing `/auth/` or `/reference-data/`, U01 fails and must be fixed before claiming PASS.

