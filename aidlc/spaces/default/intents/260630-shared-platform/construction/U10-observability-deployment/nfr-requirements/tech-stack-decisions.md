# Tech Stack Decisions - U10 Observability Deployment

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines ELK, Prometheus/Grafana, Jaeger/OpenTelemetry, Docker Compose, Nginx, Vault references, registry conventions, health, and smoke. `business-rules.md` requires JSON logs, OpenTelemetry, Prometheus/Grafana, Jaeger, on-prem descriptors, Vault references, and no AWS/public cloud or Kubernetes assumptions. `requirements.md` fixes C-002, C-006, NFR-005, NFR-012, and NFR-017.

## Decision Summary

U10 uses the approved on-prem observability and readiness stack. It standardizes signals and descriptors; it does not create a separate dashboard product.

## Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Logs | Structured JSON logs to ELK-compatible collection | Required by NFR-012 and access logging. |
| Metrics | Prometheus-compatible metrics and Grafana dashboards | Required approved metrics stack. |
| Traces | OpenTelemetry to Jaeger | Required approved tracing path. |
| Runtime descriptors | Docker Compose profiles | Matches on-prem/local runtime target. |
| Edge | Nginx routing/readiness | Expected platform integration. |
| Secrets | Vault references for non-local stages | Prevents literal secret values. |
| Registry | Deterministic image registry names/tags | Supports deployment traceability and rollback. |
| Health/smoke | App/service endpoints and smoke runner | Required staging promotion evidence. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| AWS/public-cloud managed observability | Out of MVP scope and prohibited by C-002. |
| Kubernetes-only descriptors | Not the MVP runtime target. |
| Custom dashboard app | Operators use approved observability stack. |
| Correlation id as metric label | High-cardinality risk. |
| Literal non-local secrets | Violates Vault reference rule. |

## Implementation Guidance for Later Units

- Build-and-test and environment stages should implement concrete health/smoke commands and dashboards.
- U04 supplies outbox/freshness signals.
- U05/U06 expose BFF/app health and safe correlation surfaces.
- U08 supplies CI/smoke evidence for readiness.

