# Shared Infrastructure - U05 Route Compatibility and Preservation

## Source Context

This shared infrastructure design consumes U05 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U05 `business-logic-model.md`. It identifies shared resources affected by route compatibility and preservation evidence.

## Shared Resource Inventory

| Shared resource | Existing owner | U05 use | Boundary |
| --- | --- | --- | --- |
| Nginx edge | Local runtime | Forward `/bookings*` and canonical `/booking*` to shell. | Preserve `/auth/`, `/reference-data/`, `/health`. |
| `apps-shell` routes | W2-01 shell | Compatibility redirects and canonical protected routes. | No Booking domain ownership. |
| `apps-booking`/booking-service | W1 Booking | Canonical behavior after redirect. | No legacy prefetch or semantics change. |
| Preservation diff | Delivery evidence | W0/W1/W2 touch classification. | Not runtime infrastructure. |
| W1 waiver artifact | W1 evidence | Explicit BLOCKED reference. | No PASS rewrite. |

## Access Boundaries

- Legacy routes enter through Nginx and reach shell only.
- Shell redirects before Booking BFF/backend data loading.
- Canonical route owns auth/session/actor behavior after redirect.
- Preservation tooling reads file paths/diffs and writes evidence; it does not run in user request paths.

## Cross-Unit Ownership

U05 consumes U01 shell routing and U02/U03/U04 auth/session/actor hardening. It supplies route and preservation evidence for U06. It must not broaden scope into W4-01 migrations or design-system foundation work.

## Preservation Controls

| Prior work | Control |
| --- | --- |
| W0-01 platform/eventing | Any touch needs W2-01 reason and targeted verification; no eventing redesign. |
| W0-02 reference-data | Preserve routes, seed/completeness surfaces, and UI. |
| W1-01 Booking | Preserve list/detail/create/action behavior and waiver BLOCKED status. |
| W2-02 design-system foundation | Consume existing patterns only; no foundation work. |

## Failure Isolation

If compatibility routing fails, canonical `/booking*` routes and existing app services remain diagnosable. If preservation evidence finds an unjustified prior-work touch, U05 blocks until reason and targeted verification are recorded.

