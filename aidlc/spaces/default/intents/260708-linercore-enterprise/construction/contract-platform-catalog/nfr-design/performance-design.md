# Performance Design - contract-platform-catalog

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

`contract-platform-catalog` needs fast local and CI feedback for OpenAPI, AsyncAPI, Avro, Pact, message-pact, Schema Registry compatibility, and generated contract health evidence. The design preserves the `business-logic-model.md` workflows: register assets, validate syntax, check compatibility, generate consumer evidence, and publish contract health.

## Validation Execution Model

Contract validation runs in two layers:

| Layer | Purpose | Trigger | Expected duration |
|---|---|---|---|
| Changed-contract preflight | Validate touched contract assets and their direct compatibility dependencies. | Local command and pull-request diff. | <= 2 minutes locally. |
| Full contract suite | Validate all required first-release contract assets and publish health evidence. | CI quality gate, release candidate, or explicit local full run. | <= 10 minutes, hard CI timeout at 15 minutes. |

The changed-contract preflight computes a deterministic candidate set from Git changes under the contract source tree. It expands the set to include linked prior versions, Schema Registry subjects, and Pact/message-pact suites named by the metadata index. The full suite ignores cached pass status for required seams and rebuilds the evidence snapshot from source files, validator versions, registry state, and runtime profile.

## Parallelization And Resource Use

Validators run by protocol group, with independent output files that are merged only after all groups finish:

| Validator group | Inputs | Parallelism rule |
|---|---|---|
| HTTP contract validation | OpenAPI YAML/JSON and HTTP Pact fixtures | Parallel by contract id and provider seam. |
| Event contract validation | AsyncAPI files, Avro schemas, message-pact fixtures | Parallel by channel or schema subject where registry checks are independent. |
| Metadata validation | Normalized contract asset index | Parallel by asset, with a final ownership and story-trace aggregation pass. |
| Compatibility validation | Prior and current executable versions | Parallel by compatibility scope; registry-dependent checks wait for local Schema Registry readiness. |
| Report generation | Validator result records | Single deterministic aggregation pass sorted by owner, seam, protocol, source path, and contract id. |

The validation runner avoids starting the full enterprise runtime for static checks. Schema Registry compatibility starts or requires the local `core`, `devtools`, or equivalent Docker Compose profile only when an Avro or registry-dependent check is in scope.

## Performance Budgets

| Operation | Budget | Design control |
|---|---|---|
| Parse and normalize one asset | p95 <= 500 ms | Streaming parse where supported, no remote calls in metadata normalization. |
| Validate one OpenAPI or AsyncAPI asset | p95 <= 2 seconds | Per-file validator process or library invocation with bounded output capture. |
| Validate one Avro schema and compatibility result | p95 <= 2 seconds excluding registry startup | Local Schema Registry adapter reuses a single registry endpoint per run. |
| Validate one Pact or message-pact fixture | p95 <= 3 seconds | Fixture discovery is index-backed, not filesystem-wide after index creation. |
| Build health snapshot for 75 assets | p95 <= 30 seconds | Merge compact result records and link verbose validator logs instead of embedding them. |
| Publish report after validators finish | <= 60 seconds | Single writer emits JSON, markdown summary, and optional UI read model from the same sorted result set. |

## Caching And Freshness

Caching is limited to expensive discovery and local developer ergonomics. A cached result is usable only when these keys match: `gitRef`, contract source hash, validator version, runtime profile, Schema Registry subject version, compatibility mode, and report schema version.

CI release evidence is always regenerated for required seams. Cached local results may shorten preflight feedback but never mark required CI readiness green unless the full suite generates fresh evidence.

## Failure Feedback

The first actionable failure is written to the CI log as soon as a validator group fails, while the runner continues compatible independent groups to preserve partial evidence. Each failure includes owner, consumer, source path, validator, location when available, severity, blocked readiness state, and remediation text.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements 2-minute changed-contract validation, 10-minute full validation, 15-minute CI timeout, and 60-second report generation. |
| `security-requirements.md` | Keeps secret scanning and metadata validation inside the same execution model so security failures are first-class blocking outcomes. |
| `scalability-requirements.md` | Partitions validation by protocol, asset, owner, seam, and schema subject for the 75-asset first-release baseline. |
| `reliability-requirements.md` | Preserves partial evidence and fail-closed states instead of turning early validator failures into green reports. |
| `tech-stack-decisions.md` | Uses OpenAPI, AsyncAPI, Avro, Pact, message-pact, local Schema Registry, Yarn/Turbo, Maven, Docker Compose, and GitHub Actions. |
| `business-logic-model.md` | Maps directly to registration, syntax validation, compatibility, evidence generation, and health publication workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design turns every approved performance target into an executable validation layer or measurable budget.
- CI and local validation remain local-first and reuse the approved repository stack rather than introducing a central contract service.
- The cache design cannot falsely satisfy release readiness because freshness keys and full-suite regeneration are explicit.
- Parallelism is bounded by protocol and compatibility scope, which preserves deterministic reporting while supporting the first-release scale baseline.
- Residual implementation risk belongs to Code Generation and CI Pipeline: exact command names, package placement, and runner limits must enforce these budgets.
