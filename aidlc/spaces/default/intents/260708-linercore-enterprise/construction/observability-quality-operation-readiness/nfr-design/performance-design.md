# Performance Design - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Performance targets make evidence collection and quality gates fast enough for CI, local readiness, and Operation handoff.

## Evidence Runtime Budgets

| Operation | Target | Design control |
|---|---|---|
| Full CI evidence bundle | <= 15 minutes. | Run contract, runtime, service test, security, resilience, and observability collectors in bounded groups. |
| Full local evidence bundle | <= 20 minutes after runtime ready. | Reuse local profile health and generated contract/test artifacts. |
| Quality gate evaluation | <= 2 minutes after collection. | Evaluate compact normalized evidence records, linking heavy details. |
| Contract health aggregation | <= 60 seconds after contract checks. | Merge machine-readable contract outputs into summary records. |
| Operations readiness dashboard load | p95 <= 2 seconds. | Serve latest summary/read model first; lazy-load heavy logs, traces, and findings. |

## Freshness Keys

Evidence is fresh only when `gitRef`, runtime profile, schema versions, validator/test command set, seed profile, and evidence schema version match the active run. Any mismatch marks the item stale and blocks required gates.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements evidence bundle, quality gate, contract health, dashboard, and freshness budgets. |
| `security-requirements.md` | Keeps redaction, access control, classification, retention, and audit fields in evidence records. |
| `scalability-requirements.md` | Supports evidence reports, contract checks, dashboards/assets, samples, and blocker scale through compact summaries and lazy detail. |
| `reliability-requirements.md` | Uses fail-closed freshness and partial-evidence handling rather than manual summaries. |
| `tech-stack-decisions.md` | Uses GitHub Actions, Docker Compose, contract outputs, Prometheus/Grafana, Jaeger/OTel, logs, and read-only Enterprise Web views. |
| `business-logic-model.md` | Implements evidence collection, quality gate, readiness handoff, and no-fake-completion workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` could not start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design maps each evidence runtime target to bounded collection, aggregation, gate, and dashboard behaviors.
- Freshness keys are explicit, so stale evidence cannot pass a required gate.
- Heavy details are linked/lazy-loaded, preserving dashboard performance at first-release evidence scale.
- Security, scalability, reliability, and logical-component artifacts cover authenticated/capability-authorized evidence access, redaction, retention, fail-closed gate states, partial evidence, no manual green override, component ownership, and blast-radius controls.
- Required-section and upstream-coverage sensors passed for the stage output directory.
- Linter and type-check sensors are not applicable because the stage output is markdown-only and contains no `.ts`, `.tsx`, or `.js` implementation files.

Residual risks:

- Exact evidence schema fields, CI artifact paths, dashboard routes, and collector parallelization remain implementation details for Code Generation and Build/Test.
- Operation stages must confirm whether 180-day release-candidate evidence retention requires external archive storage beyond CI artifacts and generated local reports.
