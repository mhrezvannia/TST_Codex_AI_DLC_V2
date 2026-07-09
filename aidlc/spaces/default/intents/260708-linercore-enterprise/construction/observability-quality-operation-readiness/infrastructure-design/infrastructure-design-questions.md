# Infrastructure Design Questions - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required. Prior stages resolve generated evidence bundles, quality gate policy, read-only readiness views, observability stack, contract/runtime/test/security/resilience evidence, and Operation handoff posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Evidence collectors and quality gates run in CI/local commands; read-only status is exposed through Enterprise Web/operations views. |
| Storage | Generated evidence bundles, compact health snapshots, verbose logs/traces/contract links, and CI artifacts; central evidence database deferred. |
| Monitoring | Prometheus, Grafana, Jaeger, OTel, logs/search, quality gate status, readiness checklist, alerts, and runbook inventory. |
| Security | Access-controlled internal/confidential evidence, redaction, retention, audit, no manual green override. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact evidence schema fields, CI artifact paths, dashboard routes, and collector package names are implementation details constrained by this design.
