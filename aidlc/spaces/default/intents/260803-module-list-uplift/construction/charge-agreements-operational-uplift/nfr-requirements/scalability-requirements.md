# Scalability Requirements - U03 Charge Agreements Operational Uplift

## Source Alignment

Per the answered Q2, this artifact records **local acceptance capacity only**. It draws the unit's bounded surfaces from `business-logic-model.md` (list paging, the bounded option port, per-version rate reads) and `business-rules.md` (BR3-011, BR3-016, BR3-017, BR3-052), and is constrained by `requirements.md` NFR-001 and NFR-012 and by `technology-stack.md`'s explicit statement that static evidence does not justify claims about a public-cloud runtime, production orchestration, autoscaling, or a managed database.

## Acceptance Capacity

| Dimension | Value | Source |
| --- | --- | --- |
| Concurrent local users | 10, warmed | NFR-001 |
| Acceptance topology | isolated `linercore-wave-a` Compose project | NFR-012 |
| Agreement list page size | 25, 50, or 100 (browser one-based; BFF converts to provider zero-based) | BR3-011, BR3-016 |
| Rate Authority page size | provider-supported values only | BR3-017 |
| Manual pricing page size | 25 | BR3-017 |
| Reference options per request | <= 50 active records | BR3-052 |

These are the only capacity numbers U03 asserts. They are acceptance parameters, not capacity planning.

## Bounded-Growth Properties

The design's boundedness is a property worth stating because it is what makes the ten-user target meaningful rather than accidental:

- **List cost is bounded by page size, not by total Agreements.** Provider-side paging and fixed provider ordering mean no layer ever holds the full set. Client-side filtering, sorting, and page merging are prohibited at every layer (BR3-014), so there is no path by which a large result set becomes client work.
- **Label resolution is bounded per request, not per row.** The option port caps at 50 active records, so label cost does not grow with row count.
- **Detail cost grows with bound rate versions, not with Agreement history.** Each bound version is one `getRateVersion` call; this is the one place in U03 where per-record work scales, and it is bounded by how many rate versions an Agreement version binds.
- **The queue never aggregates client-side.** Segments are server-filtered and independently paged, and no client merge exists (BR3-061) — so an unadmitted or large segment cannot become a client-side scaling problem.

## Explicit Non-Claims

U03 states **no** production load projection, growth model, capacity plan, scaling trigger, autoscaling policy, horizontal or vertical scaling strategy, connection-pool sizing, cache sizing, or multi-instance topology. It adds no cache, no BFF persistence, and no new database or topic, so it introduces no new scaling dimension of its own.

Per `technology-stack.md`, PostgreSQL, Kafka broker, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan; no capacity characteristic is inferred from unversioned components. Per NFR-012, W4 makes no production hosting, availability, cadence, backup, recovery, or cloud claim, and nothing in this artifact should be read as one.

## Verification

The ten-user warmed sample at Build and Test is the only scalability evidence this unit produces, and it verifies the acceptance capacity above rather than a scaling property. Page-size and cardinality bounds are verified by the contract tests already required in `business-rules.md` §Rule Verification. Per NFR-011, an untested assumption about headroom is not evidence and is not recorded here as one.
