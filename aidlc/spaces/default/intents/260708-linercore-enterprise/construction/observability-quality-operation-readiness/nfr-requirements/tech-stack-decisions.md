# Tech Stack Decisions - observability-quality-operation-readiness

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The selected posture uses generated CI/local evidence and read-only operations views before introducing a central evidence database.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| CI evidence | GitHub Actions quality gates | Existing CI surface for validation reports. |
| Local evidence | Docker Compose profiles and repository commands | Required for local-first runtime proof. |
| Contract evidence | OpenAPI, Pact, AsyncAPI, Avro, message-pact, Schema Registry outputs | Required for executable contract readiness. |
| Metrics/dashboards | Prometheus and Grafana | Existing observability stack. |
| Tracing | Jaeger and OpenTelemetry Collector | Existing trace stack. |
| Logs | Elasticsearch/Kibana or local log/search foundation | Existing log/search foundation. |
| UI view | Read-only Enterprise Web operations/readiness surfaces | Supports operator review without manual green edits. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Central evidence database | Not required before generated file/report evidence is proven. |
| Spreadsheet/manual evidence | Violates machine-verifiable gate posture. |
| Screenshots-only readiness | Violates no-fake-completion rules. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines evidence, quality gate, dashboard, alert, runbook, and readiness workflows. |
| `business-rules.md` | Defines evidence, gate, and no-fake-completion rules. |
| `requirements.md` | Supplies observability, contract, runtime, Operation, and E2E requirements. |
| `technology-stack.md` | Supplies GitHub Actions, Docker Compose, OpenAPI, Avro, Pact, Schema Registry, Prometheus, Grafana, Jaeger, OTel, logs, and Enterprise Web stack. |
| `nfr-requirements-questions.md` | Q5 selects generated evidence and read-only view stack posture. |
