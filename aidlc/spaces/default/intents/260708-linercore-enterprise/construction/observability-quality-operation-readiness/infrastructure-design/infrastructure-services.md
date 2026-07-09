# Infrastructure Services - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| Evidence collectors | Contract, runtime, service test, observability, security, and resilience evidence collection. |
| Quality gate evaluator | Policy evaluation and pass/blocked/partial/carry-forward result generation. |
| Prometheus/Grafana | Metrics and dashboards. |
| Jaeger/OpenTelemetry Collector | Tracing and telemetry pipeline. |
| Logs/search foundation | Structured log evidence and search. |
| Enterprise Web operations views | Read-only readiness, evidence, blocker, dashboard, alert, and runbook views. |
| CI artifacts | Release-candidate evidence bundles and health snapshots. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides evidence runtime, gate, contract, and dashboard infrastructure. |
| `security-design.md` | Applies access control, redaction, classification, retention, audit, and security evidence. |
| `scalability-design.md` | Supports evidence, assets, signal samples, and finding scale. |
| `reliability-design.md` | Supports fail-closed gates, partial evidence, carry-forward, and no-fake-completion. |
| `logical-components.md` | Allocates infrastructure services to evidence/readiness components. |
| `components.md` | Supports Observability, Contract, Local Runtime, Enterprise Web, and service evidence. |
| `services.md` | Uses approved observability and runtime stack. |
| `business-logic-model.md` | Supports evidence, gate, handoff, and guard workflows. |
