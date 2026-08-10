# Initiative Brief - W2-04 Container Journey & Track-Trace

## Decision and intent

**Recommendation: GO to Inception, with dependency-gated final acceptance.**

The approved [`intent-statement.md`](../intent-capture/intent-statement.md)
defines one trustworthy container journey from a real `booking.confirmed`
event through expected moves, manual DCSA-coded actual movements, lifecycle
transitions, `containermovement.status`, the Booking projection, and both
operator views. Equipment control is the primary user; customer service reads
the same progression on Booking. Duplicate and out-of-sequence input must be
observable and must not advance either service.

The release is thin by variation, not by layer: one booking, one ISO 6346
container, one POL/POD leg, expected LOAD/DISC, ACT-only GTOT/LOAD/DISC/GTIN,
and the Allocated to Returned-empty lifecycle. Its success is the observed
broker-to-database-to-Booking outcome, not document completion or tests alone.

## Validation and investment rationale

The [`competitive-analysis.md`](../market-research/competitive-analysis.md)
supports extending LinerCore's existing transactional core and using DCSA
standards/conformance assets as accelerators. A broad visibility suite,
connectivity partner, TOS, depot, fleet, or M&R product would duplicate real
W0/W1 seams and exceed this intent. No market-size, procurement-price, budget,
staffing, velocity, or delivery-date claim is made.

The [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md)
rates the slice feasible with controlled integration and acceptance risk. The
existing bidirectional Kafka seams, service-owned databases, outbox relay,
contracts, Booking projection, shared shell, Compose topology, and audit tools
form the foundation. W2-04 deepens those seams; it does not create a new
service, broker, cloud platform, or synchronous cross-service path.

## Scope boundary and concept

The approved [`scope-document.md`](../scope-definition/scope-document.md) and
[`intent-backlog.md`](../scope-definition/intent-backlog.md) keep all four
vertical outcomes mandatory: planned journey plus first end-to-end movement,
trusted departure and rejection behavior, discharged/returned-empty completion,
and synchronized release evidence.

Explicit exclusions are EDI ingestion, public DCSA APIs, multi-leg or
transshipment routing, fleet registry, depot stock, condition/lease breadth,
M&R, D&D, predictive ETA, public tracking, cloud topology, and suite
procurement. W2-04 owns Container Movement pages only. It does not redesign the
shared shell, `packages/ui`, shared tokens, or Booking.

The reviewed [`wireframes.md`](../rough-mockups/wireframes.md) is `READY`: a
canonical journey list and detail route, one expected/actual timeline, a
responsive ACT capture surface, code plus readable status, preserved input on
rejection, and complete operational states. Final visual acceptance waits for
the W2-02 merged UI baseline.

## Risk controls and release gates

The binding [`constraint-register.md`](../feasibility/constraint-register.md)
requires Kafka-only normal cross-module delivery, service-owned persistence,
the frozen producer-owned v1 wire shape, additive migrations, framework-free
domain rules, authenticated least privilege, and atomic movement/state/audit/
outbox effects. The highest risks are incorrect duplicate/sequence progression,
state/event divergence, contract drift, UI baseline drift, concurrent stack
control, branch regression, and false historical evidence.

The initiative may proceed only while these controls remain explicit:

1. Preserve prior merged intents and retain the historical W1 waiver and its
   BLOCKED manifest unchanged; neither becomes a PASS.
2. Synchronize with integration after W2-02 merges and before final visual/live
   acceptance; W2-03 remains parallel and disjoint.
3. Let only one Wave A session control `linercore-wave-a`; use
   `scripts/wave-a-compose.mjs` and run `npm run demo:guard` before and after so
   the manager demo on port 8088 remains protected.
4. Earn completion with broker, Schema Registry, both databases, Booking UI,
   duplicate/out-of-sequence unchanged-state evidence, Playwright at all four
   widths/themes/states, `aidlc-audit`, and `erp-fidelity-audit`.

## Team and handoff

The [`team-assessment.md`](../team-formation/team-assessment.md) recommends one
stream-aligned W2-04 mob with an accountable intent driver and rotating domain,
Booking-contract, UI/UX, quality/release, platform/security review hats. The
approval authorizes that role model with existing repository/tooling. Named
staff, budget, fixed capacity, and dates remain uncommitted inputs; role
coverage must be confirmed before Construction and the serialized stack slot
must be acquired before live acceptance.

Inception should refine requirements, stories, UI interaction/accessibility,
application design, vertical Units of Work, and risk-first delivery planning.
Every downstream artifact must preserve the Context Pack, the exact standards
and contract names, the explicit exclusions, the W2-02 synchronization gate,
and the observed-live Definition of Done.

## Approval outcome

Stakeholders approved intent/scope, risk controls, role-based resourcing,
reviewed concept, extend-LinerCore/DCSA rationale, and dependency-gated mob
readiness. Proceed to Inception; return to this gate if any of those decisions
changes materially.
