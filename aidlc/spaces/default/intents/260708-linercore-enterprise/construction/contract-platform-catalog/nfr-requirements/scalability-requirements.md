# Scalability Requirements - contract-platform-catalog

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The contract catalog must scale across the complete LinerCore enterprise scope without needing a new architecture in the first release.

## First-Release Scale Baseline

| Dimension | Required capacity |
|---|---|
| Contract assets | At least 75 active or draft assets |
| Schema subjects | At least 25 active Schema Registry subjects |
| Pact/message-pact suites | At least 20 suites |
| Service or integration seams | At least 10 seams |
| Validator result records per run | At least 500 records across syntax, metadata, compatibility, and fixture checks |
| Contract health consumers | CI, local developer commands, and read-only Enterprise Web or operations view |

## Growth Requirements

- Catalog metadata must support additional modules, event types, and consumers without changing the core model.
- Contract IDs, owners, semantic versions, compatibility modes, and source paths must be stable identifiers.
- Health report generation must support filtering by owner, seam, protocol, story, status, and stale/fresh state.
- The design must allow changed-contract validation without scanning unrelated large binary or generated artifacts.
- Contract validation should be parallelizable by asset or validator type when the CI runner supports it.

## Capacity Planning

| Area | Requirement |
|---|---|
| Source layout | Keep executable contract assets in a dedicated contracts tree with deterministic paths. |
| Metadata index | Store or generate a machine-readable index from source files and validation reports. |
| Report size | Keep reports consumable by CI and UI by grouping details and linking verbose validator output. |
| Parallel execution | Allow OpenAPI, AsyncAPI, Avro, Pact, and message-pact checks to run independently. |
| Staleness detection | Compare evidence against `gitRef`, contract hash, validator version, runtime profile, and schema version. |

## Scaling Triggers

| Trigger | Response |
|---|---|
| Full validation exceeds 10 minutes | Add changed-contract preflight, validator parallelism, or report caching. |
| Contract assets exceed 75 | Review index generation and report pagination before adding new contract families. |
| Schema subjects exceed 25 | Validate subject naming and compatibility mode governance. |
| Pact/message-pact suites exceed 20 | Split provider/consumer verification by owner and seam. |
| UI health view becomes slow | Add read-model caching from generated evidence artifacts, not manual status edits. |

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines catalog metadata, validation, compatibility, fixture, and health-report workflows. |
| `business-rules.md` | Defines versioning, readiness, and compatibility rules that require scalable indexing. |
| `requirements.md` | Supplies enterprise-wide contract and local runtime expectations. |
| `technology-stack.md` | Supplies current OpenAPI, Avro, Pact/message fixtures, Schema Registry, CI, and monorepo tooling context. |
| `nfr-requirements-questions.md` | Q7 sets the first-release scale baseline. |
