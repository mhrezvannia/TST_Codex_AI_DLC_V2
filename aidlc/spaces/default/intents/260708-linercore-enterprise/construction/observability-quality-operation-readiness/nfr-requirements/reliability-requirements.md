# Reliability Requirements - observability-quality-operation-readiness

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means quality gates fail closed when required evidence is missing, stale, failed, or ownership-invalid, while preserving partial evidence for diagnosis.

## Reliability Controls

| Control | Requirement |
|---|---|
| Fail-closed gates | Required missing/stale/failed evidence blocks readiness. |
| Partial evidence | Partial evidence is preserved and marked partial, not converted to pass. |
| Owner/remediation | Every blocker names owner, source, severity, and remediation. |
| No manual green override | Manual notes cannot turn failed machine checks green. |
| Operation carry-forward | Open risks carried to Operation require owner, severity, mitigation, and follow-up. |
| No-fake-completion | Documents, mock screens, hardcoded results, or container startup alone cannot prove completion. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Contract evidence missing | Block contract/integration readiness. |
| E2E flow failed | Block flow readiness and cite owning units. |
| Observability signal absent | Block observability readiness for affected flow. |
| Runtime partial startup | Distinguish liveness from service/application/evidence readiness. |
| Conflicting reports | Prefer machine-readable CI/runtime evidence and require explicit resolution. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines evidence collection, quality gate, readiness handoff, and no-fake-completion workflows. |
| `business-rules.md` | Defines quality gate, evidence, Operation handoff, and exception rules. |
| `requirements.md` | Supplies NFR-COMP, NFR-OBS, NFR-OPS, NFR-REL, and no-fake-completion constraints. |
| `technology-stack.md` | Supplies CI, contracts, runtime, and observability context. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |
