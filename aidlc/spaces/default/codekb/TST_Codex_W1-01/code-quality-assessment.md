# Code Quality Assessment - LinerCore W1-01 Baseline

## Strengths

- Clear domain/application/adapter boundaries across implemented Java services.
- Immutable domain records and focused lifecycle tests.
- Transactional outbox publication in Booking, CMM, Charge, and Reference Data.
- Shared Kafka/Avro infrastructure avoids per-service publisher reinvention.
- Outbox lifecycle includes claiming, retry classification, broker coordinates, and noop safety.
- Contract catalog links seams to requirements/stories and has validation/provider scripts.
- Compose provides a reproducible local stack with a non-default PostgreSQL host port.
- CI aggregates backend/frontend/contract checks and uploads evidence.

## Test Inventory

The scan found 30 Java `*Test.java` files and 15 TypeScript/React test files under `apps` and `packages`, against approximately 285 main Java source files and 65 TypeScript/TSX source files. Booking, CMM, Charge, shared messaging, reference data, identity, shared UI, auth, API, and utility areas all have some tests.

The repository does not declare a coverage threshold/plugin in the parent Maven or root frontend configuration. Test-file counts are an inventory, not a coverage claim. This reverse-engineering stage inspected tests but did not treat the current branch as W1-green because implementation has not started.

## Critical W1 Risks

1. No Kafka consumer exists anywhere in Java source, so the required bidirectional async handoff cannot run.
2. Booking and CMM controllers still perform synchronous HTTP delivery after state changes, creating duplicate delivery paths and coupling success latency.
3. The Booking and CMM Avro schemas and domain DTOs are flatter than the frozen W1 contract and use divergent field names.
4. `BookingApplicationService.consumeMovementStatus` is not transactional across Booking state and idempotency persistence.
5. The OpenAPI pricing routes are not implemented; Booking bypasses `ChargeAgreementApplicationService.price` by translating active agreement terms itself.
6. `apps/booking` is not build-complete: missing page, BFF/data library, detail route, and test file.
7. Compose declares an `apps-container-movement` workspace that is absent, which can break full-profile builds.

## Maintainability and Data Risks

Database evolution uses mutable schema resources and ad hoc `ALTER TABLE IF NOT EXISTS` statements rather than ordered migrations. Booking stores a broad JSON snapshot alongside searchable columns, which is pragmatic for the current aggregate but requires careful compatibility handling when routing/equipment become structured collections.

Contract schemas are duplicated between `contracts/avro` and service resources. W1 needs a deterministic drift check or generation/copy discipline. Several controllers supply permissive local actor/correlation fallbacks; production authorization and trace requirements should not silently rely on them.

## Verification Gaps

The current quality workflow runs on a self-hosted runner and invokes the repository aggregator, but W1 still needs targeted producer/consumer serde tests, duplicate/redelivery integration tests, persistence/restart proof, route/component tests, and live Compose evidence showing both Kafka events and the resulting database/UI states.

The checked-in Graphify graph is stale for Booking/CMM and returned mostly older Reference Data/Charge nodes. Source verification was therefore required. The named AI-DLC developer/architect subagents could not run because their configured models are unsupported in this account; the user explicitly approved inline execution.

## Recommended W1 Quality Focus

Use a risk-first walking skeleton: freeze exact Avro/domain names, expose real Charge pricing, implement one `booking.confirmed` consumer transaction, implement one status-return consumer transaction, then build the list/create/detail UI. Protect each seam with contract/serde/idempotency tests before expanding presentation. The exit judgment must come from the full live stack plus both audits, not unit tests alone.
