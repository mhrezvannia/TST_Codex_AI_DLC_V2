# Incident Plan

## Inputs

This incident plan consumes `dashboards`, `alarms`, `reliability-design`, `security-design`, and `deployment-architecture`.

## Severity Levels

| Severity | Definition | Examples | Response target |
| --- | --- | --- | --- |
| P1 | Blocks local Shared Platform validation or creates unsafe auth behavior | Readiness failed, BFF sustained 503, auth bypass non-local | Immediate same session |
| P2 | Blocks runtime provisioning but code checks pass | Readiness blocked, Docker/Java/Maven missing | Same workday |
| P3 | Evidence or observability gap | Missing dashboard metric, optional observability profile down | Next planned work |

## Incident Flow

1. Detect via `alarms` or readiness evidence.
2. Assign severity.
3. Capture evidence:
   - `artifacts/readiness/local-readiness.json`
   - `artifacts/quality-gates/evidence.json`
   - `artifacts/contracts-live-verification.json`
   - `artifacts/seed-apply-attempt.json`
4. Run matching runbook.
5. Record outcome and remaining blockers.
6. Add follow-up work to the next AI-DLC intent if outside Shared Platform local functionality.

## Communication

Local incident note must include:

- Incident summary
- Severity
- Evidence paths
- Owner
- Current blocker
- Next command to run

## RTO/RPO

- Local validation RTO: same workday after prerequisites are available.
- Production RTO/RPO: not defined in this local Shared Platform intent.
