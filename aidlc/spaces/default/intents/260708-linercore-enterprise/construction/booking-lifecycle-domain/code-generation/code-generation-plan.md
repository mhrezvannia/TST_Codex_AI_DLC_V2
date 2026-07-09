# Code Generation Plan - booking-lifecycle-domain

## Plan Context

Unit: `booking-lifecycle-domain`

Scope: Greenfield Booking Service foundation for booking drafts, validation state, pricing orchestration state, confirmation, amendments, reconfirmation, lifecycle status, exception queues, D&D trigger candidates, idempotency, audit, and booking lifecycle outbox events. The unit must not calculate prices, D&D rates/free time, or movement status.

Test strategy: Comprehensive. This plan includes Java unit tests for booking domain/state transitions, application-service tests for idempotency/audit/outbox, container/API tests where practical, contract/schema fixture validation, and targeted build/type/lint commands.

Workspace target: create or modify booking-owned code under `services/booking-service/`, booking event contracts under `contracts/`, local runtime metadata under `infrastructure/` and `compose.yaml` if needed, and tests. No Charge, CMM, D&D, or pricing business logic is implemented here.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-BKG-001 - Create and validate booking | Step 1, Step 2, Step 3, Step 7 |
| US-BKG-003 - Request and store pricing snapshot | Step 3, Step 4, Step 7 |
| US-BKG-004 - Confirm booking | Step 2, Step 3, Step 5, Step 7 |
| US-BKG-006 - Amend/reconfirm booking | Step 2, Step 3, Step 5, Step 7 |
| US-BKG-007 - Exception queues and D&D trigger candidates | Step 3, Step 6, Step 7 |
| US-UI-002 - UI workflow support | Step 4, Step 8 |

## Sequential Implementation Steps

- [x] Step 1: Inventory service scaffolding and contract surfaces.
  - Confirm whether `services/booking-service/` already exists; if absent, scaffold a Maven multi-module service following existing service patterns.
  - Confirm booking-related OpenAPI/AsyncAPI/Avro/message fixtures and local runtime metadata.
  - Traceability: US-BKG-001.

- [x] Step 2: Implement booking domain model and state machine.
  - Add Booking, BookingRevision, BookingParty, RoutingLeg, EquipmentRequirement, PricingSnapshot, BookingException, LifecycleEvent, and DndTriggerCandidate primitives where needed.
  - Enforce legal transitions for draft, validated, pricing-pending, priced, confirmed, amended, reconfirmed, and exception states.
  - Add domain tests for transition success/failure and boundary rules.
  - Traceability: US-BKG-001, US-BKG-004, US-BKG-006.

- [x] Step 3: Implement application-service command behavior.
  - Add create/validate/request-pricing/store-pricing-snapshot/confirm/amend/reconfirm/record-exception use cases.
  - Add ports for reference validation, charge pricing, authorization, id generation, repository, idempotency, audit, and outbox.
  - Store pricing snapshots as external results; do not calculate prices.
  - Traceability: US-BKG-001, US-BKG-003, US-BKG-004, US-BKG-006, US-BKG-007.

- [x] Step 4: Add API and integration seam contracts.
  - Add OpenAPI paths or container routes for booking commands/queries where the service container exists in this unit.
  - Add typed pending/exception responses for pricing and validation seams.
  - Add tests for denied, invalid, stale, and idempotent command paths.
  - Traceability: US-BKG-001, US-UI-002.

- [x] Step 5: Add booking lifecycle outbox events.
  - Add deterministic booking confirmed/revised event facts, outbox records, schema subject, producer identity, deduplication key, and correlation id.
  - Align contracts/examples with generated payload shape.
  - Traceability: US-BKG-004, US-BKG-006.

- [x] Step 6: Add exception queue and D&D trigger candidate behavior.
  - Record exception queue entries for validation/pricing/CMM/D&D trigger blockers.
  - Record D&D trigger candidates as booking-owned orchestration evidence only; do not calculate D&D.
  - Add tests for exception classification and audit visibility.
  - Traceability: US-BKG-007.

- [x] Step 7: Add comprehensive tests.
  - Cover domain transitions, idempotency, audit, outbox, authorization denial, validation failure, pricing snapshot storage, stale revision rejection, and exception queue behavior.
  - Use fake ports; no live downstream services are required during code generation.
  - Traceability: all booking lifecycle stories.

- [x] Step 8: Add local runtime/readiness metadata where needed.
  - Add Booking Service profile/ports/env entries only if the service scaffold is added.
  - Keep real container startup for Build and Test.
  - Traceability: US-UI-002, NFR-OBS.

- [x] Step 9: Run verification commands and fix failures.
  - Run targeted Maven tests for booking service modules.
  - Run contract/schema validation for booking event/API changes.
  - Run targeted TypeScript/script checks only for touched UI/runtime files.
  - Traceability: all booking lifecycle stories.

- [x] Step 10: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files changed, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all booking lifecycle stories.

## Implementation Guardrails

- Do not calculate prices, D&D rates/free time, or movement status.
- Do not join directly to Reference Data, Charge, CMM, or D&D databases.
- Use ports/contracts for downstream seams and fake ports in tests.
- Do not claim runtime readiness from scaffolding alone; code-generation evidence is unit tests, contract checks, and local metadata.
- Preserve correlation, idempotency, audit, and outbox evidence on state-changing commands.
