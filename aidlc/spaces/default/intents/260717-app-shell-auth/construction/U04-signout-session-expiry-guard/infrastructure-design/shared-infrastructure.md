# Shared Infrastructure - U04 Sign-Out and Session Expiry Guard

## Source Context

This shared infrastructure design consumes U04 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U04 `business-logic-model.md`. It identifies shared resources used by sign-out and stale-call containment.

## Shared Resource Inventory

| Shared resource | Existing owner | U04 use | Boundary |
| --- | --- | --- | --- |
| Nginx edge | Local runtime | Accepted browser path for sign-out and reauth proof. | Reuse only. |
| `apps-auth` sign-out route | Auth owner | Cookie deletion and Keycloak logout redirect. | No shell-owned clone. |
| Keycloak | Auth runtime | Logout flow. | No new provider. |
| `apps-shell` | W2-01 shell | User menu and protected routes. | Initiates logout, does not own session invalidation. |
| `apps-booking` BFF | Booking UI/BFF owner | Stale-call early return. | Guard fan-in, no domain rewrite. |
| booking-service | W1 Booking backend | No-`local-user` safety net evidence. | Preserve Booking behavior. |

## Access Boundaries

- Shell can initiate sign-out but auth route owns session clearing.
- Browser-visible state is never proof of server session termination by itself.
- BFF actor guard stops stale calls before service headers and backend fetch.
- booking-service logs/request counters are independent evidence for no stale `local-user` request.

## Cross-Unit Ownership

U04 depends on U01 shell routing and U02/U03 actor hardening. It provides sign-out/stale-call evidence later consumed by U06. It must not alter identity fixtures, Booking domain behavior, or W1 waiver status.

## Preservation Controls

| Prior work | Control |
| --- | --- |
| W0-01 platform/eventing | Reuse correlation/logging only; no eventing redesign. |
| W0-02 reference-data | Preserve reference-data routes and fixtures. |
| W1-01 Booking | Preserve Booking read/detail behavior; guard stale calls only. |
| W2-02 design-system foundation | Consume existing user-menu/state primitives; no foundation work. |

## Failure Isolation

If sign-out or stale-call containment fails, U04 blocks independently. Existing auth, Booking, reference-data, and platform services remain diagnosable. W1 waiver remains BLOCKED at `compose-start` and is not used as U04 PASS evidence.

