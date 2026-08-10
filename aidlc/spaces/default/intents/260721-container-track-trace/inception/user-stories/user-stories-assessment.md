# User Stories Assessment - W2-04 Container Journey & Track-Trace

## Decision

**Execute.** User stories add necessary delivery value for this brownfield
feature.

## Rationale

The approved `requirements.md` describes a user-facing operational workflow,
multiple permission levels, non-trivial lifecycle rules, visible recovery from
duplicate and sequence errors, and asynchronous CMM-to-Booking propagation.
Requirements alone state the contract, but stories are needed to preserve the
actor value and vertical acceptance boundary when work is later decomposed.

## Factors Considered

- `business-overview.md` identifies Equipment Control, Customer Service, and a
  release reviewer/auditor with different goals and observable outcomes.
- `component-inventory.md` shows that the slice crosses Identity, Booking, CMM,
  Kafka/Schema Registry, two service-owned databases, and two UI surfaces.
- `team-practices.md` establishes PB-01 as a gated walking skeleton and requires
  risk-based domain, contract, migration, consumer, UI, and live-path proof.
- The feature owns Container Movement pages but must consume the W2-02 shell and
  `packages/ui`, so stories must make ownership boundaries visible without
  becoming component-level implementation tasks.
- The DCSA sequence and explicit duplicate/out-of-sequence outcomes are complex
  business behavior that benefits from independently testable Given/When/Then
  scenarios.

## Areas Where Stories Add Value

Stories will organize the work by the operational journey: event-created plan,
journey visibility, authorized capture, explicit rejection, ordered status
projection, Booking visibility, and reproducible release evidence. Each story
will trace to FR/AC identifiers in `requirements.md`, use MoSCoW priority, state
dependencies without turning them into horizontal implementation stories, and
record INVEST compliance.

