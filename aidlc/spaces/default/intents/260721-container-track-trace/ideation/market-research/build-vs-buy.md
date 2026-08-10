# Build-vs-Buy Assessment - W2-04 Container Journey and Track-Trace

## Decision context

The upstream [`intent-statement.md`](../intent-capture/intent-statement.md)
requires a thin vertical slice through two existing Spring services, Kafka,
service-owned persistence, and the LinerCore shared-shell UI. It also excludes
EDI ingestion, a public DCSA API, fleet registry, depot stock, and M&R. The
decision is therefore about completing an authoritative internal journey core,
not procuring an entire transportation or terminal platform.

## Option assessment

| Criterion | Build/extend LinerCore | Buy a visibility suite | Partner for connectivity |
|---|---:|---:|---:|
| Preserve existing W1 broker and application seams | High | Low | High |
| Exact DCSA-coded lifecycle and rejection semantics | High | Medium/configuration-dependent | Low |
| Fit the W2-04 scope and ownership boundary | High | Low | Low |
| Time to prove one live vertical slice | High | Low to medium after procurement/integration | Low for the core |
| Future external-provider breadth | Medium | High | High |
| Control of audit, dedupe, and Booking projection | High | Medium | Medium |
| Avoid duplicate master data and parallel UI | High | Low to medium | High |

**Decision: build and extend the transactional core.** Reuse the established
Container Movement and Booking services, outbox/broker foundation, contract
assets, reference data, and shared shell. Use DCSA's open standard,
implementation guidance, reference material, and conformance sandbox as
accelerators rather than as a substitute application
([DCSA implementation guide](https://developer.dcsa.org/implementing-track-and-trace)).

## What to build, reuse, and defer

Build now:

- expected one-leg LOAD/DISC moves derived from `booking.confirmed`;
- explicit DCSA equipment-event value objects and lifecycle rules;
- manual ACT movement capture with stable duplicate/sequence rejection;
- producer-owned `containermovement.status` publication and Booking projection;
- Container Movement list/detail/timeline composition; and
- live broker-to-database-to-Booking and UI evidence.

Reuse now:

- W0 Kafka, Schema Registry, outbox, scheduling, audit, and safety foundations;
- the adopted W1 Booking-to-journey consumer and reverse Booking projection;
- existing reference-data boundaries, contracts, shared UI primitives, and
  shell; and
- DCSA v2.2 vocabulary and conformance resources.

Partner or buy later:

- terminal/depot/carrier EDI and visibility-network connectivity under P2-05;
- public customer/API distribution under P2-02 if a managed edge capability is
  advantageous; and
- specialist fleet, depot, condition, lease, or M&R capabilities only under
  their owning intents.

## Economics and risk controls

No public pricing source reviewed is sufficient for a procurement decision, so
this stage does not invent a license comparison. W2-04's marginal build is
favored because the running services, contracts, event infrastructure, and UI
shell already exist. Buying a suite would still require identity, master-data,
event, Booking, and audit integration while adding replacement and migration
cost.

Primary risks and controls are:

- **Standards evolution:** keep v2.2 and the current v1 wire schema frozen for
  this intent; assess v3 separately through compatibility governance.
- **Custom-core burden:** constrain the domain to the four codes, ACT, one leg,
  and explicit exclusions; prove it with contract and lifecycle tests.
- **Connectivity pressure:** retain source/correlation fields now, but route
  external ingestion to P2-05.
- **UI divergence:** compose only Container Movement-owned pages after W2-02
  integration; do not fork shared primitives or the shell.
- **False acceptance:** serialize the isolated Compose stack, guard port 8088,
  and retain the historical W1 waiver separately from real PASS evidence.

## Revisit triggers

Re-open the partner/buy decision when an owning future intent has evidence of
multiple external provider formats, onboarding/operations cost above the team's
capacity, contractual network coverage requirements, or a conformance gap that
cannot be addressed without a managed intermediary. Re-open whole-suite
replacement only as a program-level architecture decision, never as scope creep
inside W2-04.
