# Scalability Requirements - U01 Walking Skeleton

## Source Context

These scalability requirements consume U01 `business-logic-model.md`, U01 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U01 proves a minimal integrated local path and does not introduce production autoscaling or cloud infrastructure.

## Capacity Posture

| ID | Requirement | Rationale |
| --- | --- | --- |
| SCALE-01 | `apps/shell` remains stateless across requests except for server-side session cookie interpretation. | Keeps future horizontal scaling possible. |
| SCALE-02 | Booking BFF actor propagation uses request-scoped data and does not add shared mutable state. | Avoids scaling bottlenecks and stale actor leakage. |
| SCALE-03 | U01 must not add new cache, queue, database, or cloud scaling component. | Walking skeleton should prove existing topology first. |
| SCALE-04 | The `/booking` read path must preserve existing pagination/query behavior from Booking list/read surfaces. | Prevents U01 from expanding into backend query redesign. |

## Load Assumptions

- U01 evidence is single-user local proof through Compose/Nginx.
- Production concurrency, autoscaling, and capacity planning are deferred to Operation unless later Construction stages uncover a concrete bottleneck.
- The shell and BFF should remain horizontally scalable by avoiding in-memory session authority.

## Scaling Triggers

Escalate beyond U01 requirements only if implementation introduces:

- In-process session cache or shared mutable actor state.
- New server-side polling or background work for shell login/read.
- Booking read latency consistently above the 3 second local p95 target outside cold start.
- Any route implementation that bypasses existing Booking pagination and loads unbounded datasets.
