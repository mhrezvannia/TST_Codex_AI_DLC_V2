# Reliability Design — booking-design-system-closure

## Design Inputs

This design implements `reliability-requirements.md` and aligns with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. Reliability is produced through explicit outcomes, failure isolation, idempotency, deterministic evidence, and hard stop conditions.

## Resilience Pattern

No new automatic retry, circuit breaker, bulkhead, fallback cache, or queue is added. Existing boundaries already provide:

- BFF abort at 2,500 ms;
- service/BFF safe error mapping;
- command idempotency propagation;
- service-owned domain validation and persistence;
- isolated container health/startup behavior.

The UI adds explicit state/focus/announcement/retry behavior. A user may retry only a named recoverable operation. Validation-blocked waits for correction; denied has safe navigation only; degraded retries only the unavailable capability; fatal uses the route boundary; confirm unknown outcome preserves idempotency and never asserts success.

## Failure Matrix

| Failure domain | Detection | Containment | Recovery/evidence |
|---|---|---|---|
| Route read | Typed shell load result | Route state inside existing shell | Retry same route; retain query/correlation |
| Reference/pricing dependency | Normalized partial/error response | Keep valid form/Booking data | Retry affected capability |
| Lifecycle command | Action reducer and response | One pending command, no false status | Safe explicit retry/reload |
| Authorization | 401/403 | Remove forbidden action; retain safe shell | Sign-in or safe navigation |
| Fatal UI error | Error boundary/test signal | Route subtree only | Named boundary, trace, no false retry |
| Acceptance harness | Non-zero assertion/process result | Evidence run only | Retain failure, correct harness/production cause in scope |
| Wave A stack | Wrapper health/command result | `linercore-wave-a` only | Diagnose/restart through wrapper |
| Manager demo guard | Pre/post guard | Stop acceptance/closure | No stack substitution; user escalation if needed |

## Accessibility Reliability

A root helper applies the same assertions to each required route/state:

- severity-capable automated scan: zero critical/serious;
- semantic landmarks/names/labels and non-color-only status;
- keyboard order, visible focus, error-summary movement, dialog trap/Escape/restore;
- live-region announcement without duplicate noise;
- reduced-motion behavior;
- both themes and four viewports;
- zero page overflow, overlap, or clipped primary control.

If no severity-capable checker exists, code generation adds a pinned dev-only Playwright/axe adapter. Failure or unavailability remains pending, never waived.

## Acceptance Orchestration

1. Capture commit/environment and run pre-demo guard.
2. Use only the Wave A wrapper/project for start/status/logs.
3. Prove real authenticated create → validate → price → confirm → detail.
4. Run difficult-state, theme, viewport, keyboard, and accessibility cases.
5. Preserve result/trace/screenshot/command data for every failure.
6. Perform cleanup through the wrapper and run final demo guard.
7. Run both audits with direct exit results.
8. Update backlog only if the manifest is complete and every gate is green.

The orchestrator never targets `linercore-shared-platform`, never runs unscoped Compose teardown, and never treats container startup as journey completion.

## Observability and Retry Record

Every case links run ID, requirement/story, route, setup method, correlation-safe identity, command timestamps, terminal state, theme, viewport, assertions, artifacts, and exit result. Retried cases retain their original result and link the correction/rerun.

Expected fatal-boundary tests record the exact injected error separately from unexpected page errors; any additional error or timeout fails. Non-fatal cases require zero unhandled errors/rejections/timeouts.

## Non-Design

No SLA/SLO, RTO/RPO, backup/restore, failover, multi-AZ, monitoring dashboard, alert, retention, production deployment, or AWS recovery design is introduced. The local evidence proves only the documented isolated run.

