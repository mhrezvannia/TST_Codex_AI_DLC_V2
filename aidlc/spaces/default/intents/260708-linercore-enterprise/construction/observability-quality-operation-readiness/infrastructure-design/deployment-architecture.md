# Deployment Architecture - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys evidence collection, quality gate evaluation, observability readiness, and Operation handoff evidence for the enterprise program.

## Runtime Topology

```text
[CI / Local / Operator Trigger]
        |
        v
[EvidenceRunCoordinator]
        |
        +--> [Contract Evidence]
        +--> [Runtime Evidence]
        +--> [Service Test Evidence]
        +--> [Observability Evidence]
        +--> [Security / Resilience Evidence]
        |
        v
[Evidence Bundle + Quality Gate Result]
        |
        +--> [CI Artifacts]
        +--> [Read-Only Enterprise Web / Operations View]
        +--> [Operation Handoff Inputs]
```

Text fallback: CI, local commands, or operators trigger evidence collection. Collectors normalize evidence, quality gates fail closed or pass, and read-only readiness/handoff views expose the results.

## Deployment Controls

| Concern | Design |
|---|---|
| Evidence collection | Contract, runtime, service test, observability, security, and resilience collectors run in bounded groups. |
| Quality gates | Required missing/stale/failed evidence blocks readiness. |
| Read-only views | Enterprise Web/operations can display and filter evidence but cannot manually green failed checks. |
| Evidence storage | Generated JSON/markdown/read-model artifacts and linked verbose logs/traces; central database deferred. |
| Operation handoff | Dashboard inventory, alert inventory, runbook index, incident matrix, blocker list, and carry-forward risks. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements CI/local evidence bundles, quality gate evaluation, contract aggregation, dashboard load, and freshness. |
| `security-design.md` | Implements access, redaction, mandatory security evidence, classification, retention, and audited annotations. |
| `scalability-design.md` | Supports flow reports, contract checks, assets, samples, and blocker/finding records. |
| `reliability-design.md` | Implements fail-closed gates, partial evidence, owner/remediation, no manual green override, carry-forward, and no-fake-completion. |
| `logical-components.md` | Maps to EvidenceRunCoordinator, collectors, EvidenceNormalizer, QualityGateEvaluator, CompletionGuard, ReadinessHandoffBuilder, and ReadOnlyReadinessView. |
| `components.md` | Supports Observability Platform, Contract Platform, Local Runtime Platform, Enterprise Web, and service evidence. |
| `services.md` | Uses Prometheus, Grafana, Jaeger, OTel, logs/search, contracts, CI, runtime, and service topology. |
| `business-logic-model.md` | Implements evidence collection, quality gate, readiness handoff, and no-fake-completion workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps evidence generation and quality gates machine-verifiable and fail-closed.
- Read-only readiness views cannot manually override failed, stale, missing, partial, or ownership-invalid evidence.
- Operation handoff is explicit and does not hide unresolved Construction blockers.
