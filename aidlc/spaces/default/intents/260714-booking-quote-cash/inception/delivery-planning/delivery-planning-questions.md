# Delivery Planning Questions - W1-01 Booking Quote-to-Cash

## Q1. Sequencing Heuristic

Which economic sequencing heuristic should govern the Bolt plan?

A. Hybrid walking-skeleton-first and risk-first: gate the real bidirectional Kafka journey first, then resilience, then release acceptance (Recommended)
B. Value-first by UI story order without an early integration gate
C. WSJF score only, regardless of the affirmed walking-skeleton practice
D. Parallel service-first delivery followed by integration
X. Other (please specify)

[Answer]: A. Hybrid walking-skeleton-first and risk-first: gate the real bidirectional Kafka journey first, then resilience, then release acceptance (Recommended)

## Q2. WSJF Treatment

Should the plan use numeric WSJF scoring?

A. Use transparent ordinal value/risk/size comparison, not invented numeric precision, because the DAG and mandatory skeleton constrain the path (Recommended)
B. Assign numeric WSJF values without supplied economic data
C. Do not record any economic rationale
D. Sequence by estimated coding size only
X. Other (please specify)

[Answer]: A. Use transparent ordinal value/risk/size comparison, not invented numeric precision, because the DAG and mandatory skeleton constrain the path (Recommended)

## Q3. Bolt Granularity

How should the seven Units be bundled into Construction Bolts?

A. Three Bolts: B01 bundles U01-U05 for the gated real round trip, B02 contains U06 resilience, and B03 contains U07 release acceptance (Recommended)
B. Seven Bolts, one per Unit
C. One Bolt for all seven Units
D. Two Bolts: U01-U05, then U06-U07
X. Other (please specify)

[Answer]: A. Three Bolts: B01 bundles U01-U05 for the gated real round trip, B02 contains U06 resilience, and B03 contains U07 release acceptance (Recommended)

## Q4. Parallelism

Can Bolts run in parallel?

A. Strictly sequential through one stream-aligned mob; the hard DAG has one chain and shared files/runtime make parallel Bolt work unsafe (Recommended)
B. Run all Bolts in parallel despite dependencies
C. Parallelize by service with later manual reconciliation
D. Decide ad hoc during Construction without recording a stance
X. Other (please specify)

[Answer]: A. Strictly sequential through one stream-aligned mob; the hard DAG has one chain and shared files/runtime make parallel Bolt work unsafe (Recommended)

## Q5. External Dependencies

How should external dependencies be classified?

A. No external team dependency; preflight local Docker/images/disk/ports, seeded Reference/Agreement data, and user gate availability as controlled readiness items (Recommended)
B. Block on AWS or production infrastructure
C. Assume Docker and seed data without preflight evidence
D. Require an unspecified external integration team
X. Other (please specify)

[Answer]: A. No external team dependency; preflight local Docker/images/disk/ports, seeded Reference/Agreement data, and user gate availability as controlled readiness items (Recommended)

## Q6. Earliest Risks

Which risks should Bolt 1 retire?

A. Canonical schema rebaseline, Booking migration preservation, real Charge contract, two Kafka consumers, transaction/dedupe boundaries, and minimal browser-visible round trip (Recommended)
B. UI styling only
C. Performance tuning before functional seams
D. Broad D&D/tariff/auth scope beyond W1
X. Other (please specify)

[Answer]: A. Canonical schema rebaseline, Booking migration preservation, real Charge contract, two Kafka consumers, transaction/dedupe boundaries, and minimal browser-visible round trip (Recommended)

## Q7. Bolt B01 - Gated Walking Skeleton

Approve B01 as U01-U05, owned by the stream-aligned W1 mob, with DoD of one real create/validate/price/confirm/status-return journey and confidence hypothesis that the frozen contracts, migrations, shared messaging, consumers, and minimal UI can interoperate without synchronous Booking-CMM delivery?

A. Approve B01 definition (Recommended)
B. Narrow B01 so it no longer proves the required bidirectional journey
C. Widen B01 into replay, performance, and final audits
X. Other (please specify)

[Answer]: A. Approve B01 definition (Recommended)

## Q8. Bolt B02 - Resilience

Approve B02 as U06, owned by the same mob with quality/data/messaging hats, with DoD of observed duplicate/stale/out-of-order/rollback/DLT/restart safety and confidence hypothesis that at-least-once delivery preserves exactly-once business effects?

A. Approve B02 definition (Recommended)
B. Move resilience entirely into final acceptance
C. Expand B02 into unrelated availability engineering
X. Other (please specify)

[Answer]: A. Approve B02 definition (Recommended)

## Q9. Bolt B03 - Release Acceptance

Approve B03 as U07, owned by the same mob with live-proof/quality hats and user approval, with DoD of the repeatable full Compose run, performance/coverage/browser evidence, and green audits; confidence hypothesis that W1 is merge-ready rather than merely test-green?

A. Approve B03 definition (Recommended)
B. Accept unit tests without live runtime evidence
C. Add production deployment to W1
X. Other (please specify)

[Answer]: A. Approve B03 definition (Recommended)

## Upstream Context

The questions consume `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. They preserve the affirmed `integ/main-reconciled` branch target, one stream-aligned mob, mandatory gated walking skeleton, sequential local Compose delivery, and PostgreSQL host port 55432.
