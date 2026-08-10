# W2-03 Configuration and Operational Drift Report

## Reporting status and source evidence

Runtime drift status: **UNASSESSED - NO DEPLOYED CANDIDATE**.

This report consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`,
`load-test-results`, and `incident-plan`. No Wave A mutation or runtime drift
scan occurred. Therefore “no drift” cannot be claimed. The report distinguishes
desired-state gaps, unassessed runtime state, and one observed workflow-metadata
defect.

## Desired-state baseline

The approved baseline requires:

- exact wrapper-owned `linercore-wave-a` project and network;
- loopback edge port 18088 and no manager port 8088 publication;
- immutable candidate/image/config identity;
- service-owned Charge and Booking databases with ordered migrations;
- fixed fail-closed auth/dependency configuration and runtime-injected local
  secrets;
- bounded resources, readiness/semantic probes, and guarded recovery;
- Prometheus/Grafana and OpenTelemetry/Jaeger configuration with safe labels;
- locked streaming evidence writer and closed U06 manifest;
- manager/sibling before/after equality.

The source of truth is version-controlled configuration and approved stage
artifacts, not a console or mutable runtime.

## Drift register

| ID | Class | Desired | Observed | Status | Next evidence |
|---|---|---|---|---|---|
| DRIFT-01 | deployment runtime | exact candidate Wave A topology | no deployment attempted | UNASSESSED | rendered config plus live project/network/port/image/volume inventory |
| DRIFT-02 | monitoring runtime | verified dashboards, alarms, SLO metrics, traces | design files only | GAP | provisioned definitions, scrape/label checks, screenshots, trace linkage |
| DRIFT-03 | incident operations | assigned roles, channel, rehearsed runbooks | plan only; roles unassigned | GAP | contact registry, notification test, exercise evidence |
| DRIFT-04 | build/dependency environment | immutable candidate build | frontend spawn blocked; Booking dependency unavailable | GAP | successful locked frontend/Booking builds with hashes |
| DRIFT-05 | evidence runtime | locked native writer and valid ledger | writer capability blocked | GAP | native capability proof, crash/recovery/redaction exercise |
| DRIFT-06 | performance runtime | exact live NFR populations and metrics | not executed | UNASSESSED | raw rows, recomputation, resource and preservation evidence |
| DRIFT-07 | AI-DLC metadata | runtime graph memory paths resolve inside active intent record | operation stage paths omit `260721-charge-tariff-agreements` | DEFECT | regenerated graph with exact existing memory paths and successful `surface` reads |

## Observed AI-DLC metadata defect

The active runtime graph stores paths such as:

```text
aidlc/spaces/default/intents/operation/observability-setup/memory.md
```

The durable artifact actually resides at:

```text
aidlc/spaces/default/intents/260721-charge-tariff-agreements/operation/observability-setup/memory.md
```

The same omission affects Incident Response, Performance Validation, and
Feedback & Optimization rows. Consequently `aidlc-learnings.ts surface`
reported zero entries while the diaries contained entries. The workflow
manually surfaced selections and the deterministic persist path recorded the
chosen rules, but the runtime graph defect remains unresolved.

Impact:

- learning candidate detection is incomplete without manual recovery;
- `phase` is misreported as `spaces`;
- runtime summary paths disagree with the artifact tree and engine directive.

It did not alter application code, deployment state, or approved stage
artifacts.

## No-mutation conclusion

The `deployment-log` proves this workflow attempt did not create runtime drift:
no candidate/container/database migration/volume/port/manager mutation occurred.
That statement is limited to mutations caused by this attempt. It does not
prove the host or any pre-existing environment matches desired state.

## Future drift procedure

After deployment becomes eligible:

1. hash version-controlled Compose/env/nginx/Dockerfile/Flyway/dashboard/alarm
   definitions;
2. render config and compare project/network/ports/images/mounts/healthchecks;
3. inventory live wrapper-owned resources and owner markers;
4. compare database catalog/Flyway/checksums and backup/restore identities;
5. verify secrets/config presence without exposing values;
6. compare provisioned dashboard/alarm rules and telemetry labels;
7. run manager/sibling guard before and after;
8. record differences as expected, remediated, accepted-with-owner/expiry, or
   blocking.

If AWS is introduced by a later intent, CloudFormation/CDK/AWS Config drift
checks may be added then. None apply now.

## Conclusion

No runtime drift verdict is available. Six environment/implementation areas
remain GAP/UNASSESSED, and the AI-DLC runtime-graph memory-path issue is one
observed workflow defect.

