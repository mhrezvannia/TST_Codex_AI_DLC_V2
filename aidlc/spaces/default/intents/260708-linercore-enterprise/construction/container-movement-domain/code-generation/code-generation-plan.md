# Code Generation Plan - container-movement-domain

## Plan Context

Unit: `container-movement-domain`

Scope: Greenfield Container Movement Management service foundation for journeys, expected movements, movement capture, DCSA-aligned validation, ordering/deduplication, status derivation, movement history, and status event evidence. The unit must not decide D&D relevance, mutate Booking lifecycle, or calculate pricing/D&D.

Test strategy: Comprehensive. This plan includes Java domain/application tests for journey creation, expected movement derivation, movement capture, validation, dedupe/ordering, status derivation, history, and outbox/status event mapping, plus contract validation.

Workspace target: create or modify CMM-owned code under `services/container-movement-service/`, CMM event contracts under `contracts/`, runtime metadata only where needed, and tests. Booking and D&D integration remain through events/contracts only.

## Story-To-Step Traceability

| Story or requirement | Plan steps |
|---|---|
| US-CMM-001 - Create journey | Step 1, Step 2, Step 7 |
| US-CMM-002 - Derive expected movements | Step 2, Step 3, Step 7 |
| US-CMM-003 - Capture movement events | Step 3, Step 4, Step 7 |
| US-CMM-004 - Consume reference changes | Step 4, Step 5 |
| US-CMM-005 - Derive movement status | Step 4, Step 5, Step 7 |
| US-CMM-006 - Publish movement status | Step 5, Step 8 |
| US-UI-004 - CMM UI support | Step 6, Step 8 |

## Sequential Implementation Steps

- [ ] Step 1: Inventory CMM service and contract surfaces.
  - Confirm whether `services/container-movement-service/` exists; if absent, scaffold a Maven service foundation following existing service patterns.
  - Confirm container movement Avro/AsyncAPI/message-pact contracts.
  - Traceability: US-CMM-001.

- [ ] Step 2: Implement journey and expected movement domain model.
  - Add ContainerJourney, ExpectedMovement, MovementEvent, MovementStatus, MovementHistory, MovementValidationResult, and DedupeKey primitives.
  - Derive expected movement placeholders from route facts without Booking mutation.
  - Traceability: US-CMM-001, US-CMM-002.

- [ ] Step 3: Implement movement capture validation.
  - Validate DCSA-aligned required fields, event type, event time, location, container id, and correlation/idempotency.
  - Add dedupe and stale/out-of-order handling.
  - Traceability: US-CMM-003.

- [ ] Step 4: Implement status derivation and history.
  - Derive CMM-owned status from captured movement sequence.
  - Preserve movement history and rejected/duplicate evidence.
  - Do not decide D&D relevance.
  - Traceability: US-CMM-004, US-CMM-005.

- [ ] Step 5: Add movement status outbox event evidence.
  - Add status event mapper with schema subject, producer identity, deduplication key, correlation id, journey id, booking id, container id, and status.
  - Align with existing container movement contract fixtures.
  - Traceability: US-CMM-006.

- [ ] Step 6: Add application-service ports for future UI/API.
  - Add fakeable repository, authorization, reference validation, id generation, audit, and outbox ports.
  - Keep UI changes out unless an existing UI surface is touched.
  - Traceability: US-UI-004.

- [ ] Step 7: Add comprehensive tests.
  - Cover journey creation, expected movement derivation, movement validation, dedupe, ordering, status derivation, denied authorization, history, and outbox event fields.
  - Traceability: all CMM stories.

- [ ] Step 8: Run verification commands and fix failures.
  - Run targeted Maven tests for container movement modules.
  - Run contract catalog validation.
  - Run TypeScript checks only if touched.
  - Traceability: all unit stories.

- [ ] Step 9: Write the code summary and mark this plan complete.
  - Produce `code-summary.md` under this unit's `code-generation` record directory.
  - Summarize files changed, implementation decisions, test coverage, command results, and deviations from this plan.
  - Traceability: all unit stories.

## Implementation Guardrails

- Do not mutate Booking lifecycle.
- Do not decide D&D relevance.
- Do not calculate pricing or D&D.
- Do not query Booking or D&D databases.
- Preserve correlation, dedupe, ordering, audit, history, and outbox evidence.
