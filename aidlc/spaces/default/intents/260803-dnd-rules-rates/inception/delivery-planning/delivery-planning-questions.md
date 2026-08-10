# Delivery Planning Questions - W3-01 D&D Rules and Rates

These questions choose the economic Bolt path through the approved four-unit DAG. They do not alter `requirements.md`, `stories.md`, Refined `mockups.md`, Application Design `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, or affirmed `team-practices.md`.

Binding constraints already resolved: U01 is the solo separately gated walking skeleton; U01 -> U02 -> U03 -> U04 is a hard chain; migration/contract/fixture/signoff ownership stays in U01; W2-02 shared UI work is external; focused live proof travels with every Unit; integrated Compose/audits remain exit gates.

## Q1. Sequencing heuristic

Which economic heuristic should govern the Bolt plan?

A. Hybrid walking-skeleton-first plus risk-first: ship solo U01 first, then follow the hard chain while prioritising exact version/evidence risk before the full failure matrix
B. Value-first only, prioritising the broadest visible UI regardless of technical risk
C. Numeric WSJF only
D. Time-criticality only
E. No explicit sequencing rationale beyond the DAG
X. Other (please specify)

[Answer]: A

## Q2. WSJF/scoring posture

How should value, risk, time criticality and size be represented?

A. Use an explicit ordinal comparison (High/Medium/Low plus S/M/L/XL) without fabricated numeric precision; explain each judgment
B. Assign numeric WSJF scores despite no supplied business values or cost-of-delay inputs
C. Do not compare value, risk or size at all
D. Use job size only
E. Defer every judgment until Construction
X. Other (please specify)

[Answer]: A

## Q3. Bolt granularity

How should the four Units map to Construction Bolts?

A. Four Bolts, one Unit per Bolt; U01 remains solo/gated and each live DoD/evidence file stays independently attributable
B. Three Bolts by combining U03 and U04
C. Two Bolts by combining U02-U04 into one large Bolt
D. One Bolt containing all four Units
E. Split each Unit into separate backend/UI/test Bolts
X. Other (please specify)

[Answer]: A

## Q4. Parallelism and environment use

What concurrency posture should Delivery Planning record?

A. Execute Bolts sequentially because the unit chain has no parallel antichain; allow repository-safe workstreams inside a Bolt, and serialize the guarded isolated Compose reservation/live run
B. Run all Bolts in parallel and resolve dependency conflicts later
C. Run U02-U04 in parallel after U01 despite their direct dependency chain
D. Forbid all parallel task work even inside a Bolt
E. Run live Compose acceptance concurrently from multiple Bolts
X. Other (please specify)

[Answer]: A

## Q5. External dependency gates

How should unverified owner availability and lead times be handled for W2-02 package prerequisites, Charge/Booking fixture review, Compose access, security scanning and p99 acceptance?

A. Record each as a blocking named-role gate with no invented calendar date; Delivery Planning states the blocking Bolt/evidence, mitigation and escalation, and schedule commitment waits for verified owner/lead time
B. Assume every owner and environment is immediately available
C. Remove external gates from the plan
D. Replace unmet W2-02/security/live gates with local substitutes or provisional green claims
E. Assign arbitrary one-day lead times
X. Other (please specify)

[Answer]: A

## Q6. Earliest risk focus

Which risk set should the solo walking skeleton retire first?

A. W2-compatible migration/contract ownership, exact provider evidence/calculation, real Reference timezone seam, minimal LinerCore path and signed fixtures on the running stack
B. Visual polish before provider/persistence proof
C. Full error matrix before any happy path
D. Production cloud topology
E. Booking/CMM runtime integration
X. Other (please specify)

[Answer]: A

## Q7. Mob allocation

How should the approved Team Formation roles own the Bolts?

A. One stream-aligned cross-functional intent mob across all four Bolts, with rotating Developer/Architect/QA/Design/Delivery review hats and named Charge/Booking/Pricing approvals at their seams
B. Four independent horizontal teams split by database, backend, UI and tests
C. One unreviewed developer for all work and gates
D. External AWS Professional Services ownership
E. Assign named individuals and availability without evidence
X. Other (please specify)

[Answer]: A

## Ambiguity check

After answers are collected, verify that the Bolt plan preserves the four-unit hard chain, keeps U01 solo and separately gated, gives every Bolt an observed running-stack DoD/confidence hypothesis/demo, does not invent staffing dates or production deployment, and maps every external dependency to a named role, consuming Bolt, evidence and fail-closed response.

## Consolidated decisions

- Use a hybrid walking-skeleton-first and risk-first sequence.
- Use explicit ordinal comparisons only; do not fabricate numeric WSJF precision.
- Plan four Bolts with exactly one approved Unit per Bolt.
- Execute the hard-chain Bolts sequentially while allowing repository-safe workstreams within a Bolt; serialize guarded isolated Compose use.
- Treat every unverified external dependency as a named-role blocking gate without invented dates or lead times.
- Retire W2 compatibility, exact provider/calculation, Reference timezone, minimum LinerCore path, and signed-fixture risk in the solo walking skeleton.
- Allocate one cross-functional W3-01 intent mob with rotating discipline hats and explicit seam approvals.

The user's instruction to use the recommended answers selects option A for Q1-Q7. The subsequent approval confirms this consolidated answer set for artifact generation; it does not pre-approve the Delivery Planning stage output.
