# Security Requirements - observability-quality-operation-readiness

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Evidence bundles, logs, traces, dashboards, alerts, and readiness reports must be useful without leaking secrets or bypassing authorization.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Access | Evidence and readiness views are authenticated and capability-authorized. |
| Redaction | Secrets, tokens, and sensitive environment values are redacted from evidence. |
| Security evidence | Denied-path, authorization audit, service JWT, and ACL evidence are mandatory where relevant. |
| Classification | Evidence artifacts are internal/confidential by default. |
| Retention | Release-candidate evidence bundles are retained for at least 180 days. |
| Audit | Manual annotations and carry-forward risks include subject, reason, and timestamp. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines evidence, quality gate, readiness handoff, and blocker workflows. |
| `business-rules.md` | Defines evidence acceptance, security readiness, and no-fake-completion rules. |
| `requirements.md` | Supplies NFR-SEC, NFR-OBS, NFR-OPS, and audit requirements. |
| `technology-stack.md` | Supplies CI, logs, traces, dashboards, and Enterprise Web context. |
| `nfr-requirements-questions.md` | Q2 sets security, classification, and retention posture. |
