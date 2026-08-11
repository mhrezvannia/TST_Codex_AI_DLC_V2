# Stage Memory - NFR Design (3.3)

## Interpretations

- 2026-08-11T08:28:00Z — Read the stage definition's focus areas (circuit breakers, bulkheads, caching tiers, CDN, auto-scaling rules, sharding, replication, failover) as a **catalogue to select from**, not a checklist to satisfy. The approved artifacts forbid most of it: NFR-012 bounds acceptance to local Compose, and the Application Design adds no cache, no BFF persistence, no database, and no topic. Designing the catalogue anyway would have produced artifacts that contradict approved decisions while appearing more complete.
- 2026-08-11T08:28:00Z — Treated "no pattern" as a design decision requiring a recorded reason, not an omission. Every non-applicable catalogue pattern is named with the artifact that forecloses it, so a later reader cannot mistake a deliberate exclusion for an oversight.
- 2026-08-11T08:28:00Z — Read `logical-components.md`'s "logical infrastructure component inventory" as the components that exist in the approved topology, not a proposed future decomposition. The stage sits before Infrastructure Design, so its job is to state where NFR patterns land in the system as designed.

## Deviations

- 2026-08-11T08:28:00Z — Ran one question set for the stage group again, as at NFR Requirements, but this time without citing the withdrawn protocol clause. The justification is stated as a judgment call in the questions file itself: the four questions decide project-wide pattern applicability, not per-unit design, and per-unit differences are expressed in the artifacts.

## Tradeoffs

- 2026-08-11T08:28:00Z — Chose to state the absence of circuit breakers and automatic backoff retry as a positive design position rather than leaving the topic unaddressed. Costs artifact length and invites "why no circuit breaker?" review questions; avoids a future reader adding one and silently breaking the no-silent-advance and no-cached-truth rules that the outcome unions depend on.
- 2026-08-11T08:28:00Z — Chose to map blast radius only from evidence already established upstream (target-scoped edge failure, per-region containment, fail-closed policy, poison-record partition blocking) rather than modelling hypothetical failure scenarios. Less coverage; every statement is traceable to something already verified.

## Open questions

- 2026-08-11T08:28:00Z — The shared `@erp/ui` package and the host-wide session are the two genuine cross-unit coupling points, and neither is owned by W4. Confirm with W2-02 whether a shell-package regression has a rollback path independent of the domain apps, or whether all four apps fail together — this affects the blast-radius claim and is not answerable from W4 evidence.

## Deviations (post-review)

- 2026-08-11T09:05:00Z — The reviewer found `upstream-coverage` failing on 16 of 20 artifacts: only `performance-design.md` named all six declared consumes, and the `logical-components.md` files cited the NFR-requirements set collectively ("all four U0X NFR requirements artifacts") rather than by name. This is the SAME defect class the reviewer flagged at NFR Requirements (4 of 20 there), where I fixed the four failing files without generalizing the lesson to how Source Alignment sections are written. Fixed here by adding a substantive "Consumed inputs" paragraph to every artifact naming each of the six and what it supplies — not a keyword list. The generalizable correction: a stage's `consumes` frontmatter is a checklist to satisfy per artifact, and collective phrasing does not satisfy it.
