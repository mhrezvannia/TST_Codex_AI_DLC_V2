# Configuration And Infrastructure Drift Report - W2-01 App Shell and Auth

## Inputs And Detection Boundary

This report compares observed runtime evidence in `deployment-log` with intended signals and controls in `dashboards`, `alarms`, `slo-config`, `load-test-results`, and `incident-plan`. There is no AWS stack, AWS Config recorder, or Trusted Advisor scope, so cloud drift detection is NOT APPLICABLE.

## Drift Register

| Area | Intended state | Observed state | Classification | Action |
| --- | --- | --- | --- | --- |
| Official Elastic images | Elastic 8.16.1 from `docker.elastic.co` | Elasticsearch and Kibana official images healthy | CONVERGED | Preserve tags and provenance |
| Host ports | Canonical container ports with usable host bindings | Windows reserves some defaults; approved variables map Jaeger/OTel/Kibana to alternate host ports | REVIEWED LOCAL VARIANCE | Keep defaults portable and document host overrides |
| OTel exporter | Collector starts with supported exporter | Deprecated `logging` exporter replaced by `debug`; collector healthy | CONVERGED | Keep config pinned to image compatibility |
| Prometheus targets | Application metrics scrape successfully | Seven configured app targets down: JSON payloads or Spring 404 | OPEN DRIFT | Add real metrics endpoints and readiness gate |
| Application traces | Sanitized W2 requests appear in Jaeger | Collector/Jaeger healthy; no application spans confirmed | OPEN DRIFT | Instrument OTLP and verify one end-to-end trace |
| Application logs | Searchable structured logs in Elastic/Kibana | Elastic/Kibana healthy; no shipper/index/data view confirmed | OPEN DRIFT | Add shipping, index lifecycle, and query validation |
| Clean full build | Full profile rebuild completes reproducibly | Full `--build` attempt timed out on context transfer | OPEN DRIFT | Reduce build contexts; rerun without changing W1 evidence |
| Charge restart | Existing schema survives restart | `IF NOT EXISTS` migration guard verified and service healthy | CONVERGED | Retain regression test |
| W2 acceptance | Runtime, scenarios, and audits PASS | Strict package validation PASS | CONVERGED | Keep runner in release proof |
| W1 acceptance | Waiver remains BLOCKED until real proof | Images available, but full build timed out; waiver unchanged | OPEN SEPARATE GATE | Complete W1 on its own evidence path |

## Security And Process Drift

- No `local-user` actor fallback is observed in mounted surfaces.
- The acceptance runner now resolves Git Bash deterministically on Windows and removes stale blocker rows on PASS.
- Recovery automation remains diagnostics-only as required by `incident-plan`; no unreviewed restart or policy rollback has been introduced.
- Production SLO status remains NOT MEASURABLE, consistent with `slo-config` and the telemetry drift above.

## Reconciliation Policy

Do not auto-reconcile host-specific port variance into shared defaults. Open telemetry and build-reproducibility drift require reviewed code/config changes with focused tests. Converged items remain regression-protected. The W1 row is tracked separately and must never be closed by W2 PASS evidence.
