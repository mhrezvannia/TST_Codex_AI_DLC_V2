# Scalability Design - contract-platform-catalog

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The Contract Platform must scale across the enterprise integration surface while remaining a generated-evidence platform, not a database-backed central registry in the first release.

## Scale Model

The first-release scale baseline is:

| Dimension | Supported design capacity |
|---|---|
| Contract assets | At least 75 active or draft assets. |
| Schema Registry subjects | At least 25 active subjects. |
| Pact/message-pact suites | At least 20 suites. |
| Service or integration seams | At least 10 seams. |
| Validator result records | At least 500 records per full validation run. |
| Consumers | CI, local developer commands, and read-only Enterprise Web or operations health view. |

The core scaling decision is to generate a machine-readable metadata index from deterministic source paths and validation outputs. This avoids scanning unrelated repository content for every operation and gives CI, local commands, and UI health readers one stable read model.

## Partitioning Strategy

| Partition key | Purpose |
|---|---|
| Protocol | Separates OpenAPI, AsyncAPI, Avro, Pact, message-pact, and registry checks for independent execution. |
| Owner/provider | Supports provider-focused remediation and split provider verification. |
| Consumer | Supports Pact and message-pact consumer expectations. |
| Seam | Groups cross-service readiness for Booking to Charge, Booking to CMM, CMM to Booking, Reference Data events, and Enterprise Web to services. |
| Contract id and version | Enables stable compatibility comparison and semantic-version governance. |
| Source path and hash | Enables changed-contract preflight and stale/fresh evidence detection. |

The metadata index is sorted by protocol, owner, seam, contract id, version, and source path. Report generation uses the same order so repeat runs produce deterministic output.

## Health Read Model

The contract health snapshot is a compact generated read model:

| View concern | Design |
|---|---|
| Summary | Counts by status, owner, seam, protocol, and stale/fresh state. |
| Detail | One row per contract asset and validator result, with links to verbose logs. |
| Filtering | Owner, seam, protocol, story, status, stale/fresh, source path, and compatibility scope. |
| Pagination | Required for UI display when result rows exceed one page; CI markdown summary stays compact. |
| Mutability | Read-only; status derives only from generated evidence. |

Verbose validator logs stay as separate artifacts. The UI or operations view links them instead of embedding all output into the health snapshot.

## Growth Controls

| Trigger | Design response |
|---|---|
| Full validation exceeds 10 minutes | Increase validator group parallelism, split Pact suites by owner/seam, and expand changed-contract preflight. |
| Contract assets exceed 75 | Review index generation time, add paginated UI details, and enforce source-path conventions. |
| Schema subjects exceed 25 | Review subject naming, compatibility mode governance, and registry adapter batching. |
| Pact/message-pact suites exceed 20 | Partition provider verification by provider seam and consumer group. |
| UI health view becomes slow | Cache generated read model artifacts, not manual status edits or a new first-release registry database. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements first-release capacity, partitioning, filtering, report sizing, parallel execution, and scaling triggers. |
| `performance-requirements.md` | Uses changed-contract preflight and protocol partitioning to preserve timing budgets. |
| `security-requirements.md` | Keeps auth, ACL, owner, audit, and correlation metadata indexable and filterable. |
| `reliability-requirements.md` | Uses freshness keys and generated status states to prevent stale evidence from scaling into false readiness. |
| `tech-stack-decisions.md` | Defers a central contract registry service and uses generated reports plus read-only Enterprise Web health views. |
| `business-logic-model.md` | Provides the contract asset, validation result, schema compatibility result, Pact target, message-pact target, and health snapshot concepts. |
