# Business Logic Model - contract-platform-catalog

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The unit is U02 `contract-platform-catalog`: a cross-cutting contract foundation that converts enterprise contract documents into executable OpenAPI, Avro, AsyncAPI, HTTP Pact, message-pact, Schema Registry compatibility, and contract health evidence. It supports FR-SP-005, FR-SP-007, FR-BKG-006, FR-CMM-007, FR-RUN-002, NFR-COMP-001, US-SP-004, US-SP-006, US-BKG-005, US-CMM-006, and US-RUN-004.

## Functional Scope

`contract-platform-catalog` owns contract metadata, validation orchestration, compatibility evidence, canonical examples, generated reports, and read-only contract health views.

It does not own provider or consumer implementation. Charge, Booking, CMM, Reference Data, Identity, Enterprise Web, and runtime units remain responsible for their service behavior, persistence, APIs, events, tests, and deployment. This unit supplies the executable contract guardrails those units must pass before claiming integration readiness.

## Core Workflows

### Workflow 1 - Register contract asset

1. Discover or receive a contract asset from the dedicated `contracts/` tree.
2. Normalize metadata: contract id, seam, owner service, consumer service, protocol, version, source path, schema subject, compatibility mode, and linked stories.
3. Validate required metadata fields from `requirements.md` and `services.md`: correlation id, idempotency key where applicable, auth context, observability fields, error envelope, and ownership boundary.
4. Store catalog metadata and content hash.
5. Emit a catalog report entry for local and CI readers.

Decision points:

- If the source is markdown-only, classify it as `draft_document` and mark it non-executable.
- If executable syntax validates but metadata is incomplete, classify it as `invalid_metadata`.
- If syntax and metadata pass, classify it as `candidate_executable`.

### Workflow 2 - Validate contract syntax

1. Select validator by contract kind.
2. Run OpenAPI validation for HTTP APIs.
3. Run AsyncAPI validation for event channels.
4. Run Avro schema validation for event payloads.
5. Run Pact fixture structure validation for HTTP consumer/provider seams.
6. Run message-pact fixture validation for Kafka event seams.
7. Persist result with validator version, input hash, status, failure location, and remediation text.

The workflow is deterministic and local-first. It must run on Windows through documented commands and must not depend on remote provider services.

### Workflow 3 - Check compatibility

1. Load prior executable contract version for the same contract id and compatibility scope.
2. Compare new OpenAPI changes for removed paths, response shape narrowing, required-field changes, auth changes, error envelope changes, and status-code behavior changes.
3. Compare Avro schemas against backward compatibility rules and Schema Registry subject naming.
4. Compare AsyncAPI channels, operation names, headers, keys, ordering metadata, and payload references.
5. Compare Pact/message-pact fixtures for provider/consumer expectations.
6. Produce compatibility status: `compatible`, `compatible_with_warning`, `breaking`, or `not_comparable`.

Compatibility blocks integration readiness when it is `breaking`, `not_comparable` for a required seam, or missing for a touched seam.

### Workflow 4 - Generate consumer evidence

1. Generate typed client inputs where the technology stack supports it.
2. Publish canonical examples and negative examples.
3. Publish provider verification targets and consumer fixture bundles.
4. Write a report consumable by CI, local readiness scripts, and the read-only contract health view.

Generated artifacts are evidence and developer assistance. They do not replace provider or consumer tests in service units.

### Workflow 5 - Publish contract health

1. Aggregate the latest syntax, compatibility, Pact, message-pact, and Schema Registry results.
2. Map results to service seams and user stories from `unit-of-work-story-map.md`.
3. Expose read-only status for Enterprise Web or operations routes.
4. Flag non-executable markdown contracts and any seam that lacks current validation evidence.

The view is evidence only. It must not allow users to edit business contracts, pricing rules, booking rules, movement rules, or service data.

## Processing Sequence

```text
------------------+     +-------------------+     +----------------------+
| Contract Source  | --> | Catalog Metadata  | --> | Syntax Validation    |
+------------------+     +-------------------+     +----------------------+
          |                         |                         |
          v                         v                         v
  markdown-only?          required fields?          validator result
          |                         |                         |
          v                         v                         v
  non-executable       invalid/candidate           compatibility check
                                                            |
                                                            v
                                                     evidence report
                                                            |
                                                            v
                                                  CI/local/UI status
```

Text fallback: contract files are discovered, normalized into catalog metadata, validated for syntax and required fields, checked for compatibility, and published as evidence for CI, local runtime, and a read-only UI surface.

## Data Transformations

| Input | Transformation | Output |
|---|---|---|
| OpenAPI YAML/JSON | Parse, validate, normalize endpoint metadata, hash content | `ContractAsset` and `ValidationResult` |
| AsyncAPI YAML/JSON | Parse channels and operations, link Avro payload refs | `EventContract` and `ValidationResult` |
| Avro schema | Validate schema, compare with prior subject version | `SchemaCompatibilityResult` |
| HTTP Pact fixture | Validate consumer/provider expectation shape | `PactVerificationTarget` |
| Message-pact fixture | Validate event key/header/payload expectation | `MessagePactVerificationTarget` |
| Validation run | Aggregate validator outputs and source hashes | `ContractHealthSnapshot` |

## Error Handling

Errors are first-class contract outcomes:

- Syntax failures identify source file, line when available, validator, and failing rule.
- Metadata failures identify missing correlation, idempotency, auth, observability, ownership, or story traceability fields.
- Compatibility failures identify old version, new version, breaking difference, and affected consumers.
- Registry failures identify subject, compatibility mode, local registry endpoint, and fallback instructions.
- Provider/consumer verification failures identify the failing Pact/message-pact interaction and owner mob.

No failure may be hidden behind a green readiness status.

## Traceability

| Source | Functional design coverage |
|---|---|
| `unit-of-work.md` | U02 responsibilities, boundaries, deployment model, and implementation notes become catalog workflows and guardrails. |
| `unit-of-work-story-map.md` | US-SP-004, US-SP-006, US-BKG-005, US-CMM-006, and US-RUN-004 map to validation, compatibility, event, and local/CI evidence workflows. |
| `requirements.md` | FR-SP-005, FR-SP-007, FR-BKG-006, FR-CMM-007, FR-RUN-002, and NFR-COMP-001 drive executable contract and compatibility gates. |
| `components.md` | Contract Platform responsibilities define cross-cutting ownership and non-business boundaries. |
| `component-methods.md` | Public operation shapes and integration expectations constrain catalog metadata and verification targets. |
| `services.md` | Contract Strategy defines required OpenAPI, Pact, AsyncAPI, Avro, Schema Registry, and message-pact assets. |

