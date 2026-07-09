# Deployment Architecture - contract-platform-catalog

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`contract-platform-catalog` is deployed as executable repository tooling and generated evidence, not as a first-release always-on production service. The design preserves local-first validation, CI quality gates, and a read-only contract health surface.

## Deployment Model

| Environment | Execution model | Purpose |
|---|---|---|
| Local developer | Repository commands plus Docker Compose when Schema Registry is required. | Changed-contract preflight, compatibility debugging, fixture validation, local health evidence. |
| Pull request CI | GitHub Actions job for changed-contract preflight and metadata/security checks. | Fast blocking feedback before merge. |
| Main/release CI | GitHub Actions full contract suite with generated evidence bundle. | Required integration readiness and release-candidate evidence. |
| Enterprise Web or operations view | Read-only consumer of generated contract health snapshot. | Visibility into status, owners, seams, failures, and stale evidence. |

The Contract Platform does not require separate production compute in the first release. Provider and consumer services remain responsible for implementing APIs, events, handlers, persistence, and tests.

## Runtime Topology

```text
[Contract Source Tree]
        |
        v
[Metadata Index + Validator Commands]
        |
        +--> [OpenAPI / AsyncAPI / Pact / Message-Pact Static Checks]
        +--> [Schema Registry Adapter] --> [Docker Compose Schema Registry]
        |
        v
[Generated Evidence Bundle]
        |
        +--> [CI Markdown/JSON Artifacts]
        +--> [Read-Only Contract Health Snapshot]
        +--> [Enterprise Web / Operations View]
```

Text fallback: contract source files are indexed and validated by repository commands. Registry-dependent Avro compatibility uses the local Docker Compose Schema Registry. The resulting evidence bundle feeds CI artifacts and a read-only UI or operations health view.

## Environment Definitions

| Environment | Required services | Notes |
|---|---|---|
| Local static preflight | Node/Yarn or JVM validator tooling as selected in Code Generation. | Does not start the enterprise runtime. |
| Local registry preflight | Docker Compose `core`, `devtools`, or equivalent profile with Kafka and Schema Registry. | Starts only when Avro or registry compatibility is in scope. |
| CI preflight | GitHub Actions runner with dependency cache and contract validator toolchain. | Blocks pull requests on invalid metadata, secret leaks, syntax failures, or breaking compatibility. |
| CI full suite | GitHub Actions runner, contract fixtures, generated reports, and artifact retention. | Regenerates release evidence; cached local pass status cannot mark release readiness green. |
| Read-only view | Enterprise Web or operations route consuming generated health artifacts. | No manual status editing and no business contract mutation. |

## Infrastructure-as-Code Approach

First-release infrastructure is repository-defined rather than cloud-provisioned:

| Concern | Design |
|---|---|
| Local runtime | Docker Compose profiles own Kafka and Schema Registry readiness. |
| CI runtime | GitHub Actions workflows own changed-contract and full-suite jobs. |
| Report artifacts | CI artifact retention and generated local files own evidence storage. |
| Read-only display | Enterprise Web consumes generated JSON/markdown read models. |
| Future AWS path | If promoted to AWS, model the same boundaries in CDK: separate stateful artifact storage from stateless validator compute, apply least privilege, encryption, tags, and cdk-nag checks. |

## Resource Sizing

| Resource | Sizing rule |
|---|---|
| Static validators | Parallel by protocol, seam, provider, consumer, and independent asset. |
| Schema Registry checks | Reuse one local registry endpoint per run; bound readiness wait before marking registry-dependent checks blocked. |
| Report generation | Single deterministic writer sorted by owner, seam, protocol, source path, and contract id. |
| CI timeout | Changed-contract preflight targets <= 2 minutes; full suite targets <= 10 minutes with hard CI timeout at 15 minutes. |
| Health snapshot | Compact generated rows with links to verbose validator logs; UI details paginate when rows exceed one page. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements changed-contract and full-suite timing budgets, deterministic reporting, and bounded CI timeout. |
| `security-design.md` | Keeps access-controlled internal evidence, redaction, secret scanning, and no manual green override in the deployment path. |
| `scalability-design.md` | Uses generated metadata index, protocol partitioning, and compact health snapshots for first-release scale. |
| `reliability-design.md` | Uses fail-closed states, partial evidence, registry remediation, and deterministic reruns. |
| `logical-components.md` | Maps deployment responsibilities to ContractSourceLocator, ContractAssetIndex, ValidationOrchestrator, SchemaRegistryAdapter, EvidencePublisher, and ContractHealthReadModel. |
| `components.md` | Keeps Contract Platform cross-cutting and separate from provider/consumer business implementations. |
| `services.md` | Aligns with the required OpenAPI, Pact, AsyncAPI, Avro, Schema Registry, and message-pact contract strategy. |
| `business-logic-model.md` | Implements asset registration, syntax validation, compatibility checking, consumer evidence generation, and contract health publication workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design preserves the approved first-release decision to use generated contract evidence rather than introducing a central always-on contract service or evidence database.
- Local, pull-request CI, full-suite CI, and read-only health view responsibilities are separated clearly enough for implementation.
- Security and compliance controls cover internal/confidential evidence classification, redaction, secret scanning, least-privilege artifact access, audit fields, and no manual green override.
- Reliability posture is fail-closed for missing, stale, failed, not-comparable, registry-unavailable, or tampered evidence.
- Required-section and upstream-coverage sensors passed for the stage output directory.
- Linter and type-check sensors are not applicable because the stage output is markdown-only and contains no `.ts`, `.tsx`, or `.js` implementation files.

Residual risks:

- Code Generation and CI Pipeline must pin exact validator packages, command names, workflow files, generated artifact paths, and runner concurrency limits.
- If generated reports exceed the documented scale envelope, a later architecture decision may need to introduce a dedicated contract registry or evidence service.
