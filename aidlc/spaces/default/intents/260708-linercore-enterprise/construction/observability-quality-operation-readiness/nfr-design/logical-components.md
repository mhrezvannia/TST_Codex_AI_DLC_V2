# Logical Components - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define the evidence, quality gate, readiness handoff, observability, and no-fake-completion model.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| EvidenceRunCoordinator | Starts CI/local/operator evidence collection and creates run metadata. | Evidence run orchestration. |
| ContractEvidenceCollector | Reads OpenAPI, Pact, AsyncAPI, Avro, message-pact, and Schema Registry outputs. | Contract evidence. |
| RuntimeEvidenceCollector | Reads Docker Compose profile health, migration, seed, route, and readiness checks. | Runtime evidence. |
| ServiceTestEvidenceCollector | Reads unit, integration, security, resilience, and E2E Flow 1-5 reports. | Test evidence. |
| ObservabilityEvidenceCollector | Reads trace, structured log, metric, dashboard, alert, and SLO evidence. | Signal evidence. |
| EvidenceNormalizer | Produces compact `EvidenceItem` rows with owner, source, freshness, status, and blocker fields. | Evidence consistency. |
| QualityGateEvaluator | Applies policy and emits pass/blocked/partial/carry-forward results. | Gate correctness. |
| CompletionGuard | Rejects mock-only, markdown-only, hardcoded, stale, container-start-only, or ownership-invalid evidence. | No-fake-completion. |
| ReadinessHandoffBuilder | Produces dashboard inventory, alert inventory, runbook index, incident matrix, and carry-forward risks. | Operation handoff. |
| ReadOnlyReadinessView | Exposes summaries and linked evidence in Enterprise Web operations surface. | Readiness presentation. |

## Boundary Model

This unit aggregates and evaluates evidence. It does not implement pricing, booking, movement, identity, reference data, UI business rules, or service-owned observability instrumentation. Owning units produce source behavior and source evidence.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Evidence source missing | Gate blocked. | Owner/source/remediation finding. |
| Evidence stale | Gate blocked. | Freshness key mismatch report. |
| Partial runtime startup | Runtime readiness partial/blocked. | Liveness separated from application/evidence readiness. |
| Security evidence absent | Security readiness blocked. | Mandatory denied-path/auth/JWT/ACL evidence. |
| Manual annotation misuse | Annotation accepted as note only. | No manual green override. |
| Ownership violation | Completion blocked. | Component/service ownership citation. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Evidence runtime budgets | EvidenceRunCoordinator and collectors. |
| Freshness detection | EvidenceNormalizer and QualityGateEvaluator. |
| Access/redaction/retention | EvidenceNormalizer and ReadOnlyReadinessView. |
| Scale handling | EvidenceNormalizer, ReadOnlyReadinessView, linked raw details. |
| Fail-closed gates | QualityGateEvaluator. |
| No-fake-completion | CompletionGuard. |
| Operation carry-forward | ReadinessHandoffBuilder. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support CI/local evidence bundles, quality gate evaluation, contract aggregation, dashboard load, and freshness. |
| `security-requirements.md` | Components enforce access, redaction, mandatory security evidence, classification, retention, and audited annotations. |
| `scalability-requirements.md` | Components support flow reports, contract checks, assets, samples, and blocker/finding records. |
| `reliability-requirements.md` | Components implement fail-closed gates, partial evidence, owner/remediation, no manual green override, carry-forward, and no-fake-completion. |
| `tech-stack-decisions.md` | Components map to GitHub Actions, Docker Compose, contract outputs, Prometheus/Grafana, Jaeger/OTel, logs, and read-only Enterprise Web surfaces. |
| `business-logic-model.md` | Components implement evidence collection, quality gate, readiness handoff, and no-fake-completion workflows. |
