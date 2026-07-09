# Reliability Design - observability-quality-operation-readiness

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means quality gates fail closed when required evidence is missing, stale, failed, or ownership-invalid, while preserving partial evidence for diagnosis.

## Gate State Model

| State | Meaning |
|---|---|
| `passed` | Required evidence is fresh, passing, and owner-valid. |
| `blocked` | Required evidence is missing, stale, failed, mock-only, or ownership-invalid. |
| `partial` | Some evidence collected but required proof incomplete. |
| `carried_forward` | Operation risk accepted with owner, severity, mitigation, and follow-up; does not green Construction criteria. |

## Reliability Controls

| Control | Design |
|---|---|
| Fail-closed gates | Missing, stale, failed, or ownership-invalid evidence blocks readiness. |
| Partial evidence | Preserved and marked partial, not converted to pass. |
| Owner/remediation | Every blocker names owner, source, severity, and remediation. |
| No manual green override | Manual notes cannot turn failed machine checks green. |
| Operation carry-forward | Open risks require owner, severity, mitigation, and follow-up. |
| No-fake-completion | Documents, mock screens, hardcoded results, or container startup alone cannot prove completion. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Contract evidence missing | Block contract/integration readiness. |
| E2E flow failed | Block flow readiness and cite owning units. |
| Observability signal absent | Block observability readiness for affected flow. |
| Runtime partial startup | Distinguish liveness from service/application/evidence readiness. |
| Conflicting reports | Prefer machine-readable CI/runtime evidence and require explicit resolution. |

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements fail-closed gates, partial evidence, owner/remediation, no manual green override, Operation carry-forward, no-fake-completion, and failure handling. |
| `performance-requirements.md` | Keeps gate evaluation fast by evaluating normalized records and linking heavy details. |
| `security-requirements.md` | Preserves access, redaction, mandatory security evidence, classification, retention, and audit. |
| `scalability-requirements.md` | Supports flow, contract, asset, signal, and blocker scale without manual summaries. |
| `tech-stack-decisions.md` | Uses CI, contracts, runtime, observability, logs, traces, dashboards, and read-only UI evidence surfaces. |
| `business-logic-model.md` | Implements evidence collection, quality gate, readiness handoff, and no-fake-completion workflows. |
