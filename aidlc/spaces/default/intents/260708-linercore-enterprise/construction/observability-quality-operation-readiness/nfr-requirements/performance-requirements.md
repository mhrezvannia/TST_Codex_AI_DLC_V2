# Performance Requirements - observability-quality-operation-readiness

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Performance targets make evidence collection and quality gates fast enough for CI, local readiness, and Operation handoff.

## Evidence Runtime Targets

| Operation | Target |
|---|---|
| Full CI evidence bundle | Complete within 15 minutes. |
| Full local evidence bundle | Complete within 20 minutes after local runtime is ready. |
| Quality gate evaluation | Complete within 2 minutes after evidence collection. |
| Contract health aggregation | Complete within 60 seconds after contract checks. |
| Operations readiness dashboard load | p95 <= 2 seconds for latest evidence summary. |

## Freshness Rules

- Evidence is fresh only for the current `gitRef`, runtime profile, schema versions, validator/test command set, and seed profile.
- Evidence becomes stale on `gitRef` change, schema version change, runtime profile change, or test command set change.
- Stale evidence blocks required quality gates.

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines evidence collection, quality gate, readiness handoff, and no-fake-completion workflows. |
| `business-rules.md` | Defines evidence freshness, quality gate, no-fake-completion, and readiness rules. |
| `requirements.md` | Supplies NFR-OBS, NFR-COMP, NFR-OPS, FR-E2E, and no-fake-completion constraints. |
| `technology-stack.md` | Supplies GitHub Actions, Docker Compose, contracts, Prometheus, Grafana, Jaeger, OTel, logs, and Enterprise Web context. |
| `nfr-requirements-questions.md` | Q1 sets evidence freshness and gate runtime targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs set concrete evidence freshness and runtime targets for CI/local evidence bundles, quality gate evaluation, contract health aggregation, and readiness UI load.
- Security requirements cover authenticated evidence access, redaction, mandatory security evidence, internal/confidential classification, 180-day release-candidate retention, and audited manual annotations.
- Reliability requirements preserve fail-closed quality gates, partial evidence, owner/remediation blockers, no manual green override, Operation carry-forward risks, and no-fake-completion rules.
- Technology decisions reuse existing CI, local runtime, contract, observability, log, trace, dashboard, and read-only Enterprise Web surfaces.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact evidence bundle schema, quality gate policy format, stale-evidence detection, blocker taxonomy, and Operation handoff shape.
- Build and Test / Operation stages must implement and prove dashboards, alerts, runbooks, incident scenarios, and performance validation.
