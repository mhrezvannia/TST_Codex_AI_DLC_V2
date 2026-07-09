# Logical Components - contract-platform-catalog

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical component model bridges NFR Design into Infrastructure Design and Code Generation. It defines the Contract Platform boundaries, failure domains, shared resources, and NFR pattern placement without making the Contract Platform responsible for provider or consumer business implementation.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| ContractSourceLocator | Discovers executable contract assets under deterministic repository paths and changed-file sets. | Source layout and Git diff interpretation. |
| ContractAssetIndex | Builds machine-readable metadata for contract id, seam, owner, consumer, protocol, version, source path, schema subject, compatibility mode, story trace, and source hash. | Metadata index generation. |
| MetadataNormalizer | Validates required ownership, auth, authorization, denied-path, correlation, audit, observability, and idempotency metadata. | Security and readiness metadata. |
| SecretAndFixtureScanner | Scans examples, fixtures, and generated evidence for secrets or non-synthetic data patterns. | Fixture and evidence data protection. |
| SyntaxValidatorRunner | Runs OpenAPI, AsyncAPI, Avro, Pact, and message-pact syntax or structure checks. | Protocol validator execution. |
| SchemaRegistryAdapter | Connects to local Schema Registry for subject discovery and compatibility checks. | Registry-dependent compatibility. |
| CompatibilityChecker | Compares prior and current contract versions and classifies compatibility status. | Backward compatibility governance. |
| PactFixtureManager | Discovers HTTP Pact suites, links provider and consumer ownership, and exposes provider verification targets. | HTTP consumer/provider verification. |
| MessagePactFixtureManager | Discovers Kafka message-pact suites and links producer, consumer, key, header, and payload expectations. | Async consumer/provider verification. |
| ValidationOrchestrator | Coordinates changed-contract and full-suite execution with bounded parallelism and deterministic result merging. | Validation job orchestration. |
| EvidencePublisher | Emits JSON, markdown summary, verbose-log links, and read-only health snapshot artifacts. | Report generation and integrity. |
| ContractHealthReadModel | Provides generated status rows for CI, local commands, Enterprise Web, or operations views. | Read-only health presentation. |

## Service Boundaries

The Contract Platform owns contract evidence and validation orchestration. It does not own:

- Identity, user, role, or capability storage.
- Reference data records.
- Charge agreements, tariffs, pricing, or D&D calculation.
- Booking lifecycle state.
- Container movement journeys or status derivation.
- Enterprise Web business workflow decisions.
- Provider or consumer service implementations.

Provider and consumer units remain responsible for implementing APIs, events, handlers, persistence, and tests. This unit supplies executable contract guardrails and evidence they must pass.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Source discovery failure | Validation cannot identify assets or changed-contract set. | Fail validation job and preserve Git diff context. |
| Metadata failure | Affected contract readiness is blocked. | Report owner, source path, missing field, and linked story. |
| Static validator failure | Affected protocol group blocks relevant seam. | Continue independent groups and publish partial evidence. |
| Schema Registry failure | Registry-dependent Avro compatibility checks blocked. | Static checks remain available; remediation names local Docker profile and endpoint. |
| Pact/message-pact failure | Affected provider/consumer seam blocked. | Other seams continue; health snapshot identifies provider and consumer. |
| Report generation failure | Whole validation job fails. | Preserve raw validator outputs and rerun deterministic aggregation after fix. |
| Health view read failure | UI cannot display contract health. | CI/local generated artifacts remain source of truth. |

## Shared Resources

| Resource | Shared by | Control |
|---|---|---|
| Repository contract tree | All contract asset components | Deterministic paths and pull-request review. |
| Local Schema Registry | SchemaRegistryAdapter and Avro compatibility checks | Docker Compose profile readiness and bounded wait. |
| CI artifacts | EvidencePublisher and health consumers | Retention policy, source hashes, validator versions, and access control. |
| Validator toolchain | SyntaxValidatorRunner and CompatibilityChecker | Version pinning and explicit validator version capture. |
| Generated health snapshot | CI, local commands, Enterprise Web, operations | Read-only consumers; no manual status editing. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Changed-contract preflight | ContractSourceLocator, ContractAssetIndex, ValidationOrchestrator. |
| Parallel validation | ValidationOrchestrator, SyntaxValidatorRunner, CompatibilityChecker, PactFixtureManager, MessagePactFixtureManager. |
| Security metadata gate | MetadataNormalizer and CompatibilityChecker. |
| Secret scanning and redaction | SecretAndFixtureScanner before EvidencePublisher. |
| Freshness detection | ContractAssetIndex, SchemaRegistryAdapter, EvidencePublisher, ContractHealthReadModel. |
| Fail-closed readiness | MetadataNormalizer, SyntaxValidatorRunner, CompatibilityChecker, EvidencePublisher. |
| Partial evidence | ValidationOrchestrator and EvidencePublisher. |
| Read-only health | ContractHealthReadModel and Enterprise Web consumer route. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support preflight, full-suite execution, deterministic reports, and timing budgets. |
| `security-requirements.md` | Components enforce security metadata, secret scanning, evidence classification, retention, and read-only health. |
| `scalability-requirements.md` | Components partition by protocol, owner, consumer, seam, contract id, version, source path, and result status. |
| `reliability-requirements.md` | Components preserve partial evidence, stale/fresh state, blocked status, recovery guidance, and fail-closed readiness. |
| `tech-stack-decisions.md` | Components map to repository contract assets, local Schema Registry, Pact/message fixtures, GitHub Actions, Docker Compose, and generated reports. |
| `business-logic-model.md` | Components implement asset registration, syntax validation, compatibility, consumer evidence, and contract health publication. |
