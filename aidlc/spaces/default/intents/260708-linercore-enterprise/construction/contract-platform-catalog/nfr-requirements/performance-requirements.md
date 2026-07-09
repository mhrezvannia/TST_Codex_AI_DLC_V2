# Performance Requirements - contract-platform-catalog

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

`contract-platform-catalog` must make contract validation fast enough for local-first development and CI gating. It supports NFR-COMP-001, FR-SP-007, FR-RUN-002, US-SP-006, and US-RUN-004 by turning OpenAPI, Avro, AsyncAPI, Pact, message-pact, and Schema Registry checks into repeatable evidence.

## CI Performance Targets

| Target | Requirement | Verification |
|---|---|---|
| Full validation duration | Complete all required contract validation within 10 minutes on the standard CI runner. | CI timing report |
| Hard timeout | Fail the contract validation job at 15 minutes. | CI job timeout configuration |
| Incremental validation | Identify changed contract assets and run focused validation before the full suite where supported. | CI logs and changed-file report |
| Report generation | Publish contract health report within 60 seconds after validators complete. | CI artifact timestamp comparison |
| Failure feedback | Surface first actionable failure within the CI job log and machine-readable report. | Failed-contract fixture run |

## Local Performance Targets

| Target | Requirement | Verification |
|---|---|---|
| Changed-contract validation | Complete within 2 minutes locally on Windows for changed OpenAPI, Avro, AsyncAPI, Pact, or message-pact assets. | Local command timing |
| Full validation | Complete within 10 minutes locally on Windows when Docker dependencies are already running. | Local command timing |
| Registry compatibility | Run against local Schema Registry without remote provider dependency. | Local Docker profile check |
| Developer feedback | Print owner, source path, validator, and remediation text for failures. | Failing fixture validation |

## Latency Budgets

| Operation | Target |
|---|---|
| Parse and metadata normalize one contract asset | p95 <= 500 ms for normal-size files |
| Validate one OpenAPI or AsyncAPI asset | p95 <= 2 seconds |
| Validate one Avro schema and compatibility result | p95 <= 2 seconds excluding registry startup |
| Validate one Pact/message-pact fixture | p95 <= 3 seconds |
| Build contract health snapshot for 75 assets | p95 <= 30 seconds after individual validations |

## Resource Constraints

- Local validation must run on the approved Windows development workflow with Docker Compose and repository tooling.
- Validation must not require remote SaaS contract tooling.
- Validation should avoid starting the full enterprise runtime when only static syntax and metadata checks are required.
- Schema Registry compatibility checks may require the `core`, `devtools`, or equivalent local profile.
- Reports must be deterministic for the same `gitRef`, contract content, validator version, and registry state.

## Benchmarks And Evidence

| Benchmark | Required evidence |
|---|---|
| Changed OpenAPI contract | Local timing, syntax result, metadata result |
| Changed Avro event schema | Local timing, schema validation, compatibility result |
| Full required seam suite | CI timing, validator versions, pass/fail summary |
| Contract health report | Artifact path, generation timestamp, stale/fresh status |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines registration, syntax validation, compatibility, evidence generation, and health publication workflows. |
| `business-rules.md` | Defines readiness and compatibility rules that require fast feedback. |
| `requirements.md` | Supplies FR-SP-007, FR-RUN-002, and NFR-COMP-001 contract validation requirements. |
| `technology-stack.md` | Supplies OpenAPI YAML, Avro, Pact/message fixtures, Schema Registry, GitHub Actions, Yarn/Turbo, Java/Spring, and Docker Compose context. |
| `nfr-requirements-questions.md` | Q1 and Q2 set CI and local validation timing targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The NFR set is measurable: CI validation has a 10-minute target and 15-minute hard limit; local changed-contract validation has a 2-minute target; full local validation has a 10-minute target.
- Compatibility enforcement is appropriately fail-closed for required first-release seams and aligns with `business-rules.md`.
- Security requirements cover auth context, capabilities/ACLs, denied paths, correlation, audit, observability metadata, secret scanning, and fixture redaction.
- Reliability and freshness requirements prevent stale or partial evidence from being treated as readiness.
- The technology decisions reuse the existing repository stack instead of introducing a premature contract registry service or remote SaaS dependency.
- Required-section and upstream-coverage sensors passed; linter and type-check sensors are not applicable to markdown-only stage outputs.

Residual risks to carry forward:

- CI Pipeline must implement the exact timing budgets, artifact retention, and fail-closed quality gates.
- NFR Design must translate these requirements into concrete validation orchestration, report schemas, health-read-model shape, and recovery patterns.
