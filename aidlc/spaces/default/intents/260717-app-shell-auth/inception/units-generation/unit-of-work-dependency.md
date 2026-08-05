# Unit of Work Dependency - W2-01 App Shell and Auth

## Source Context

This dependency DAG consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. It mirrors the vertical units in `unit-of-work.md`; Delivery Planning chooses the economic build path.

## Machine-Readable DAG

```yaml
units:
  - name: U01-walking-skeleton-shell-login-booking-read
    depends_on: []
  - name: U02-booking-create-allow-real-subject
    depends_on: [U01-walking-skeleton-shell-login-booking-read]
  - name: U03-booking-deny-inside-shell
    depends_on: [U01-walking-skeleton-shell-login-booking-read]
  - name: U04-signout-session-expiry-guard
    depends_on: [U01-walking-skeleton-shell-login-booking-read]
  - name: U05-route-compatibility-prior-work-preservation
    depends_on: [U01-walking-skeleton-shell-login-booking-read, U02-booking-create-allow-real-subject]
  - name: U06-final-live-acceptance-detector-audit
    depends_on: [U02-booking-create-allow-real-subject, U03-booking-deny-inside-shell, U04-signout-session-expiry-guard, U05-route-compatibility-prior-work-preservation]
```

## Dependency Edges

| Unit | Direct dependencies | Dependency rationale |
| --- | --- | --- |
| U01 Walking Skeleton - Shell Login to One Booking Read | none | Establishes shell/auth/session/Booking-read seam and proves no `local-user` fallback on the thinnest live path. |
| U02 Booking Create Allow Path With Real Subject | U01 | Needs shell/session/Booking actor path before create/detail/identity allow proof can be observed. |
| U03 Booking Deny Path Inside Shell | U01 | Needs shell/session/Booking route frame before deny behavior can be observed. |
| U04 Sign-Out and Session Expiry Guard | U01 | Needs shell/session/user menu route frame before sign-out and stale-call behavior can be observed. |
| U05 Route Compatibility and Prior-Work Preservation | U01, U02 | Needs canonical shell routes and preserved create/detail behavior before compatibility and prior-work checks are meaningful. |
| U06 Final Live Acceptance, Detector, and Audit Package | U02, U03, U04, U05 | Final evidence depends on allow, deny, sign-out, compatibility, and preservation behavior. |

## Integration Points

| Integration | Units | Contract |
| --- | --- | --- |
| Browser/Nginx to shell | U01, U03, U04, U05, U06 | `apps/shell` routes `/`, `/booking`, `/booking/new`, `/booking/[id]` through Nginx. |
| Shell to auth | U01, U04, U06 | Existing `apps/auth` routes and `packages/auth` session DTOs. |
| Shell to Booking BFF | U01, U02, U03, U04, U05 | Session-derived actor subject and correlation context. |
| Booking BFF to booking-service | U01, U02, U03, U04, U05 | `X-LinerCore-Actor-Id`, service token/id, idempotency, correlation. |
| booking-service to identity-service | U02, U03, U06 | `POST /internal/identity/authorize` with `booking` resource/action mapping. |
| Prior-work seams | U02, U05, U06 | Stable W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system interfaces. |
| Evidence and audit | U01-U06 | Live evidence package, detector 6d, and `aidlc-audit`. |

## Parallel Opportunities

These are topology facts, not a recommended delivery sequence:

- U03 and U04 have no direct dependency between each other once U01 exists.
- U05 depends on U02 because preservation checks need a real create/detail path.
- U06 depends on all behavior units because it packages final acceptance.

## Cycle Check

The DAG is acyclic:

- No unit depends on itself.
- All edges point from observed prerequisite behavior to downstream observed behavior.
- identity-service, booking-service, and shell dependencies remain one-way; no service depends on UI.

## Topology Guard

This artifact does not choose a critical path or a recommended build order. Stage 2.8 Delivery Planning uses this DAG with delivery economics, walking-skeleton posture, and risk/value tradeoffs to decide Bolt sequencing.
