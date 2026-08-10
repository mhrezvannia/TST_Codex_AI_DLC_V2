# SLO Report - W1-01

## Compliance Summary

| SLO | Target from `slo-config.md` | Current evidence | Status |
|---|---|---|---|
| Booking nginx page availability | 100 percent during release smoke | `deployment-log.md` shows `booking-ui-health` skipped after `compose-start`; diagnostic nginx probe failed | BLOCKED |
| Booking confirmation to visible CMM status | p95 <=5 seconds | `load-test-results.md` shows workload not executed | BLOCKED |
| Booking API latency | p95 <=500 ms for draft/detail | No full workload evidence | BLOCKED |
| Charge pricing latency | p99 <=800 ms | No full workload evidence | BLOCKED |
| Event relay correctness | zero stuck outbox, duplicate logical event, happy-path DLT, schema mismatch | No full journey evidence | BLOCKED |
| Release evidence integrity | PASS manifest and valid detached attestation | `deployment-log.md` status BLOCKED | BLOCKED |

## Error Budget

For the local W1 release proof, the error budget is consumed for run `operation-deployment-execution`. The failure is environmental at Compose image pull, not a measured application latency failure, but it still blocks the release claim because `alarms.md` treats a non-PASS manifest and missing nginx smoke as P1 release blockers.

## Operational Reading

`dashboards.md` and `alarms.md` now define the SLO observability surfaces, but runtime SLO compliance cannot be inferred from source configuration. The next valid compliance report must be generated from a fresh `node scripts/w1-live-acceptance.mjs --run-id <new-id>` run whose manifest records PASS.

## Source Coverage

This report consumes `dashboards.md`, `alarms.md`, `slo-config.md`, `deployment-log.md`, `load-test-results.md`, and `incident-plan.md`.
