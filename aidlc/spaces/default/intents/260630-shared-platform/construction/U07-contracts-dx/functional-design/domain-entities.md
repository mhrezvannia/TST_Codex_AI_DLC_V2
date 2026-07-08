# Domain Entities - U07 Published Contracts and Developer Experience

## Source Trace

These U07 entities are derived from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U07 owns contract catalog and developer-experience entities. Runtime business aggregates, service implementations, downstream modules, and CI pipelines remain owned by other units.

## ContractCatalog

Purpose: Index of all Shared Platform published contracts.

Attributes:

| Attribute | Description |
|---|---|
| `catalogVersion` | Version of the catalog snapshot. |
| `publishedAt` | Publication timestamp. |
| `contracts` | APIContract and EventContract entries. |
| `compatibilitySummary` | Aggregate status across contract checks. |
| `findings` | Review or compatibility findings. |

Lifecycle:

```text
draft -> validated -> published -> frozen -> superseded
```

## APIContract

Purpose: Published OpenAPI contract for a synchronous service API.

Attributes:

| Attribute | Description |
|---|---|
| `contractId` | Stable contract id. |
| `serviceName` | `reference-data-service` or `identity-service`. |
| `apiName` | Provider, admin, authorization, or status/history API. |
| `version` | Contract version. |
| `openApiPath` | Artifact path. |
| `operations` | Operation summaries. |
| `examples` | Request/response examples. |
| `compatibilityStatus` | Latest CompatibilityCheckResult. |

Relationships:

- Belongs to ContractCatalog.
- Has ContractExample entries.
- Has ProviderFixture entries.

## EventContract

Purpose: Published Avro event contract for one reference-change event type.

Attributes:

| Attribute | Description |
|---|---|
| `contractId` | Stable event contract id. |
| `eventType` | `referencedata.<entity>.changed`. |
| `schemaVersion` | Avro schema version. |
| `schemaPath` | Avro artifact path. |
| `entityName` | Reference entity. |
| `envelopeFields` | Required common envelope metadata. |
| `payloadFields` | Entity-specific payload fields. |
| `compatibilityStatus` | Schema Registry check result. |

Relationships:

- Belongs to ContractCatalog.
- Has ContractExample entries.
- Has MessageFixture entries.

## ContractExample

Purpose: Concrete sample for an API operation or event.

Attributes:

| Attribute | Description |
|---|---|
| `exampleId` | Stable example id. |
| `contractId` | Associated APIContract or EventContract. |
| `scenario` | Use case demonstrated. |
| `request` | API request example where applicable. |
| `response` | API response example where applicable. |
| `eventPayload` | Event payload example where applicable. |
| `validationStatus` | Valid, invalid, pending, or unknown. |

## CompatibilityCheckResult

Purpose: Evidence from contract compatibility checks.

Attributes:

| Attribute | Description |
|---|---|
| `checkId` | Unique check id. |
| `contractId` | Checked contract. |
| `baselineVersion` | Prior accepted version. |
| `candidateVersion` | Candidate version. |
| `checkType` | OpenAPI diff, Avro compatibility, message-pact, or provider verification. |
| `status` | Pending, compatible, incompatible, failed, or unknown. |
| `findings` | Finding summaries. |
| `evidencePath` | Link/path to detailed evidence. |

## ProviderFixture

Purpose: Provider-side fixture that binds expected behavior to an OpenAPI operation.

Attributes:

| Attribute | Description |
|---|---|
| `fixtureId` | Stable fixture id. |
| `operationId` | OpenAPI operation id. |
| `requestShape` | Expected request. |
| `responseShape` | Expected response. |
| `preconditions` | Required provider state. |
| `verificationStatus` | Pending, passed, failed, or skipped. |

## MessageFixture

Purpose: Message-pact style fixture for an Avro event.

Attributes:

| Attribute | Description |
|---|---|
| `fixtureId` | Stable fixture id. |
| `eventType` | Event type under test. |
| `payloadExample` | Example message. |
| `schemaVersion` | Expected schema version. |
| `consumerExpectation` | Future consumer expectation captured as contract data. |
| `verificationStatus` | Pending, passed, failed, or skipped. |

## ContractReviewFinding

Purpose: Review or compatibility finding that must be resolved or accepted before freeze.

Attributes:

| Attribute | Description |
|---|---|
| `findingId` | Stable finding id. |
| `contractId` | Affected contract. |
| `source` | Compatibility check, downstream review, architecture review, or QA. |
| `severity` | Low, medium, high, or blocking. |
| `summary` | Finding summary. |
| `status` | Open, accepted, resolved, or deferred. |
| `resolution` | Decision and rationale. |

## ContractViewModel

Purpose: Read-only view consumed by `apps/reference-data`.

Attributes:

| Attribute | Description |
|---|---|
| `catalogVersion` | Catalog version. |
| `apiContracts` | API contract summaries. |
| `eventContracts` | Event contract summaries. |
| `examples` | Examples grouped by contract. |
| `compatibilityStatus` | Current status labels. |
| `findings` | Findings safe to display. |

## Entity Interaction Pattern

```text
ContractCatalog
  contains APIContract[]
  contains EventContract[]
  contains CompatibilityCheckResult[]
  contains ContractReviewFinding[]
  exposes ContractViewModel

APIContract
  has ContractExample[]
  has ProviderFixture[]

EventContract
  has ContractExample[]
  has MessageFixture[]
```

## Non-Owned Entities

U07 does not own backend aggregate entities, authorization policy entities, CI workflow entities, or downstream module runtime entities. It represents those surfaces only through contracts and evidence.
