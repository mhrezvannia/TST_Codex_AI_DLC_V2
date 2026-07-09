# Monitoring Design - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| Evidence bundle runtime | CI/local evidence collection exceeds budget. |
| Quality gate runtime | Gate evaluation exceeds budget or fails to emit result. |
| Missing/stale/failed evidence | Required readiness blocked. |
| Contract health | Contract aggregation blocked or stale. |
| Observability signal missing | Flow/service observability readiness blocked. |
| Security evidence missing | Denied-path/auth/service JWT/ACL evidence absent. |
| Manual override attempt | Failed evidence attempted to become green manually. |
| Carry-forward risk missing owner | Operation handoff blocked. |

## Dashboard Specification

Dashboards show evidence run status, freshness keys, gate results, blocker owners, contract health, runtime health, E2E flow evidence, observability signals, security/resilience checks, dashboard/alert/runbook inventory, and Operation carry-forward risks.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors evidence bundle, gate, contract, and dashboard budgets. |
| `security-design.md` | Monitors access, redaction, required security evidence, classification, retention, and audit. |
| `scalability-design.md` | Groups by flow, contract, asset, sample, blocker, owner, and status. |
| `reliability-design.md` | Alerts on fail-closed blockers, partial evidence, manual override attempts, and carry-forward risks. |
| `logical-components.md` | Monitoring maps to evidence, gate, completion guard, readiness handoff, and read-only view components. |
| `components.md` | Feeds Observability Platform and Enterprise Web operations views. |
| `services.md` | Covers observability/runtime/contract/service topology. |
| `business-logic-model.md` | Observes evidence, quality gate, readiness handoff, and no-fake-completion workflows. |
