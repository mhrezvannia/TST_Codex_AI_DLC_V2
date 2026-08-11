# Performance Design - U03 Charge Agreements Operational Uplift

## Source Alignment

This design realizes U03's `performance-requirements.md` targets using the workflows in `business-logic-model.md` and the constraints in `tech-stack-decisions.md`, `scalability-requirements.md`, `security-requirements.md`, and `reliability-requirements.md`. Per the answered Q3, the design uses **non-cache optimizations only**; per Q1, every catalogue pattern that does not apply is recorded with the reason rather than omitted.

**Consumed inputs.** `performance-requirements.md` supplies the binding NFR-001 thresholds and the segment breakdown this design realizes structurally; `security-requirements.md` fixes the fail-closed ordering whose measurable consequence is that denied paths cost less; `scalability-requirements.md` supplies the bounds (page sizes, option cardinality) that keep payloads fixed; `reliability-requirements.md` fixes the authoritative re-read that shapes command-path timing; `tech-stack-decisions.md` bounds what may be assumed about the runtime; and `business-logic-model.md` supplies the workflows being measured.

## Applied Design

### Fail-fast ordering

The request pipeline is ordered so that the cheapest terminal outcomes happen first: session resolution, then the current-request Identity decision, then strict query parsing, and only then the Charge provider call. This is a security requirement (SEC-U03-03) that has a performance consequence worth stating — a denied or Identity-outage request must cost strictly less than an allowed one, because it makes zero provider calls. That property is measurable, and a denied path that is *not* faster is evidence that a provider call is happening before the policy decision.

Query rejection is likewise ordered ahead of provider access: `invalid-query` costs parsing only.

### Bounded payloads

No layer ever holds an unbounded set. Provider paging caps the Agreement list at 25, 50, or 100 rows; the Reference option port caps at 50 active records per request; manual-pricing evidence is fixed at size 25. Because label resolution is one bounded call rather than one per row, list cost does not grow with row count. This is the design property that makes the NFR-001 target achievable without a cache.

### Server-side authoritative reads

Authoritative reads are performed in server components, so the browser receives rendered output rather than issuing a second round of fetches. There is no client refetch waterfall on load, and no client-side data store holding provider truth. The client owns only draft, dirty, pending, dialog, and focus state.

### Independent region resolution

Summary and Status history arrive in the one atomic `getAgreement` read. Bound rate versions resolve through their own `getRateVersion` calls and Reference labels through the option port, and those are resolved independently rather than serialized behind one another — a slow or failing rate version delays its own panel, not the record. This is the performance face of the region containment that `reliability-requirements.md` specifies for correctness.

### Stable-size loading

Loading uses shape-stable skeletons sized to the eventual content, so arrival causes no layout shift. This is a perceived-performance and accessibility property rather than a latency one, and it is why spinner-only loading is rejected.

### Command-path shape

A command costs provider write plus authoritative re-read, deliberately. Confirmed success is not claimed until the re-read returns (BR3-037). This is recorded here so it is not later mistaken for a defect and "optimized" into rendering the submitted draft as truth — which would break the no-false-success rule the whole outcome model rests on.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Response caching / cache tiers | Last-known facts require provider source and time under current authorization; a cache would become an unowned second source of truth | Application Design (no cache, no BFF persistence); FR-019, FR-020 |
| CDN | No public hosting; acceptance is the isolated local Compose topology | NFR-012 |
| Authorization caching | Every read and command must evaluate Identity for the current request | FR-020, BR3-001 |
| Connection-pool tuning | Provider-owned; W4 changes no service runtime configuration | `tech-stack-decisions.md` (no new infrastructure tool) |
| Query optimization / indexing | Charge-service and database concern; U03 changes no Java or SQL | U03 boundary in `unit-of-work.md` |
| Async processing / queue offload | U03 introduces no topic and no background work; all its operations are synchronous request-scoped | Application Design (no new topic) |
| Lazy loading / virtualization | Page sizes are already bounded at 100 rows; virtualization would add complexity for no measured need | `scalability-requirements.md` |
| Prefetching | Would issue provider calls for records the user has not requested and cannot be authorized for in advance | FR-020 |

Recording these is the point of the answered Q1: each row is a decision, not an omission.

## Performance Budget Realization

`performance-requirements.md` fixes NFR-001's two thresholds as binding and gives a non-binding segment breakdown. This design realizes that breakdown structurally: the segments are the pipeline stages above, so an over-budget run attributes to a named stage rather than to the page as a whole. The two workload sensitivities to watch are the number of bound rate versions on a detail (the one place per-record work scales) and the option-port call under label-heavy lists.

## Verification

The warmed ten-user route and BFF sample at Build and Test verifies the binding thresholds. Denied and Identity-outage paths are sampled separately to confirm the fail-fast ordering holds. Region independence is verified behaviourally — a deliberately slowed rate-version fixture must not delay Summary. Per NFR-011, a single unmeasured request or a screenshot is never performance evidence.
