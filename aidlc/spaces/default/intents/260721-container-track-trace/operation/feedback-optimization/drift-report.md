# W2-04 Configuration and Infrastructure Drift Report

## Verdict

**Status: LIVE CANDIDATE DRIFT NOT ASSESSABLE / RELEASE-IDENTITY DRIFT
BLOCKING.**

The design baseline calls for one immutable, digest-bound candidate deployed by
`scripts/wave-a-compose.mjs` to the isolated `linercore-wave-a` project. The
final read-only snapshot had no such running project or release manifest.
Consequently, desired-to-live configuration drift cannot be measured.

## Evidence Basis

The comparison uses `dashboards`, `alarms`, `slo-config`, `deployment-log`,
`load-test-results`, and `incident-plan`, plus the U01-U03 infrastructure
designs.

- `deployment-log` binds the source baseline to
  `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f`, records 65 dirty entries,
  and records no deployment.
- `load-test-results` records that a partial Wave A project was observed under
  another controller and was correctly not adopted.
- `dashboards`, `alarms`, and `slo-config` describe a telemetry plane that is
  not active.
- `incident-plan` requires preservation and reviewed recovery rather than
  destructive reset.

## Baseline-to-Observation Matrix

| Baseline control | Final observation | Status |
|---|---|---|
| Isolated `linercore-wave-a` candidate | Project absent | NOT DEPLOYED |
| Immutable SHA/image/config/contract/migration manifest | Absent | BLOCKING GAP |
| Clean source identity | HEAD unchanged; 65 dirty entries | BLOCKING GAP |
| Immutable image references | Mutable `wave-a`, `local`, and demo tags observed | IDENTITY DRIFT |
| Single-controller isolation | This stage did not adopt concurrent work | CONFORMING |
| Protected manager demo on 8088 | 15 containers/services; routes 200/308/301/301 | PASS |
| Active metrics/traces | Prometheus 9090 and Jaeger 16686 unreachable | OBSERVABILITY DRIFT/GAP |
| W2-02 synchronization before visual acceptance | Exact synchronization not confirmed | BLOCKING GAP |
| Additive migrations and preserved volumes | No deployment or destructive action occurred | CONFORMING, NOT LIVE-VALIDATED |
| AWS Config inventory | No approved AWS target or resources | NOT APPLICABLE |

The protected manager project is a separate integration-owned environment and
must not be used as the W2-04 candidate baseline.

## Drift Classification

- **Release identity drift:** the working implementation is not represented by
  the recorded committed HEAD, and mutable tags are not a release manifest.
- **Runtime configuration drift:** unknown because no owned candidate is
  deployed.
- **Observability drift:** designed dashboards/alarms/SLIs are not backed by
  active application metrics and traces.
- **Cloud drift:** not applicable; this slice introduced no AWS resources, so
  AWS Config has nothing approved to compare.
- **Scope and ownership drift:** none observed in this stage; no shared stack,
  database, package, or manager resource was changed.

## Remediation and Recheck

1. synchronize the approved integration baseline, including W2-02;
2. commit the candidate and generate a hash-valid release manifest;
3. serialize ownership of the isolated controller;
4. deploy only the manifest-bound candidate without resetting volumes;
5. activate metrics, structured logs, and traces;
6. compare effective Compose config, image digests, migrations, contracts,
   routes, volumes, and telemetry config against the manifest;
7. retain the comparison in the acceptance evidence bundle.

Until those steps complete, drift status remains a release **HOLD**.
