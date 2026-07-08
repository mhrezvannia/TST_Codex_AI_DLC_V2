# Domain Entities - U08 Quality Gates

## Source Trace

These U08 entities are derived from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U08 owns CI gate definitions and result models. It does not own runtime service entities, contract semantics, or deployment promotion entities.

## QualityGate

Purpose: Declarative definition of one required or advisory check.

Attributes:

| Attribute | Description |
|---|---|
| `gateId` | Stable gate identifier. |
| `name` | Human-readable gate name. |
| `scopeType` | Backend, frontend, contract, schema, seed, smoke, or meta. |
| `required` | Whether failure blocks merge. |
| `triggerPaths` | Path patterns that activate the gate. |
| `command` | Command or workflow step. |
| `evidencePattern` | Expected evidence output. |

## GateGroup

Purpose: Logical group of gates executed together.

Attributes:

| Attribute | Description |
|---|---|
| `groupId` | Stable group id. |
| `name` | Backend service, frontend workspace, contract/schema, smoke, or aggregate group. |
| `gates` | QualityGate entries. |
| `required` | Whether any failure blocks merge. |

## ChangeSetClassification

Purpose: Classification of changed paths into gate scopes.

Attributes:

| Attribute | Description |
|---|---|
| `changedPaths` | Files changed by PR. |
| `backendServices` | Affected backend services. |
| `frontendPackages` | Affected apps/packages. |
| `contractArtifacts` | Affected OpenAPI, Pact/message-pact, or Avro artifacts. |
| `seedOrCompose` | Whether local seed/Compose files changed. |
| `docsOnly` | Whether no required runtime gate applies. |

## GateRun

Purpose: One CI execution of a gate.

Attributes:

| Attribute | Description |
|---|---|
| `gateRunId` | Unique run id. |
| `gateId` | Gate executed. |
| `scope` | Service/app/package/contract/schema target. |
| `status` | Passed, failed, skipped, cancelled, or unknown. |
| `startedAt` | Start timestamp. |
| `completedAt` | End timestamp. |
| `durationSeconds` | Runtime duration. |
| `evidencePath` | Logs or artifact path. |
| `failureSummary` | Summary when failed. |

## CoverageResult

Purpose: Backend service coverage result.

Attributes:

| Attribute | Description |
|---|---|
| `serviceName` | `identity-service` or `reference-data-service`. |
| `lineCoveragePercent` | Measured line coverage. |
| `thresholdPercent` | Required threshold, 85. |
| `status` | Passed or failed. |
| `reportPath` | Coverage report artifact. |

## ContractGateResult

Purpose: Result for OpenAPI, Pact/message-pact, or Avro compatibility checks.

Attributes:

| Attribute | Description |
|---|---|
| `contractId` | Contract checked. |
| `checkType` | OpenAPI validation, OpenAPI diff, provider contract, message-pact, Avro validation, or Schema Registry compatibility. |
| `baselineVersion` | Accepted baseline version. |
| `candidateVersion` | Candidate version. |
| `status` | Passed, failed, or unknown. |
| `findings` | Finding summaries. |
| `evidencePath` | Detailed evidence artifact. |

## GateSummary

Purpose: Aggregated PR gate verdict.

Attributes:

| Attribute | Description |
|---|---|
| `summaryId` | Unique summary id. |
| `commitSha` | Checked commit. |
| `requiredPassed` | Count of required passing gates. |
| `requiredFailed` | Count of required failing gates. |
| `advisoryFailed` | Count of advisory failing checks. |
| `verdict` | Passed or blocked. |
| `blockingFailures` | GateRun references that block merge. |

## Entity Interaction Pattern

```text
ChangeSetClassification
  selects GateGroup[]
  each GateGroup runs QualityGate[]
  each QualityGate produces GateRun
  specialized gates produce CoverageResult or ContractGateResult
  GateSummary aggregates the final verdict
```

## Non-Owned Entities

U08 consumes U07 contract catalog evidence and U09 seed/Compose behavior. It does not redefine OpenAPI semantics, Avro payload meaning, reference aggregate rules, or deployment promotion approvals.
