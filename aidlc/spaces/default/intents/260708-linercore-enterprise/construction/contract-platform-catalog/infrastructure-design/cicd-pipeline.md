# CI/CD Pipeline - contract-platform-catalog

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

The CI/CD design makes executable contract evidence a blocking quality gate before integration readiness is claimed.

## Pipeline Stages

| Stage | Trigger | Gate |
|---|---|---|
| Source diff detection | Pull request or local preflight. | Identify touched contracts and direct compatibility dependencies. |
| Dependency/toolchain install | Local command or CI job. | Validator versions are pinned and captured in evidence. |
| Metadata index generation | Every contract validation run. | Missing owner, consumer, seam, auth, correlation, observability, idempotency, or story trace blocks readiness. |
| Secret and fixture scan | Before validator publication. | Any token, secret, production personal data, or non-synthetic sensitive fixture blocks release evidence. |
| Static syntax validation | Local and CI. | OpenAPI, AsyncAPI, Avro, Pact, and message-pact structure failures block affected seams. |
| Compatibility validation | Changed-contract and full-suite runs. | Breaking or not-comparable required seams block unless an approved migration/retirement exception is linked. |
| Registry compatibility | When Avro/Schema Registry checks are in scope. | Registry unavailable marks registry-dependent checks blocked with local remediation. |
| Evidence publication | After validators finish. | Emit JSON, markdown summary, verbose-log links, and read-only health snapshot. |
| Contract health gate | CI quality gate and release candidate. | Required seams must have fresh passing evidence. |

## PR Preflight

The pull-request job runs the changed-contract preflight:

1. Compute changed contract source paths from Git diff.
2. Expand the candidate set to linked prior versions, registry subjects, Pact suites, message-pact suites, providers, consumers, and seams.
3. Generate the metadata index for the candidate set.
4. Run metadata, secret, syntax, compatibility, and required fixture checks.
5. Publish compact evidence and fail the PR on blocking outcomes.

Target runtime is <= 2 minutes. If the candidate set cannot be computed deterministically, the job escalates to the full suite rather than silently passing.

## Full Suite Gate

The full suite runs on main/release-candidate paths and explicit local full-run commands:

| Requirement | Design |
|---|---|
| Runtime | <= 10 minutes target, 15 minutes hard CI timeout. |
| Scope | All required first-release contract assets and seams. |
| Freshness | Regenerated from source files, validator versions, registry state, runtime profile, and report schema version. |
| Cache posture | Dependency/tool cache allowed; cached pass status cannot green release evidence. |
| Output | JSON records, markdown summary, verbose logs, health snapshot, and release-candidate evidence bundle. |

## Security Gates

| Gate | Blocking rule |
|---|---|
| Secret detection | Block on secrets, tokens, production personal data, or unredacted sensitive fixtures. |
| Security metadata | Block missing auth context, authorization, denied-path, audit, correlation, observability, or idempotency fields where required. |
| Dependency/tool scan | Block on critical/high exploitable vulnerabilities in validator toolchain when scan evidence is available. |
| Artifact integrity | Block if generated records lack `runId`, `gitRef`, source hash, validator version, runtime profile, timestamp, owner, and status. |
| Manual override | Manual annotations may explain risk but cannot convert failed evidence to pass. |

## Rollback And Recovery

| Failure | Recovery |
|---|---|
| Validator failure | Fix contract, fixture, metadata, or compatibility issue; rerun changed scope or full suite. |
| Registry unavailable | Start required Docker Compose profile or CI service container; rerun registry compatibility scope. |
| Report generation failure | Preserve raw outputs, fix publisher, rerun deterministic aggregation. |
| CI artifact upload failure | Fail job unless CI-native retry succeeds; release evidence is not complete without artifacts. |
| Breaking contract merged accidentally | Revert or publish approved major-version migration; full suite must return fresh passing or approved migration evidence. |

## Secrets Management In CI/CD

The first-release Contract Platform avoids external production secrets in validation. CI tokens are scoped to repository and artifact operations. Any future cloud or artifact-store credentials must use CI secrets, least-privilege permissions, rotation, and audit logging.

## Environment Promotion

Contract health is a prerequisite for downstream module readiness. Production promotion still follows the enterprise rule: staging deploys may be automated on merge, but production requires separate manual approval. Contract evidence cannot bypass that approval.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements changed-contract and full-suite budgets, parallel validator groups, and 60-second publication target. |
| `security-design.md` | Implements secret scans, security metadata gates, artifact classification, access control, and no manual green override. |
| `scalability-design.md` | Uses candidate expansion, full-suite partitioning, and compact generated health snapshots. |
| `reliability-design.md` | Preserves partial evidence, blocked states, deterministic reruns, and freshness keys. |
| `logical-components.md` | Maps pipeline stages to ContractSourceLocator, ContractAssetIndex, SecretAndFixtureScanner, SyntaxValidatorRunner, CompatibilityChecker, SchemaRegistryAdapter, ValidationOrchestrator, and EvidencePublisher. |
| `components.md` | Enforces executable contract guardrails for provider/consumer services without owning their behavior. |
| `services.md` | Covers Enterprise Web-to-service, Booking-to-Charge, Booking-to-CMM, CMM-to-Booking, and Reference Data event contract paths. |
| `business-logic-model.md` | Implements register, validate, check compatibility, generate evidence, and publish health workflows. |
