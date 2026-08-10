# Feasibility Assessment - W2-04 Container Journey and Track-Trace

## Executive finding

**Decision: feasible with controlled integration and acceptance risks.** The
approved [`intent-statement.md`](../intent-capture/intent-statement.md) extends a
real W1 journey seam rather than creating a new platform. The supporting
[`competitive-analysis.md`](../market-research/competitive-analysis.md),
[`market-trends.md`](../market-research/market-trends.md), and
[`build-vs-buy.md`](../market-research/build-vs-buy.md) all favor completing the
internal transactional core and using DCSA assets as standards accelerators.

The repository already contains the two directional integration boundaries:
Booking confirmation is consumed by Container Movement, and Container Movement
status is consumed into a Booking projection. It also contains the common
broker, schema, outbox, reference-data, audit, authentication, Compose, and
shared-shell foundations. W2-04 must deepen these seams with expected moves,
the thin DCSA lifecycle, stable rejection behavior, and a role-appropriate
timeline; it does not need a new service, broker, cloud platform, or vendor.

The feasibility rating is conditional on preserving the frozen contracts,
proving atomic state plus outbox behavior, synchronizing the UI baseline after
W2-02 merges, and completing serialized live acceptance. None of these is a
known blocker, but each is an exit condition rather than an assumption that
tests alone can satisfy.

## Technical viability

| Capability | Existing foundation | Required W2-04 depth | Viability |
|---|---|---|---|
| Journey opening | Real `booking.confirmed` consumer, reference validation, idempotency, and journey persistence | Derive expected POL LOAD and POD DISC for one assigned container and one leg | High |
| Movement capture | Container Movement service and authenticated application boundary | Add ACT-only GTOT/LOAD/DISC/GTIN capture, canonical values, stable validation, and preserved input | High |
| Lifecycle integrity | Journey aggregate and transactional persistence | Enforce Allocated through Returned-empty, reject duplicate/out-of-sequence moves, and leave state unchanged on rejection | High with targeted domain tests |
| Status publication | Producer-owned contract and shared outbox relay | Publish each accepted transition with exact v1 wire fields and correlation evidence | High if schema compatibility stays frozen |
| Booking projection | Existing consumer, container matching, event dedupe, stale handling, and persistence | Render the applied movement and prove rejects do not advance the projection | High |
| Operational UI | Canonical shell and module route foundation | Container Movement-owned list/detail/timeline and manual form only | Medium until W2-02 synchronization |
| Live proof | Wave A Compose script, demo guard, Playwright, and audit tooling | Serialized broker-to-database-to-Booking proof plus rejection evidence | Medium due shared acceptance coordination |

The event-driven boundary is appropriate because the two services own separate
data and already exchange published facts. Delivery can occur more than once,
so idempotency is required at both consumers. A movement acceptance operation
must commit journey state, movement history, audit evidence, and its outgoing
event atomically through the established transactional/outbox boundary. Booking
then applies the event independently and records duplicate or stale outcomes.

## Platform and operational assessment

The release target for this intent is the canonical local/on-premises Compose
topology, not a new AWS deployment. `linercore-wave-a` is an isolated acceptance
project and `scripts/wave-a-compose.mjs` is its control surface. The continuously
available manager demo on port 8088 is explicitly outside the acceptance target
and must remain healthy before and after the run.

No new infrastructure service is needed. Reusing the current topology limits
cost and operational change, while the broker, schema registry, databases, and
services still exercise the real distributed failure modes. Public-cloud
availability, multi-region design, and AWS cost estimates remain later
operation concerns unless a separately approved requirement introduces them.
This is consistent with the build decision in `build-vs-buy.md`; no procurement
or cloud-cost figure is fabricated here.

Operational feasibility depends on observable evidence: correlation identifiers
across both events, service/database state, stable rejection reasons, consumer
dedupe/stale audit outcomes, health checks, and Playwright states. Acceptance
must use one serialized stack controller so concurrent Wave A work cannot
invalidate evidence.

## Security, privacy, and compliance assessment

The slice handles internal operational data: booking and equipment references,
locations, movement times/codes, authenticated actor identifiers, correlation
identifiers, and audit records. The supplied context does not establish payment
card data, protected health information, or another special category, so PCI-DSS
and HIPAA are not claimed or imposed.

Applicable controls are role-based access, least privilege, authenticated actor
propagation, input validation, service/data ownership, transport protection in
production-like environments, tamper-evident audit history, data minimization,
and a defined retention/access policy. Actor identifiers may be personal data in
some jurisdictions; the slice should store only what the audit purpose requires.
Retention duration and subject-access handling are organization policy inputs to
resolve during NFR work, not reasons to remove auditability.

## Delivery and skill assessment

The required skill set already matches the repository: Java/Spring domain and
application code, PostgreSQL migrations, Kafka/Avro contracts, Next.js/TypeScript
UI, Playwright, Docker Compose, and contract/audit tooling. Work should stay with
one accountable vertical intent mob and specialist review roles; no named staff,
capacity, budget, or completion date is inferred.

The delivery sequence is constrained but viable:

1. Preserve the common baseline and all merged-intent behavior.
2. Complete owned backend, contract, persistence, and Container Movement page
   work without changing the shared shell or `packages/ui` ownership.
3. Synchronize with integration after W2-02 merges.
4. Run final visual and live acceptance only while holding the serialized Wave A
   stack slot.
5. Keep the historical W1 waiver and original BLOCKED record unchanged and
   separate from the later observed W1 PASS and new W2-04 evidence.

## Recommendation and conditions to proceed

Proceed to scope definition with the current thin slice. The following
conditions are mandatory:

- no synchronous shortcut for either asynchronous cross-module seam;
- no schema or envelope rename without explicit compatibility evidence and
  producer/consumer sign-off;
- no expansion into EDI, public APIs, multi-leg routing, fleet/depot/M&R, or
  shared-shell ownership;
- no final visual acceptance before W2-02 synchronization;
- no live acceptance against the manager-demo Compose project;
- no completion claim without broker, database, Booking, Playwright, and both
  audit proofs; and
- no conversion of the historical W1 waiver into a PASS.
