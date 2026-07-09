# Business Rules - contract-platform-catalog

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The accepted answers require a dedicated `contracts/` catalog, blocking compatibility gates, contract-platform-owned canonical examples, explicit error/exception contracts, a read-only contract health UI surface, and semantic contract versioning.

## Contract Readiness Rules

| Rule | Statement | Source |
|---|---|---|
| CPR-001 | Markdown-only contract documents are not executable readiness evidence. | `unit-of-work.md`, `requirements.md` |
| CPR-002 | A service/integration seam is not ready until required OpenAPI, AsyncAPI, Avro, HTTP Pact, message-pact, and Schema Registry checks pass for that seam. | `requirements.md`, `services.md` |
| CPR-003 | A contract asset must declare owner service, consumer service where applicable, protocol, version, source path, story/requirement trace, and compatibility mode. | `components.md`, `unit-of-work-story-map.md` |
| CPR-004 | HTTP and event contracts must include correlation fields and observability metadata required by `requirements.md`. | `requirements.md` |
| CPR-005 | Contracts with idempotent commands/events must include idempotency keys and duplicate handling expectations. | `requirements.md`, `services.md` |
| CPR-006 | Contracts that cross auth boundaries must document user/service auth context and denied-path behavior. | `requirements.md`, `components.md` |
| CPR-007 | Breaking compatibility blocks integration readiness unless the affected downstream contract version is explicitly retired by a later approved stage. | `requirements.md`, `services.md` |

## Validation Rules

### OpenAPI

- Every service HTTP API must validate against OpenAPI schema rules.
- Request and response schemas must include reusable error envelope definitions.
- Booking to Charge pricing and D&D seams must include idempotency and resilience behavior.
- Enterprise Web clients must consume typed service contracts and must not own business rules.

### AsyncAPI and Avro

- `booking.confirmed`, `containermovement.status`, and reference-data events must have AsyncAPI channel definitions and Avro payload schemas.
- Event contracts must include event id, correlation id, producer, occurred-at time, schema version, ordering metadata where relevant, and idempotency/deduplication fields.
- Avro schema evolution must be backward compatible for active subjects.
- Schema Registry subject naming must be deterministic and environment independent.

### Pact and message-pact

- HTTP Pact tests are required for Booking -> Charge pricing and Booking -> Charge D&D.
- Message-pact tests are required for Booking -> CMM and CMM -> Booking event seams.
- Pact fixtures must include happy path, validation failure, timeout/retry relevant behavior, and boundary ownership assertions where applicable.

## Boundary Rules

- The catalog does not calculate prices, D&D charges, movement status, or booking lifecycle state.
- The catalog does not query service domain databases.
- The catalog does not replace provider or consumer tests.
- The catalog does not allow Enterprise Web users to edit domain business rules.
- The catalog may expose health status, contract versions, fixture links, validation failures, and affected owners.

## Versioning Rules

| Rule | Policy |
|---|---|
| CVR-001 | Each contract asset has `contractId`, `semanticVersion`, `compatibilityMode`, `owner`, and `status`. |
| CVR-002 | Patch versions may add examples, descriptions, and non-behavioral metadata. |
| CVR-003 | Minor versions may add optional fields, optional endpoints, or compatible events. |
| CVR-004 | Major versions are required for removed fields, newly required fields, removed endpoints, changed event semantics, or incompatible auth/idempotency behavior. |
| CVR-005 | Active services may consume only executable `candidate`, `verified`, or `deprecated` compatible versions; they may not consume `draft_document` versions. |

## Exception Rules

- A syntax validation exception stays local to the contract owner until the asset becomes executable.
- A compatibility exception must name affected consumers and cannot be waived silently.
- A Schema Registry exception must include subject, compatibility mode, failing schema id/hash, and registry endpoint.
- A Pact/message-pact exception must name failing interaction, provider, consumer, and owning mob.
- All exceptions must appear in the contract health snapshot and CI/local readiness output.

## Completion Guardrails

- US-SP-006 and US-RUN-004 are incomplete until contract validation runs locally and in CI.
- FR-SP-007 and NFR-COMP-001 are incomplete until compatibility evidence exists for required seams.
- B01 may use draft executable skeleton contracts, but B02 completion requires full executable catalog coverage for required first-release seams.
- B10 cannot claim operation readiness if any required contract health status is red or stale.

## Traceability

| Source | Business-rule coverage |
|---|---|
| `unit-of-work.md` | Defines U02 as shared contract/test tooling and forbids readiness from markdown-only contracts. |
| `unit-of-work-story-map.md` | Maps contract rules to US-SP-004, US-SP-006, US-BKG-005, US-CMM-006, and US-RUN-004. |
| `requirements.md` | Supplies executable contract infrastructure, event fields, compatibility, and local runtime requirements. |
| `components.md` | Defines Contract Platform as cross-cutting component with explicit validation responsibilities. |
| `component-methods.md` | Supplies method/API/event expectations that contracts must model. |
| `services.md` | Defines required contract strategy for HTTP and Kafka integrations. |

