# Drift Report - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Drift Summary

| Drift Area | Status | Evidence |
| --- | --- | --- |
| Cloud infrastructure | Not applicable | No cloud resources provisioned |
| Local runtime state | Not measured live | `deployment-log` says servers are stopped |
| Observability config | Documented | `dashboards`, `alarms`, and `slo-config` exist |
| Incident process | Documented | `incident-plan` exists |
| Performance evidence | Not measured live | `load-test-results` marks live checks not run |

## Risks

The main drift risk is documentation drifting ahead of executable local automation. The next pass should add a single local start/stop/smoke command that writes evidence matching the current dashboard and SLO fields.

## Remediation

Add an executable local readiness script after functional units are implemented:

1. Start required local processes.
2. Run backend, frontend, and proxy smoke checks.
3. Capture latency metrics.
4. Write JSON evidence for dashboards/SLO report.
5. Stop processes cleanly on request.

