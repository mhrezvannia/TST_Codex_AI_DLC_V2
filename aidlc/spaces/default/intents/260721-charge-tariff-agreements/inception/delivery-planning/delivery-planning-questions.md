# Delivery Planning Questions — W2-03 Charge Tariffs & Agreements

## Upstream Basis

Planning consumes `requirements.md`, `stories.md`, refined `mockups.md`, Application Design `components.md`, Units `unit-of-work.md`, `unit-of-work-dependency.md`, and `unit-of-work-story-map.md`, plus affirmed `team-practices.md`. The team practice requires a separately gated one-real-rate Charge-to-Booking walking skeleton; it is progress evidence, not the W2-03 release. The final Bolt plan must still deliver the complete approved vertical slice and U06 release evidence.

## Strategic Questions

### Q1 — Sequencing Heuristic

- A. Hybrid: gated walking-skeleton-first for cross-service risk, then dependency-constrained risk/value sequencing **(Recommended)** — follows affirmed practice and keeps the full slice mandatory.
- B. Risk-first without a walking skeleton — tackles uncertainty but contradicts the affirmed first-slice stance.
- C. Value-first — prioritizes complete analyst pages but delays the most uncertain bilateral integration.

[Answer]: A — Use a gated walking skeleton first, then dependency-constrained risk/value sequencing.

### Q2 — WSJF-Style Model

- A. Use an ordinal scorecard for business value, time criticality, risk reduction, and relative size **(Recommended)** — no fabricated numerical WSJF precision because no Cost-of-Delay/capacity inputs exist.
- B. Calculate numeric WSJF — requires supplied quantitative inputs before planning can continue.
- C. Use no explicit score — simpler but makes economic rationale less auditable.

[Answer]: A — Use an ordinal value/time-criticality/risk-reduction/relative-size scorecard without fabricated numeric WSJF precision.

### Q3 — Bolt Granularity

- A. Six Bolts with a gated thin walking skeleton spanning slices of U01/U02/U04/U05, followed by completion Bolts for the six-unit DAG **(Recommended)** — explicitly records the temporary partial-unit exception and never calls it release-ready.
- B. Exactly one complete Unit per Bolt — clean ownership, but cannot satisfy the affirmed cross-layer first skeleton before U03/U04/U05 completion.
- C. Bundle all six Units into one Bolt — no early confidence gate and excessive cognitive scope.

[Answer]: A — Use six Bolts with a gated thin skeleton spanning U01/U02/U04/U05 and later completion Bolts for the full DAG.

### Q4 — Construction Concurrency

- A. Strictly sequential Bolts under one stream-aligned mob **(Recommended)** — capacity is unverified and Charge migration/contract/page chains require single ownership; only internal task concurrency is allowed after owners are known.
- B. Run dependency-safe Bolts in parallel — requires verified independent mobs/capacity that are not currently supplied.
- C. Parallelize by technology layer — violates the vertical mob and unit boundaries.

[Answer]: A — Run Bolts sequentially under one stream-aligned mob; permit internal concurrency only after owner/capacity verification.

### Q5 — External/Gated Dependencies

- A. Record explicit gates with unknown lead time **(Recommended)** — named/system role assignments and capacity, Docker-capable runner, W2-02 DS-01/02/03 integration, identity/reference availability, bilateral Charge/Booking review, and serialized Wave A acceptance.
- B. Assume all dependencies are ready — would invent staffing, Docker, shared-owner, and environment readiness.
- C. Remove external gates from the plan — hides release blockers.

[Answer]: A — Record explicit owner-role gates with unknown lead times and no invented readiness.

### Q6 — Earliest Risk Focus

- A. Prove real migration + canonical contract + Booking storage/rendering in the skeleton, while reserving shared-UI and Docker gates immediately **(Recommended)**.
- B. Complete all Charge administration before cross-service proof — delays the highest integration risk.
- C. Start with visual polish — conflicts with risk and dependency evidence.

[Answer]: A — Prove real migration, canonical contract, and Booking storage/rendering in B01 while reserving W2-02 and Docker gates immediately.

## Proposed Bolt Set for Per-Bolt Confirmation

| Bolt | Included unit scope | Walking skeleton | Candidate Definition of Done / confidence hypothesis | Owning mob |
| --- | --- | --- | --- | --- |
| B01 Real-rate walking skeleton | Thin slices of U01, U02, U04, U05 | Yes, separately gated | One real Approved rate reaches canonical Charge pricing, is stored by Booking, and renders one attributable line; proves migration/HTTP/adapter/snapshot/UI spine. Not release-ready. | One W2-03 stream-aligned intent mob with Charge, Booking, data, contract, UI, quality hats. |
| B02 Complete rate authority and Charge route foundation | Complete U01 and U02 | No | All three versioned rate categories, approval/history, stable Charge routes/BFF/edge mount work; proves commercial foundation and owned UI routing. | Same mob; explicit U01 migration-chain owner. |
| B03 Agreement authority | Complete U03 | No | Exact approved rate links, agreement lifecycle/successor/history and pages pass; proves agreement authority without rewriting rate history. | Same mob; Charge/data/UX/quality hats. |
| B04 Full pricing and manual commercial cases | Complete U04 | No | Agreement-first + complete tariff three-line pricing, exact contract, no-rate/ambiguity OPEN cases/evidence pass; proves Charge provider authority/failure fidelity. | Same mob; Charge/Booking contract reviewers mandatory. |
| B05 Booking repricing and negative-outcome fidelity | Complete U05 | No | Typed immutable snapshots, explicit Reprice/history, Booking breakdown, outage/manual/denied/invalid/conflict/pending semantics pass; proves consumer fidelity. | Same mob; Booking/Charge/quality/UX hats. |
| B06 Isolated release acceptance | Complete U06 | No | Migrations/regressions/live scenarios/Playwright/performance/guards/audits observed green; proves the full intent can be accepted without touching manager 8088. | Same mob plus Docker-capable release-review role and user final gate. |

## Per-Bolt Questions

### Q7 — B01 Walking Skeleton

Accept B01's thin U01/U02/U04/U05 scope, one-line DoD, confidence hypothesis, and same-mob ownership as written?

[Answer]: Accept B01 — gated architecture-risk proof only; not W2-03 release completion.

### Q8 — B02 and B03 Authority Bolts

Accept B02 complete rate/routing foundation and B03 agreement authority, including their DoD/confidence hypotheses and same-mob specialist hats?

[Answer]: Accept B02 and B03 as written, with one U01 migration-chain owner and the same stream-aligned mob.

### Q9 — B04 and B05 Provider/Consumer Bolts

Accept B04 full Charge pricing/manual cases and B05 Booking repricing/failure fidelity, with bilateral reviewer gates?

[Answer]: Accept B04 and B05 as written, including bilateral Charge/Booking reviewer gates.

### Q10 — B06 Acceptance Bolt

Accept B06 as the only release-completion Bolt, conditional on Docker-capable ownership, both demo guards, isolated Compose, full Playwright matrix, performance evidence, and both audits?

[Answer]: Accept B06 as the only release-completion Bolt with every listed live, UI, performance, guard, and audit gate blocking.

## Ambiguity Check

All ten answers are concrete and mutually consistent. No date/capacity is fabricated. B01's partial-unit scope and DAG exception are explicit and separately gated; U01 retains sole Charge migration-file ownership; B06 alone may complete the release; manager 8088 and all external dependencies remain visible.
