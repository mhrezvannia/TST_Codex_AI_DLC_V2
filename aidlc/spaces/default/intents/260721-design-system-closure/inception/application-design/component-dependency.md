# Component Dependencies — W2-02 Design-System Closure

## Design Basis and Direction

The dependency graph implements `requirements.md` and `stories.md` while preserving `architecture.md`, `component-inventory.md`, and `team-practices.md`. Dependencies flow from canonical presentation through explicit adapters to existing services. Production components never depend on the acceptance harness.

## Dependency Matrix

Legend: **R** runtime dependency, **T** test/build dependency, **E** evidence-only observation, **—** none.

| Consumer ↓ / Provider → | C1 UI | C2 Shell | C3 Booking UI | C4 Shell adapter | C5 Booking BFF | C6 Services | C7 Gate | C8 Harness |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| C1 UI foundation | — | — | — | — | — | — | T | T |
| C2 shell frame | R | — | — | — | — | — | T | E |
| C3 canonical Booking UI | R | R | — | R | — | — | T | E |
| C4 shell adapter | — | — | — | — | R | — | T | E |
| C5 Booking BFF | — | — | — | — | — | R | T | E |
| C6 services | — | — | — | — | — | existing only | existing | E |
| C7 anti-drift gate | scan | scan | scan | scan | scan | — | — | result |
| C8 acceptance harness | E | E | E | E | E | E | R | — |

## Allowed Dependency Rules

1. `apps/shell` may import `@erp/ui`, shared auth/types/config packages, and its own route/lib modules.
2. `apps/shell` must reach Booking behavior through its same-origin route adapters and the Booking BFF, never through an app-to-app source import or direct service URL.
3. `apps/booking` BFF may import declared shared auth/types/transport packages and call existing services; it must declare every workspace dependency it uses.
4. `packages/ui` depends only on React/declared generic peers and cannot import Booking, shell, auth-session, service, or evidence code.
5. Backend services retain their existing ports/adapters and service-owned stores; no frontend package enters Java domain dependencies.
6. C7 and C8 may inspect/drive production components, but production code never imports them.

## Forbidden Dependency Edges

- C3 → `apps/booking` source files (app-to-app import).
- C3/C4 → Booking-service database or internal Java module.
- C5 → shell/UI components.
- C1 → Booking domain types, routes, or copy.
- Any service → frontend application/package.
- Any acceptance helper → `linercore-shared-platform` lifecycle action.
- Any application → local color/token registry or undeclared workspace import.

## User-Journey Data Flow

### List/read

```text
Browser route
 -> C2 shell/session
 -> C3 list composition
 -> C4 loadShellBookings(query, cookie, correlation)
 -> C5 Booking BFF GET
 -> C6 Booking service
 <- normalized typed result
 -> C3 shared Skeleton/Table/EmptyState/StatusStrip
```

### Create and lifecycle commands

```text
C3 form/action
 -> C4 same-origin POST handler
 -> C5 proxyBooking
    [subject + correlation + idempotency + size + timeout]
 -> C6 Booking service
    -> reference/pricing dependencies as existing
 <- safe response/error
 -> C3 pending/success/error state with preserved context
```

### Confirmation event

```text
C6 Booking transaction -> outbox -> Kafka -> Container Movement consumer/store
```

The async flow is observed but not changed or made a UI write dependency.

## Acceptance and Evidence Flow

```text
C8 pre-demo guard
 -> scripts/wave-a-compose.mjs -> linercore-wave-a
 -> browser at canonical nginx/shell route
 -> C2/C3/C4/C5/C6 live path
 -> controlled same-route state variants where necessary
 -> C7 static/negative gates
 -> screenshots/traces/results/manifest under artifacts/w2-02-live
 -> post-demo guard
 -> aidlc-audit + erp-fidelity-audit
 -> backlog closure only if all green
```

## Shared Resources and Ownership

| Shared resource | Owner | Consumers | Constraint |
|---|---|---|---|
| `@erp/ui` tokens/primitives | W2-02 | shell and applications | generic only; no app-local copies |
| Auth/session context | Existing auth/shell | shell, BFF | preserve, no new bypass |
| Booking API/event contracts | Booking/service intents | BFF, support/downstream services | unchanged |
| nginx canonical routes | Platform baseline | browser/shell/apps | `/booking` remains shell-owned |
| Wave A Compose wrapper | Program acceptance | C8 | only `linercore-wave-a` |
| Manager demo | Manager-demo owner | none from C8 | observe with guard; never target |
| Evidence directory | W2-02 closure | reviewer/audits | durable, requirement-indexed, no premature PASS |

## Dependency Risks and Controls

| Risk | Control |
|---|---|
| Duplicate shell/Booking UI diverges | Canonicalize C3 in shell; retire/redirect standalone pages; route/DOM test |
| `@erp/ui` declaration without consumption | Import/DOM inventory plus C7 gate |
| Undeclared `@erp/auth` dependency in Booking | Manifest hygiene check and focused build |
| CSS bypasses lint | Extend C7 to applicable CSS and local style systems |
| Harness bypasses real architecture | Happy path must use canonical edge/BFF/service network trace |
| Audit command failure is masked | Capture direct exit status; failure prevents closure |
| Test damages manager demo | Mandatory guard before/after; wrapper/project assertion |
