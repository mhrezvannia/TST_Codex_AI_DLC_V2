# Infrastructure Services - contract-platform-catalog

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

The unit needs infrastructure support for executable contracts, local Schema Registry compatibility, generated reports, and read-only health visibility.

## Service Inventory

| Infrastructure service | Role | Ownership |
|---|---|---|
| Repository contract tree | Stores OpenAPI, AsyncAPI, Avro, Pact, message-pact, metadata, examples, and fixtures. | Contract Platform source ownership; provider/consumer units own their contract content. |
| Validator toolchain | Runs syntax, structure, metadata, security, fixture, and compatibility checks. | Contract Platform tooling, version-pinned in repository. |
| Local Schema Registry | Provides Avro subject compatibility checks. | Local Runtime Platform provides runtime; Contract Platform owns adapter and checks. |
| Docker Compose profiles | Start Kafka/Schema Registry only when registry-dependent checks require them. | Local Runtime Platform. |
| GitHub Actions | Runs PR preflight and full contract evidence suite. | CI Pipeline with Contract Platform jobs. |
| CI artifacts | Stores generated JSON, markdown, verbose logs, and health snapshots. | Pipeline evidence storage, access-controlled and retained by policy. |
| Enterprise Web or operations health view | Displays read-only contract health from generated artifacts. | Enterprise Web consumes; Contract Platform publishes the read model. |

## Storage Design

| Data | Storage | Control |
|---|---|---|
| Contract source | Version-controlled repository paths. | Pull-request review, secret scanning, source hash capture. |
| Metadata index | Generated JSON artifact. | Deterministic sorting, source hash, validator version, schema version. |
| Validation records | Generated JSON and markdown summaries. | Freshness keys include `gitRef`, source hash, validator version, runtime profile, Schema Registry subject version, compatibility mode, and report schema version. |
| Verbose validator logs | CI/local linked artifacts. | Access-controlled, redacted, linked rather than embedded in compact health rows. |
| Release-candidate evidence | CI artifact retention for at least 180 days. | Internal/confidential classification and immutable source linkage. |

No central evidence database is introduced for the first release. If generated artifacts no longer scale, a later design can add a service-backed registry without changing the first-release validation semantics.

## Networking And Service Discovery

| Path | Design |
|---|---|
| Validator to local Schema Registry | Use the local Compose service endpoint published by the approved runtime profile. |
| CI job to registry | Use CI-managed service container or Compose profile when registry compatibility is in scope. |
| Enterprise Web to health snapshot | Read generated artifact or backend-proxied read model; no direct mutation path. |
| Provider/consumer services to contracts | Provider and consumer code use generated clients/fixtures and validation reports, not cross-service databases. |

Registry unavailable means static checks continue, registry-dependent checks are marked `blocked`, and remediation names the profile and endpoint needed to rerun.

## Secrets And Access

| Secret or sensitive surface | Control |
|---|---|
| CI tokens | GitHub Actions secrets with least-privilege repository access. |
| Validator credentials | Avoid credentials for local static checks; registry checks use local endpoints. |
| Report artifacts | Internal/confidential access; no production secrets or personal data in fixtures. |
| Examples and fixtures | Deterministic synthetic data only. |
| Health views | Authenticated and capability-authorized; read-only status from generated evidence. |

The pipeline must run secret detection before evidence publication. Leaked tokens, production personal data, or non-synthetic sensitive fixtures block release evidence.

## Cost And Capacity Controls

| Cost driver | Control |
|---|---|
| CI minutes | Changed-contract preflight, dependency caching, and protocol partitioning. |
| Local runtime overhead | Start Schema Registry only for registry-dependent checks. |
| Artifact storage | Compact summaries plus linked verbose logs; retention focused on release-candidate evidence. |
| Future cloud resources | Use required cost allocation tags, least-privilege IAM, encryption, and environment scheduling if AWS infrastructure is added. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Uses CI/local execution layers, bounded registry use, compact summaries, and linked logs. |
| `security-design.md` | Applies access control, redaction, secret scanning, internal classification, and retention controls. |
| `scalability-design.md` | Supports asset, subject, suite, seam, and result-record scale through partitioned generated artifacts. |
| `reliability-design.md` | Separates static and registry-dependent checks and preserves blocked/partial evidence. |
| `logical-components.md` | Allocates infrastructure services to source discovery, registry adapter, validation orchestrator, evidence publisher, and health read model. |
| `components.md` | Keeps Local Runtime Platform and Contract Platform responsibilities distinct. |
| `services.md` | Uses PostgreSQL-independent contract validation and local Kafka/Schema Registry support from the enterprise runtime topology. |
| `business-logic-model.md` | Provides the contract asset, validation result, compatibility result, and health snapshot data flows. |
