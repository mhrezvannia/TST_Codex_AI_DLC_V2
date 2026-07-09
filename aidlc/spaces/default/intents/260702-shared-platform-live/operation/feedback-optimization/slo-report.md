# SLO Report

## Inputs

This report consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Executive Summary

Overall SLO status: BLOCKED.

The configured local SLOs are valid, but they cannot be declared met because the deployment is halted before runtime execution. `deployment-log` records that Docker, Java, Maven, and required services are unavailable. `load-test-results` confirms no live load test ran because Keycloak, Identity, Reference Data, nginx, Kafka, and Schema Registry are not listening. `incident-plan` classifies this as a P2 provisioning blocker unless readiness becomes failed or unsafe auth behavior appears.

## SLO Compliance Matrix

| SLO from `slo-config` | Target | Current evidence | Status |
| --- | --- | --- | --- |
| Local readiness | 100% pass before demo deployment | `artifacts/readiness/local-readiness.json`: 7 passed, 3 blocked, 0 failed | Blocked |
| Reference Data BFF availability | 99% successful BFF requests during local validation | Services are not running; BFF live path cannot be measured | Blocked |
| Reference Data BFF latency | p95 under 500 ms locally | No live workload; `load-test-results` blocked | Blocked |
| Auth bypass safety | 100% denial outside local/test profiles | Auth guard tests passed in Build and Test evidence | Met for code checks |
| Contract correctness | 100% offline provider contract verification | Offline `contracts:verify` passed; live contracts blocked | Partially met |
| Seed correctness | 100% seed dry-run validation | Seed dry-run passed; live seed apply blocked by service availability | Partially met |
| Event freshness | Pending reference events below 5 minutes after runtime is healthy | Kafka and Schema Registry not listening; no outbox runtime data | Blocked |

## Error Budget

Error budget posture: frozen.

The `slo-config` error budget policy says failed readiness stops deployment and blocked readiness requires provisioning before deployment. Current status is blocked, not failed. That means feature promotion and downstream module work should wait until prerequisites are installed and local runtime checks pass.

## Alarm Mapping

The active alarm state from `alarms` is `Readiness blocked` at P2. If the BFF returns sustained `503` after services start, `BFF upstream unavailable` becomes P1. If auth bypass is ever enabled outside a local/test profile, `Auth bypass non-local` becomes P1 and must stop promotion.

## Operational Decision

Do not mark the Shared Platform as locally functional yet. The immediate SLO objective is to turn readiness from blocked to passed, then run live contracts, live seed apply, UI smoke, and load testing.
