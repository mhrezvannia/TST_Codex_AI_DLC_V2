# Smoke Test Results — W2-02 Design-System Closure

## Inputs and evidence source

Smoke results implement `operation/deployment-pipeline/cd-config.md` and `operation/deployment-pipeline/deployment-strategy.md`, use the target described in `operation/environment-provisioning/environment-inventory.md`, and are sourced from `construction/build-and-test/build-test-results.md`.

## Deployment smoke checks

| Check | Result | Evidence |
|---|---|---|
| Protected manager before deployment | PASS | 21 services/containers and required route responses |
| Wave A ownership | PASS | No pre-existing project resources |
| Nginx acceptance edge | PASS | Readiness gate at port 18088 |
| SSR control proxy | PASS | Loopback control readiness at port 14312 |
| Required service status | PASS | All required Compose services running; none unhealthy |
| Authenticated Shell → Booking path | PASS | Canonical list/create/detail journey |
| Deterministic fixture | PASS | Pricing agreement fixture gate |
| Successful mutation | PASS | Create-to-confirm keyboard journey plus sanitized trace |
| Difficult states | PASS | Loading, empty, error, denied, degraded, validation and action outcomes |
| Accessibility | PASS | Keyboard/focus/live-region/reduced-motion and zero serious/critical axe findings |
| Responsive presentation | PASS | 375, 768, 1024 and 1440 viewports; no prohibited page overflow/clipping |
| Themes | PASS | Light and dark resolved-token evidence |
| Undeploy | PASS | Wrapper cleanup completed |
| Protected manager after deployment | PASS | 21 services/containers; routes 200/308/301/301 |

## Browser totals

- Expected: 98
- Passed: 98
- Unexpected: 0
- Skipped: 0
- Flaky: 0
- Duration: 289,117.798 ms
- Case records: 98
- Screenshots: 98

The complete browser suite is a strict superset of a minimal smoke suite and is the binding deployment verification for this closure.

## Audit and evidence checks

- `aidlc-audit`: PASS, exit 0.
- `erp-fidelity-audit`: PASS, exit 0.
- Mutation trace sanitizer: PASS.
- Evidence manifest validation: PASS at formal publication.
- Terminal attempt: `COMPLETED`.

Audit outputs are mechanical leads and do not imply security certification.

## Result and limitations

**Deployment smoke result: PASS.**

This proves the local isolated W2-02 deployment only. It does not prove staging/production behavior, load, soak, stress, capacity, TLS, external identity, backup/restore, disaster recovery, or production monitoring.
