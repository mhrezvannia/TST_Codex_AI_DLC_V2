# Application Design Questions - W2-04 Container Journey & Track-Trace

## Context

These questions cover only choices not already fixed by `requirements.md`,
`stories.md`, `architecture.md`, `component-inventory.md`,
`team-practices.md`, the refined interaction artifacts, or the W2-04 intent.
The following are already binding and are not being re-opened: Kafka-only normal
delivery, service-owned databases, the existing CMM bounded context, exact
Identity permission tuples, producer-owned defaulted v1 `sequenceNumber`,
Booking's latest-only projection, a new CMM-owned app inside the shared shell,
ordered additive migration, and the named scope exclusions.

## Q1 - Domain boundary for DCSA lifecycle

How should the existing `ContainerJourney` boundary evolve for the four-code
thin lifecycle?

- A. Keep `ContainerJourney` as aggregate root and extract typed value objects
  plus a focused transition policy for code/classifier/load-state/sequence
  validation (recommended).
- B. Add a separate `MovementLifecycle` aggregate coordinated by the
  application service.
- C. Replace the current aggregate with a new journey model and migrate all W1
  behavior at once.
- X. Other (please specify).

[Answer]: A. Keep `ContainerJourney` as aggregate root and extract typed value objects plus a focused transition policy for code/classifier/load-state/sequence validation. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Q2 - CMM persistence shape inside the ordered Flyway chain

Which additive persistence shape should support current reads, durable accepted
history, and observable rejections while preserving W1 data?

- A. Hybrid: retain a versioned journey snapshot for aggregate rehydration and
  add append-only movement/rejection/request records plus corrected outbox
  constraints (recommended).
- B. Fully normalize the journey, expected plan, movements, and lifecycle now;
  retire JSON snapshots during this intent.
- C. Keep an expanded JSON snapshot only and store rejection detail solely in
  the generic audit table.
- X. Other (please specify).

[Answer]: A. Hybrid: retain a versioned journey snapshot for aggregate rehydration and add append-only movement/rejection/request records plus corrected outbox constraints. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Q3 - Rejection transaction and API outcome

How should duplicate and out-of-sequence capture commit durable rejection
evidence without mutating accepted state?

- A. Return a targeted sealed capture outcome from the transactional
  application method; accepted outcomes commit history/lifecycle/outbox, while
  rejected outcomes commit only request/rejection audit evidence and the REST
  adapter maps them to stable HTTP 409 responses (recommended).
- B. Throw domain exceptions and write rejection evidence in a separate
  `REQUIRES_NEW` transaction before REST mapping.
- C. Pre-validate sequence and duplicates in the REST controller before calling
  the application service.
- X. Other (please specify).

[Answer]: A. Return a targeted sealed capture outcome from the transactional application method; accepted outcomes commit history/lifecycle/outbox, while rejected outcomes commit only request/rejection audit evidence and the REST adapter maps them to stable HTTP 409 responses. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Q4 - Journey-created status compatibility

What should happen to the existing status outbox entry created when
`booking.confirmed` opens a journey?

- A. Preserve it as a valid sequence-0 planned fact: `PLN LOAD` at POL with
  Allocated lifecycle; actual accepted GTOT/LOAD/DISC/GTIN remain ACT sequences
  1-4 (recommended).
- B. Stop publishing on journey creation; publish only the four accepted ACT
  movements.
- C. Keep the current generic planned-departure mapping unchanged alongside the
  new ACT events.
- X. Other (please specify).

[Answer]: A. Preserve the journey-created outbox fact as sequence-0 `PLN LOAD` at POL with Allocated lifecycle; actual accepted GTOT/LOAD/DISC/GTIN remain ACT sequences 1-4. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Q5 - Canonical CMM outbox status vocabulary

How should the Java/SQL outbox-state mismatch be repaired?

- A. Make the existing Java lifecycle canonical (`PENDING`, `IN_PROGRESS`,
  `PUBLISHED`, `RETRYABLE`, `FAILED_PERMANENT`) and add an ordered migration
  that normalizes safe legacy values and constraints (recommended).
- B. Rename the Java lifecycle to the current SQL terms (`CLAIMED`,
  `FAILED_RETRYABLE`) and migrate serialized/runtime references.
- C. Keep both vocabularies and translate in the repository adapter.
- X. Other (please specify).

[Answer]: A. Make the existing Java lifecycle canonical (`PENDING`, `IN_PROGRESS`, `PUBLISHED`, `RETRYABLE`, `FAILED_PERMANENT`) and add an ordered migration that normalizes safe legacy values and constraints. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Q6 - Frontend component and state boundary

How should the CMM-owned Next.js application divide server and client work?

- A. Server-render list/detail reads through the CMM BFF, with focused client
  components only for filters, responsive capture, retry, and live feedback;
  keep state local and use no global store (recommended).
- B. Make list/detail/capture a client-rendered application with one global
  state store.
- C. Put the Container Movement page composition in `apps/shell` and call CMM
  APIs directly from shell routes.
- X. Other (please specify).

[Answer]: A. Server-render list/detail reads through the CMM BFF, with focused client components only for filters, responsive capture, retry, and live feedback; keep state local and use no global store. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Q7 - Dependency failure behavior during capture

When Identity or Reference Data freshness cannot be confirmed, what operator
behavior should the architecture expose?

- A. Keep persisted journey reads available as explicitly last-known data,
  disable capture with the dependency-specific reason and Retry action, and
  keep backend authorization/reference checks fail-closed (recommended).
- B. Fail the entire Container Movement detail page until every dependency is
  healthy.
- C. Accept the movement locally and queue validation for later.
- X. Other (please specify).

[Answer]: A. Keep persisted journey reads available as explicitly last-known data, disable capture with the dependency-specific reason and Retry action, and keep backend authorization/reference checks fail-closed. **Mode:** Guide me. **Recorded:** 2026-07-21.

## Ambiguity Check

After all answers are recorded, verify that they do not conflict with the
approved requirements, especially atomic rejection evidence, W1 preservation,
contract compatibility, least privilege, shared-shell ownership, and the
Kafka-only normal path. Add follow-up questions here before artifact generation
if any answer is vague, contradictory, or incomplete.

**Analysis:** No ambiguity or contradiction detected. All seven decisions retain
the approved Kafka-only path, service/database ownership, W1 compatibility,
defaulted v1 sequence semantics, atomic accepted/rejected effects, exact Identity
authority, CMM page ownership, and fail-closed capture posture. The sequence-0
planned LOAD is intentionally distinct from ACT sequences 1-4 and remains
BACKWARD-compatible.

## Consolidated Confirmation

Do the seven recorded decisions accurately represent the architecture to use for
the five Application Design artifacts?

- A. Yes, generate the artifacts from these decisions.
- B. No, revise the answers first.
- X. Other (please specify).

[Answer]: A. Yes, generate the artifacts from these decisions. **Mode:** Guide me. **Recorded:** 2026-07-21.
