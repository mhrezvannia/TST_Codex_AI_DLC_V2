# Code Generation Plan - contract-platform-catalog

## Plan Context

Unit: `contract-platform-catalog`

Scope: Convert first-release enterprise contract requirements into executable repository contract assets, validation gates, compatibility evidence, and contract health output.

Test strategy: Comprehensive. This plan includes unit-level script tests, integration-style contract fixture tests, negative-path validation tests, and command-level verification using the existing Node script test harness.

Workspace target: application and tooling changes stay at the workspace root, primarily under `contracts/`, `scripts/`, and `artifacts/`. This unit must not create downstream runtime services for Booking, Charge, Container Movement, or Enterprise Web.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-SP-004 - Publish reference-data events | Step 2, Step 3, Step 5, Step 6 |
| US-SP-006 - Validate executable contracts | Step 1 through Step 9 |
| US-BKG-005 - Confirm and publish booking | Step 2, Step 3, Step 4, Step 5, Step 6 |
| US-CMM-006 - Publish movement status | Step 2, Step 3, Step 4, Step 5, Step 6 |
| US-RUN-004 - Validate contracts in CI and local | Step 1, Step 6, Step 7, Step 8, Step 9 |
| FR-SP-007 and NFR-COMP-001 | Step 1 through Step 9 |

## Sequential Implementation Steps

- [x] Step 1: Inventory the existing contract tooling and catalog shape.
  - Confirm current behavior in `scripts/validate-contract-catalog.mjs`, `scripts/verify-contract-providers.mjs`, their tests, and `contracts/catalog/contract-catalog.json`.
  - Preserve the existing reference-data and identity contract behavior while widening coverage to the required first-release seams.
  - Traceability: US-SP-006, US-RUN-004.

- [x] Step 2: Extend the contract catalog metadata model.
  - Add catalog entries and metadata for required OpenAPI, Avro, HTTP Pact, message-pact, and schema subject assets.
  - Require owner, source service, optional consumer service, seam id, protocol, semantic version, lifecycle status, compatibility mode/status, linked stories, linked requirements, artifact path, and validation ownership.
  - Ensure markdown-only artifacts cannot satisfy readiness.
  - Traceability: US-SP-004, US-SP-006, US-BKG-005, US-CMM-006, US-RUN-004.

- [x] Step 3: Add executable first-release contract skeleton assets where missing.
  - Add or extend OpenAPI artifacts for Booking to Charge pricing and D&D seams without implementing Charge runtime behavior.
  - Add Avro schemas for `booking.confirmed` and `containermovement.status` with correlation, event identity, schema version, idempotency, booking revision, and ordering metadata.
  - Add HTTP Pact fixtures for Booking to Charge pricing and D&D.
  - Add message-pact fixtures for Booking to CMM and CMM to Booking event seams.
  - Keep examples synthetic and deterministic.
  - Traceability: US-BKG-005, US-CMM-006, US-SP-006.

- [x] Step 4: Harden catalog validation logic.
  - Validate semantic versions, lifecycle statuses, compatibility modes/statuses, protocol/kind combinations, linked story and requirement arrays, seam identifiers, and required asset existence.
  - Validate JSON-based examples and fixtures with useful failure messages.
  - Validate required event schemas for reference-data, `booking.confirmed`, and `containermovement.status`.
  - Preserve the guard that downstream runtime service directories remain out of scope for this unit.
  - Traceability: US-SP-006, US-RUN-004, NFR-COMP-001.

- [x] Step 5: Harden provider and fixture verification.
  - Extend `scripts/verify-contract-providers.mjs` to verify required OpenAPI path declarations for identity, reference-data, pricing, and D&D APIs.
  - Verify required Avro record fields for reference-data, `booking.confirmed`, and `containermovement.status`.
  - Verify HTTP Pact and message-pact fixture structure, provider/consumer ownership, interaction ids, status expectations, headers, keys, and payload example links.
  - Keep live provider verification optional and skipped unless `--live` is passed.
  - Traceability: US-SP-004, US-BKG-005, US-CMM-006, US-RUN-004.

- [x] Step 6: Add contract health evidence generation.
  - Generate a deterministic JSON health snapshot from catalog validation and provider verification results.
  - Include overall status, generated timestamp, per-seam statuses, blocking failures, artifact links, stale/unknown indicators, and story/requirement trace.
  - Support an evidence file argument for local and CI commands without requiring remote services.
  - Traceability: US-SP-006, US-RUN-004, NFR-COMP-001.

- [x] Step 7: Add Comprehensive tests for the validator.
  - Cover happy path, missing required metadata, invalid semantic version, invalid compatibility state, missing required seam artifact, invalid JSON fixture, missing event schema, markdown-only non-readiness, health snapshot blocking failures, and downstream runtime guardrails.
  - Use temporary fixture directories where negative cases should not mutate repository contract assets.
  - Traceability: US-SP-006, US-RUN-004.

- [x] Step 8: Add Comprehensive tests for provider and fixture verification.
  - Cover happy path, required OpenAPI path checks, required Avro fields, HTTP Pact structure, message-pact structure, evidence file writing, skipped live verification, and live failure reporting.
  - Keep tests deterministic and local-only.
  - Traceability: US-SP-004, US-BKG-005, US-CMM-006, US-RUN-004.

- [x] Step 9: Run local verification commands and fix failures.
  - Run `node --test scripts/validate-contract-catalog.test.mjs scripts/verify-contract-providers.test.mjs`.
  - Run `yarn contracts:validate`.
  - Run `yarn contracts:verify`.
  - Run `yarn typecheck` if TypeScript-facing contract outputs or package files are touched.
  - Record any skipped command and reason in the code summary.
  - Traceability: US-SP-006, US-RUN-004.

- [x] Step 10: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files created or modified, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all unit stories.

## Implementation Guardrails

- Do not create `services/booking-service`, `services/charge-service`, `services/container-movement-service`, `apps/booking`, `apps/charge`, or `apps/container-movement` in this unit.
- Do not replace provider or consumer tests; this unit supplies executable contract assets and readiness gates.
- Do not mark compatibility or readiness green when required evidence is missing, stale, invalid, not comparable, or failed.
- Keep generated evidence deterministic enough for CI diffing and local debugging.
