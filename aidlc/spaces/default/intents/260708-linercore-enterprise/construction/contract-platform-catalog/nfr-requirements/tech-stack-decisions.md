# Tech Stack Decisions - contract-platform-catalog

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The first-release posture is reuse-first: make the repository's existing contract, monorepo, backend, and local runtime tooling executable before introducing a new central contract service.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| HTTP contracts | OpenAPI YAML/JSON | Existing repository already uses OpenAPI YAML for service contracts; aligns with FR-SP-007 and service contract strategy. |
| Event channels | AsyncAPI files | Required to document Kafka channels such as `booking.confirmed`, `containermovement.status`, and reference-data events. |
| Event payload schemas | Avro `.avsc` | Existing stack includes Avro schemas and local Schema Registry; supports backward compatibility checks. |
| HTTP consumer/provider tests | Pact fixtures and provider verification | Required for Booking -> Charge pricing and D&D seams. |
| Event consumer/provider tests | Message-pact fixtures | Required for Booking -> CMM and CMM -> Booking event seams. |
| Schema compatibility | Local Confluent Schema Registry | Existing Docker Compose stack includes Schema Registry 7.7.1 and supports local-first validation. |
| Orchestration | Yarn 4.5.3 and Turbo 2.3.3 where useful | Fits existing monorepo tooling for frontend/shared packages and cross-workspace commands. |
| Backend verification hooks | Java 21, Spring Boot 3.3.7, Maven | Provider verification integrates with backend service modules and existing Java test tooling. |
| CI execution | GitHub Actions quality gates | Existing `quality-gates.yml` surface for contract validation pipeline. |
| Health reporting | Generated machine-readable reports plus read-only Enterprise Web surface | Avoids a new database-backed contract service in the first release while still supporting UI visibility. |

## Deferred Stack Choices

| Deferred item | Reason |
|---|---|
| Central contract registry service with its own database | Not needed for first-release executable contract evidence; would add persistence and operations scope prematurely. |
| Remote SaaS contract tool as source of truth | Violates local-first requirement and adds external dependency before internal flows pass locally. |
| Markdown-only contract catalog | Explicitly insufficient for NFR-COMP-001 and no-fake-completion rules. |
| Manual contract health editing | Conflicts with generated evidence and fail-closed reliability requirements. |

## Implementation Constraints

- Contract assets live in deterministic repository paths, preferably under a dedicated `contracts/` tree.
- Validator commands must run on Windows local development environments.
- Schema Registry checks must use local Docker runtime dependencies.
- Generated reports must include source hashes, validator versions, `gitRef`, runtime profile, and timestamps.
- Secret scanning and redaction apply to examples, fixtures, and release evidence.
- Contract health UI reads generated evidence and must not become an editable source of truth.

## Decision Rationale

The approved `technology-stack.md` already includes OpenAPI YAML, Avro `.avsc`, Pact/message fixtures, local Schema Registry, GitHub Actions, Graphify, AI-DLC, Java/Spring, Yarn/Turbo, and Docker Compose. Reusing these tools keeps the first release local-first and implementation-ready while covering the contract types required by `requirements.md`, `business-logic-model.md`, and `business-rules.md`.

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines executable catalog registration, validation, compatibility, fixture, and health workflows. |
| `business-rules.md` | Requires OpenAPI, AsyncAPI, Avro, Pact, message-pact, Schema Registry, semantic versioning, and compatibility gates. |
| `requirements.md` | Supplies FR-SP-007, NFR-COMP-001, FR-RUN-002, and local-first runtime constraints. |
| `technology-stack.md` | Provides the selected repository stack and enterprise gaps. |
| `nfr-requirements-questions.md` | Q9 selects the reuse-first technology posture. |
