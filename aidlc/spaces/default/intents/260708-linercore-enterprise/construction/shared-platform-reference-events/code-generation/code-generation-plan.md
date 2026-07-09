# Code Generation Plan - shared-platform-reference-events

## Plan Context

Unit: `shared-platform-reference-events`

Scope: Brownfield hardening of Reference Data lifecycle APIs, validation APIs, reference changed events, transactional outbox, Schema Registry/Kafka publication evidence, outbox health, and local runtime compatibility. The implementation must preserve Reference Data Service ownership and must not add pricing, booking, CMM, D&D, or cross-service database joins.

Test strategy: Comprehensive. This plan includes Java unit tests for reference lifecycle/outbox behavior, TypeScript tests for reference-data UI/service clients where touched, contract/schema/script tests for OpenAPI/AsyncAPI/Avro evidence, and targeted verification commands.

Workspace target: changes stay in existing reference-event surfaces: `services/reference-data-service/`, `contracts/`, `apps/reference-data/`, `infrastructure/`, `scripts/`, and tests. No downstream domain business logic is added.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-SP-003 - Manage shared reference data | Step 1, Step 2, Step 3, Step 7 |
| US-SP-004 - Publish reference events | Step 3, Step 4, Step 5, Step 8 |
| US-CHG-001 - Charge uses reference validation | Step 2, Step 6, Step 7 |
| US-BKG-001 - Booking uses reference validation | Step 2, Step 6, Step 7 |
| US-CMM-004 - CMM consumes reference changes | Step 4, Step 5, Step 8 |
| NFR security/reliability/observability | Step 2 through Step 10 |

## Sequential Implementation Steps

- [x] Step 1: Inventory current reference-data surfaces.
  - Confirm existing Java domain/application/dataaccess/container modules, TypeScript service clients and UI routes, OpenAPI/AsyncAPI/Avro contracts, local runtime metadata, and validation scripts.
  - Preserve current package boundaries and source-of-truth ownership.
  - Traceability: US-SP-003.

- [x] Step 2: Harden reference validation APIs and access boundaries.
  - Ensure validation requests carry reference set, code/id, consumer context, correlation id, and service identity where available.
  - Add fail-closed behavior for unknown sets, missing records, inactive records, and forbidden direct data ownership.
  - Add lowest-layer tests for validation success, validation failure, and correlation preservation.
  - Traceability: US-SP-003, US-CHG-001, US-BKG-001.

- [x] Step 3: Harden reference lifecycle mutation and history evidence.
  - Ensure create/update/deactivate/reactivate flows append history or change facts with actor, action, record key, version, reason, and correlation id.
  - Add tests for mutation state changes and non-secret audit/history payloads.
  - Traceability: US-SP-003, NFR-SEC.

- [x] Step 4: Harden transactional outbox event creation.
  - Ensure committed reference changes produce deterministic outbox records with event id, schema subject/version, aggregate reference, deduplication key, producer identity, correlation id, and payload.
  - Add tests that no committed mutation loses its outbox evidence.
  - Traceability: US-SP-004, US-CMM-004, NFR-REL.

- [x] Step 5: Add or validate event contract fixtures.
  - Verify Avro and AsyncAPI reference-data changed contracts match generated payload shape.
  - Add or adjust examples/fixtures and validation tests without introducing fake provider results.
  - Traceability: US-SP-004, US-CMM-004.

- [x] Step 6: Add service-client and UI boundary checks where needed.
  - Keep UI workflows backed by real Reference Data APIs.
  - Ensure denied or unavailable validation paths surface correlation ids and do not expose backend secrets.
  - Traceability: US-SP-003, US-CHG-001, US-BKG-001.

- [x] Step 7: Add Comprehensive Java and TypeScript tests.
  - Cover reference validation, lifecycle mutation, outbox enqueue, event mapping, denied boundary behavior, and script/contract validation.
  - Use no live Kafka or Schema Registry dependency during code generation tests.
  - Traceability: all unit stories.

- [x] Step 8: Add local runtime/readiness evidence hooks.
  - Ensure local runtime metadata and readiness checks expose Reference Data Service, outbox, schema, and event contract evidence.
  - Keep Docker startup verification for Build and Test when Docker is available.
  - Traceability: US-SP-004, NFR-OBS, NFR-REL.

- [x] Step 9: Run verification commands and fix failures.
  - Run targeted Java tests under `services/reference-data-service`.
  - Run targeted Vitest/Node tests for touched TypeScript/scripts/contracts.
  - Run schema/contract validation commands where touched.
  - Traceability: all unit stories.

- [x] Step 10: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files changed, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all unit stories.

## Implementation Guardrails

- Do not add pricing, booking, CMM, D&D, or other downstream domain behavior.
- Do not allow consumer modules to read Reference Data tables directly.
- Do not claim event readiness from static documents alone; require executable fixtures or tests.
- Do not require live Kafka or Schema Registry for code-generation tests.
- Do not expose secrets in history, audit, events, logs, or denied responses.
