# Unit of Work — W2-02 Design-System Closure

## Decomposition Basis

This Unit is derived from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`; it covers every gate in `requirements.md` and every Must story in `stories.md`. The binding scope requires one vertical closure boundary, so internal work areas are checkpoints, not independently closable Units.

## Unit: booking-design-system-closure

| Field | Value |
|---|---|
| Name | `booking-design-system-closure` |
| Outcome | Canonical authenticated Booking list/create/detail consumes the shared UI foundation and closes W2-02 only through durable isolated live evidence and green audits. |
| Relative complexity | XL |
| Deployment model | Embedded changes to existing workspace packages/apps plus root local acceptance harness; no new deployable service or cloud environment. |
| Stories | US-001 through US-006 |
| Requirements | FR-001 through FR-012; NFR-001 through NFR-009 |
| Acceptance boundary | Non-separable; every internal checkpoint and final audit must pass. |

### Responsibilities

1. Preserve baseline `c2f13dd` and all prior merged W0/W1/W2-01/existing W2-02 behavior.
2. Complete only proven generic token/primitive/test gaps in `packages/ui`.
3. Make `apps/shell` the sole canonical Booking presentation and migrate applicable list/create/detail/lifecycle states to `@erp/ui`.
4. Retain `apps/booking` BFF endpoints and protections; decommission or redirect duplicate standalone presentation routes.
5. Preserve shell → BFF → Booking/reference/pricing service calls, service-owned data, and async confirmed-Booking events.
6. Extend hard anti-drift enforcement and non-writing negative probes across applicable application presentation sources.
7. Add root Playwright/config/evidence helpers for the canonical live route, difficult states, keyboard/accessibility, themes, and four viewports.
8. Protect the manager demo with pre/post guards and operate only `linercore-wave-a` via `scripts/wave-a-compose.mjs`.
9. Run focused/static/build checks plus `aidlc-audit` and `erp-fidelity-audit`; update the backlog only after all green.
10. Preserve historical W1 blocked/waived truth separately from later W2-02 evidence.

## Boundaries

### In scope

- `packages/ui/**` generic shared tokens/primitives/tests where a closure gap is demonstrated.
- `apps/shell/app/booking/**`, shell-side Booking adapters/routes, and the minimum shell seam needed for one canonical UI.
- `apps/booking` manifest/BFF compatibility and standalone page retirement/redirect.
- Root lint/test/Playwright/evidence configuration and `artifacts/w2-02-live/`.
- W2-02 backlog/evidence references after hard gates pass.

### Out of scope

- New backend business rules, service APIs, event schemas, databases, AWS/IaC, production deployment, other module migrations, shell replacement, rebrand, or generic component expansion.
- Any lifecycle action against `linercore-shared-platform`.
- Reclassification of the historical W1 waiver as PASS.

## Internal Work Areas and Checkpoints

These areas describe dependency and verification structure only. They are not separate Units and do not define the economic Bolt sequence.

| Area | Owns/delivers | Completion checkpoint |
|---|---|---|
| A. Shared foundation and enforcement | Generic package corrections, consumption inventory, CSS/style-system/manifest checks, negative probes | Shared tests and positive/negative gates pass |
| B. Canonical Booking presentation | Shell-owned list/create/detail/lifecycle, all explicit states, responsive/theme/accessibility behavior | Focused component/route tests pass; duplicate shell/theme absent |
| C. BFF and route consolidation | Preserve BFF endpoints/protections; retire/redirect standalone pages | Contract tests pass; canonical route/network chain verified |
| D. Isolated live acceptance | Demo guard, wrapper-only Wave A stack, Playwright happy path and controlled states, evidence manifest | Required keyboard/state/theme/viewport/accessibility evidence complete |
| E. Audited closure | Static/build suite, final guard, both audits, truthful backlog update | Every gate green; W2-02 evidence cited; W1 record unchanged |

## Interfaces and Integration Constraints

- UI composition consumes `@erp/ui`; `packages/ui` never imports Booking.
- Shell route calls shell adapter/BFF; it never imports `apps/booking` source or calls service storage.
- Booking BFF continues existing auth, correlation, idempotency, body-size, timeout, and safe-error behavior.
- Acceptance harness drives the canonical nginx/shell route and may control rare presentation states only on that running route.
- Production code does not import test/evidence helpers.

## Quality and Test Constraints

- Tests are written alongside changes and defects receive a focused regression when practical.
- Lint, typecheck, focused tests, relevant workspace tests, and production build are necessary but not sufficient.
- Live Compose behavior, keyboard-only journey, state/theme/viewport matrix, demo safety, durable evidence, and both audits are hard gates.
- No invented coverage percentage, security scanner result, AWS readiness, or formal accessibility certification.

## Done Condition

The Unit is done only when US-001 through US-006 and FR/NFR coverage are evidenced together under `artifacts/w2-02-live/`, both audits and the final demo guard are green, the manager demo remains untouched, and the backlog closes W2-02 with the evidence path. Partial checkpoint completion is progress, never Unit completion.

## Review

**Verdict:** READY

**Findings:** The single `booking-design-system-closure` Unit exactly matches the approved answers. Its internal areas remain non-closable checkpoints; the dependency artifact declares the Unit exactly once in a valid one-node acyclic YAML graph and avoids economic ordering or critical-path claims. All six stories and every FR/NFR group map to the Unit. The boundaries preserve the shell/BFF/service seams, demo safety, root live proof, both audits, and historical W1 truth, while creating no new service, database, AWS stack, production environment, or independently deployed artifact.

**Mandatory corrections:** None.
