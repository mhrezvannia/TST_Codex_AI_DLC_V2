# Reliability Requirements - contract-platform-catalog

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability for `contract-platform-catalog` means contract evidence is deterministic, fresh, fail-closed for required seams, and recoverable when validators or local runtime dependencies fail.

## Availability And Freshness

| Area | Requirement |
|---|---|
| CI validation | Required contract gates run on relevant pull requests and release candidates. |
| Local validation | Developers can run changed-contract and full validation locally on Windows. |
| Contract health view | Available whenever Enterprise Web is available, generated from CI/local artifacts. |
| Freshness | Mark contract health stale after 24 hours or when `gitRef`, contract hash, runtime profile, schema version, or validator version changes. |
| Release evidence | Retain release-candidate evidence bundles for at least 180 days. |

## Fail-Closed Rules

| Failure | Required behavior |
|---|---|
| Syntax validation failure | Required seam is blocked; report file, validator, location, and remediation. |
| Metadata validation failure | Required seam is blocked; report missing owner, consumer, auth, correlation, idempotency, observability, or story trace. |
| Compatibility failure | Required seam is blocked unless an approved major-version retirement/migration exists. |
| Schema Registry unavailable | Preserve syntax results, mark registry-dependent checks blocked, and provide local runtime remediation. |
| Pact/message-pact generation failure | Block provider/consumer readiness for the affected seam. |
| Report generation failure | Fail the validation job and preserve raw validator outputs where possible. |

## Recovery Requirements

- Failed validation must be reproducible with a documented local command.
- Partial evidence must be preserved and marked partial, not converted to pass.
- Validator failures must include owner and remediation guidance.
- Schema Registry dependent checks must identify the required Docker Compose profile or service.
- CI reruns must produce deterministic results for the same inputs and validator versions.
- Contract health must never be manually marked green outside generated evidence.

## Quality Attribute Scenarios

| Scenario | Stimulus | Response | Measure |
|---|---|---|---|
| Breaking Avro change | Developer changes required event schema incompatibly | Compatibility check fails closed | Failure appears in CI and health report |
| Missing auth metadata | Protected API contract omits capability/denied-path behavior | Metadata validation blocks readiness | Failure identifies owner and missing fields |
| Registry down locally | Developer runs full validation without Schema Registry | Static checks run, registry checks block with remediation | Partial report emitted |
| Stale release evidence | New `gitRef` lands after previous green report | Health status becomes stale | Stale state visible within next report generation |
| Fixture leak | Contract example contains a secret-like token | Secret scan blocks release evidence | Failure includes redaction guidance |

## Observability Requirements

- Each validation run records `runId`, `gitRef`, validator versions, source hashes, runtime profile, start/end time, and status.
- CI logs and generated reports expose pass/fail counts by protocol and owner.
- Contract health view exposes stale, failed, blocked, and partial states separately.
- Failures retain enough detail to reproduce locally without inspecting hidden CI state.

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines deterministic validation, compatibility, evidence, and health workflows. |
| `business-rules.md` | Defines blocking readiness, exception, versioning, and completion guardrail rules. |
| `requirements.md` | Supplies NFR-REL, NFR-COMP, FR-SP-007, FR-RUN-002, and no-fake-completion constraints. |
| `technology-stack.md` | Supplies local Docker Compose, Schema Registry, GitHub Actions, and contract tooling context. |
| `nfr-requirements-questions.md` | Q3, Q5, Q6, and Q8 define fail-closed compatibility, retention, health freshness, and failure handling. |
