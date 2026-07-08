# Code Generation Plan - U09 Local Seed Compose

## Source Trace

This plan implements U09 from `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `deployment-architecture.md`, `security-design.md`, and `reliability-design.md`.

U09 provides deterministic local seed packs, an idempotent validation/apply loader, Docker Compose wiring, and smoke checks for the Shared Platform MVP local runtime. It must not introduce production data, real users, public-cloud services, Charge/Booking/Container Movement runtime, or direct browser-to-service paths.

## Implementation Steps

- [x] Step 1: Add versioned local seed pack files.
  - Traceability: BR-U09-001 through BR-U09-017, BR-U09-025 through BR-U09-030.
  - Add committed JSON seed manifests for reference data, identity authorization defaults, and Keycloak local import metadata under `infrastructure/seeds/`.
  - Include all nine MVP reference sets and fictional local-only users.

- [x] Step 2: Implement seed pack validation and idempotency logic.
  - Traceability: BR-U09-002 through BR-U09-013, BR-U09-025 through BR-U09-030.
  - Add a Node-based seed loader that validates required fields, required reference sets, parent dependencies, duplicate natural keys, stable fingerprints, and dry-run mode.
  - Produce created, updated, skipped, failed, and correlation-id summary output without writing around service/domain semantics.

- [x] Step 3: Add local service health wait behavior.
  - Traceability: BR-U09-019 through BR-U09-022.
  - Add bounded health checks for PostgreSQL, Keycloak, Kafka, Schema Registry, identity-service, reference-data-service, apps, and Nginx using configurable endpoints.

- [x] Step 4: Wire seed loader into Docker Compose.
  - Traceability: BR-U09-019 through BR-U09-024.
  - Add a `seed-loader` local service/profile that mounts seed packs and waits for core dependencies.
  - Preserve local-only/on-prem dependencies and optional observability profile behavior.

- [x] Step 5: Expand local smoke checks.
  - Traceability: BR-U09-028 through BR-U09-030.
  - Replace placeholder smoke output with schema/seed checks, Nginx/BFF route checks, service endpoint checks, and outbox/event status visibility checks that do not query databases directly.

- [x] Step 6: Add test coverage for seed validation.
  - Traceability: Standard test strategy.
  - Add Node test files for complete seed packs, missing required reference sets, duplicate immutable key conflicts, and idempotent rerun summaries.

- [x] Step 7: Update local documentation/configuration.
  - Traceability: BR-U09-006, BR-U09-007, BR-U09-023.
  - Document local-only seed rules, fictional users, development-only secrets, and Vault placeholders for non-local descriptors.

- [x] Step 8: Run verification.
  - Traceability: U09 reliability and validation rules.
  - Run skeleton validation, seed loader dry-run, smoke checks, direct Node tests, JSON parsing, and source scans for forbidden downstream/runtime content.
  - Record any Java/Maven/Yarn/Turbo limitations from the local shell.

## Test Strategy

The active strategy is Standard. U09 must include executable Node tests for seed validation and idempotency, plus local script checks that can run without Docker services by using dry-run/schema validation mode. Docker-dependent smoke checks must fail with clear diagnostics when services are unavailable rather than hanging.

## Approval

This plan is ready for review before U09 implementation.
