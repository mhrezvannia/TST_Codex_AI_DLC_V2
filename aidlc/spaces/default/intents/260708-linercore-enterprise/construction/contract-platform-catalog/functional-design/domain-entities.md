# Domain Entities - contract-platform-catalog

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The `contract-platform-catalog` unit is not a business domain service. Its entities model executable contract assets, validation evidence, compatibility results, fixtures, owners, and health snapshots used by local runtime, CI, services, and Enterprise Web.

## Entity Overview

| Entity | Purpose |
|---|---|
| `ContractAsset` | Represents one executable or draft contract file in the catalog. |
| `ContractVersion` | Tracks semantic version, compatibility mode, lifecycle status, and content hash. |
| `ContractSeam` | Models an integration boundary between provider, consumer, protocol, and story/requirement trace. |
| `ValidationRun` | Captures a local or CI validation execution. |
| `ValidationResult` | Captures one validator result for one contract version. |
| `CompatibilityResult` | Captures old/new comparison and breaking-change findings. |
| `CanonicalExample` | Holds positive and negative examples used by docs, tests, Pact, and message-pact. |
| `PactFixture` | Represents HTTP consumer/provider interaction expectations. |
| `MessagePactFixture` | Represents event key/header/payload expectations. |
| `SchemaRegistrySubject` | Represents local Schema Registry subject metadata and compatibility mode. |
| `ContractHealthSnapshot` | Aggregates latest readiness status for UI, CI, and local checks. |

## Entity Details

### ContractAsset

Attributes:

- `contractId`
- `kind`: `openapi`, `asyncapi`, `avro`, `http_pact`, `message_pact`, `example`, `report`
- `sourcePath`
- `ownerService`
- `consumerService`
- `protocol`
- `linkedRequirements`
- `linkedStories`
- `createdAt`
- `updatedAt`

Lifecycle:

`discovered` -> `metadata_checked` -> `syntax_checked` -> `compatibility_checked` -> `published`

Invalid assets stay in `discovered`, `metadata_failed`, `syntax_failed`, or `compatibility_failed` with evidence.

### ContractVersion

Attributes:

- `contractId`
- `semanticVersion`
- `contentHash`
- `compatibilityMode`
- `status`: `draft_document`, `candidate_executable`, `verified`, `deprecated`, `retired`, `failed`
- `previousVersion`
- `publishedAt`

Invariants:

- A `verified` version must have passing syntax validation.
- A `verified` version for an existing seam must have compatibility evidence.
- A `draft_document` version cannot satisfy integration readiness.

### ContractSeam

Attributes:

- `seamId`
- `provider`
- `consumer`
- `style`: `http_sync`, `kafka_async`, `ui_http_client`, `reference_event`
- `requiredArtifacts`
- `requiredFields`
- `owningMob`
- `dependentUnits`

Key seams:

- Enterprise Web -> services: OpenAPI and typed clients.
- Booking -> Charge pricing: OpenAPI and HTTP Pact.
- Booking -> Charge D&D: OpenAPI and HTTP Pact.
- Booking -> CMM `booking.confirmed`: AsyncAPI, Avro, Schema Registry, message-pact.
- CMM -> Booking `containermovement.status`: AsyncAPI, Avro, Schema Registry, message-pact.
- Reference Data changed: existing Avro/AsyncAPI hardened.

### ValidationRun

Attributes:

- `runId`
- `scope`: `local`, `ci`, `precommit`, `manual`
- `trigger`
- `startedAt`
- `finishedAt`
- `toolVersions`
- `status`
- `reportPath`

Relationships:

- Has many `ValidationResult`.
- Produces one `ContractHealthSnapshot`.

### ValidationResult

Attributes:

- `resultId`
- `contractId`
- `semanticVersion`
- `validator`
- `status`: `passed`, `warning`, `failed`, `skipped`
- `message`
- `failureLocation`
- `remediation`

### CompatibilityResult

Attributes:

- `resultId`
- `contractId`
- `previousVersion`
- `candidateVersion`
- `status`: `compatible`, `compatible_with_warning`, `breaking`, `not_comparable`
- `breakingChanges`
- `affectedConsumers`

### CanonicalExample

Attributes:

- `exampleId`
- `contractId`
- `caseType`: `happy_path`, `validation_failure`, `denied_path`, `timeout`, `duplicate`, `stale_revision`, `out_of_order`, `manual_fallback`
- `payloadPath`
- `expectedOutcome`
- `owner`

### PactFixture and MessagePactFixture

`PactFixture` attributes:

- `interactionId`
- `provider`
- `consumer`
- `requestExample`
- `responseExample`
- `state`
- `expectedStatus`

`MessagePactFixture` attributes:

- `interactionId`
- `producer`
- `consumer`
- `topic`
- `keyExample`
- `headerExample`
- `payloadExample`
- `orderingMetadata`

### SchemaRegistrySubject

Attributes:

- `subjectName`
- `contractId`
- `compatibilityMode`
- `currentVersion`
- `registryUrl`
- `lastCompatibilityCheck`
- `status`

### ContractHealthSnapshot

Attributes:

- `snapshotId`
- `generatedAt`
- `overallStatus`: `green`, `amber`, `red`
- `staleThreshold`
- `seamStatuses`
- `blockingFailures`
- `reportPath`

## Relationships

```text
ContractSeam
  | owns required artifacts
  v
ContractAsset --> ContractVersion --> ValidationResult
       |                 |                  |
       |                 v                  v
       |          CompatibilityResult   ValidationRun
       |                                      |
       v                                      v
CanonicalExample ------------------> ContractHealthSnapshot
       |
       +--> PactFixture
       +--> MessagePactFixture
       +--> SchemaRegistrySubject
```

Text fallback: each seam requires contract assets; each asset has versions; versions produce validation and compatibility results; examples and fixtures support tests; the latest results aggregate into contract health snapshots.

## Persistence Model

Initial persistence can be file-backed under the `contracts/` tree and generated report folders. A later implementation may add a lightweight catalog index file or database table if local/CI performance requires it.

Minimum persisted data:

- Source contract files.
- Generated metadata index.
- Validation report JSON.
- Compatibility report JSON.
- Contract health snapshot JSON.
- Human-readable markdown or HTML report for review.

## Traceability

| Source | Entity coverage |
|---|---|
| `unit-of-work.md` | Provides U02 boundaries, executable contract responsibilities, and readiness guardrails. |
| `unit-of-work-story-map.md` | Identifies stories and dependent units that contract entities must trace. |
| `requirements.md` | Defines fields, compatibility, event, auth, and local runtime requirements. |
| `components.md` | Defines the Contract Platform component and related service boundaries. |
| `component-methods.md` | Constrains operation, method, and event signatures. |
| `services.md` | Defines required integration styles and artifacts. |

