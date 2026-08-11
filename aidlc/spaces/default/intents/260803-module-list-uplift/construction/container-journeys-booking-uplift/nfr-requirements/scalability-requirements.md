# Scalability Requirements - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

Per the answered Q2, this artifact records **local acceptance capacity only**. Bounded surfaces come from `business-logic-model.md` (the bounded-`limit` recent list, the single atomic detail read, the bounded location port) and `business-rules.md` (BR4-014, BR4-016, BR4-017, BR4-070). It is constrained by `requirements.md` NFR-001 and NFR-012 and by `technology-stack.md`, which states that static evidence does not justify claims about a public-cloud runtime, production orchestration, autoscaling, or a managed database.

## Acceptance Capacity

| Dimension | Value | Source |
| --- | --- | --- |
| Concurrent local users | 10, warmed | NFR-001 |
| Acceptance topology | isolated `linercore-wave-a` Compose project, plus the new CMM app image and Nginx prefix | NFR-012, `services.md` |
| Recent-list `limit` | 25, 50, or 100; default 25 | BR4-014 |
| Reference active-location options per request | <= 50 | BR4-070 |
| Journey detail reads | one atomic v2 call per record | BR4-073 |

These are acceptance parameters, not capacity planning.

## Bounded-Growth Properties

- **The recent list is bounded by `limit`, with no pagination at all.** There is no cursor, page, or total (BR4-014, BR4-017), so there is no path by which a large Journey population becomes client or BFF work. The absence of pagination is a deliberate contract boundary, not an unfinished feature.
- **Timeline cost is provider-side and bounded by the Journey's own history.** `timelineV1` is computed in the CMM service (BR4-030) and rendered verbatim; no downstream layer merges, dedupes, or recomputes it (BR4-031). A Journey with long history costs more *at the provider*, and that is where it must be measured.
- **Detail is one call, not N.** Unlike U03's per-bound-version rate reads, U04's detail is a single atomic read (BR4-073), so detail cost does not scale with the number of timeline items in round-trips.
- **Location resolution is bounded per request.** The 50-option cap means label cost does not grow with row or timeline-item count.
- **The relationship lookup is one exact-ID call.** Booking-to-Journey resolves by exact `bookingId` (BR4-063); there is no scan, search, or fan-out in either direction.

## The Asynchronous Path Is Not a U04 Scaling Claim

Journey persistence, CMM outbox publication, broker delivery, and Booking projection application are four separate truths (BR4-053). U04 renders each only from its own evidence and asserts **no** throughput, lag, backlog, consumer-scaling, or partition-count target for any of them. W4 adds no Kafka topic and changes no listener configuration.

One capacity-adjacent fact is recorded because it is already evidenced rather than projected: both listeners run at concurrency three with stable consumer groups, and **no** bounded retry, error handler, DLQ, poison ledger, or replay contract is configured. The consequence is a blast-radius property, not a throughput number — one poison record can repeatedly block its partition, while other partitions, owning-service persisted truth, synchronous module reads, and direct Booking-to-Journey lookup remain available. This remains a BLOCKED platform dependency and a hard completion condition for U04 and the intent; it is not a scaling item to be tuned.

## Explicit Non-Claims

No production load projection, growth model, capacity plan, scaling trigger, autoscaling policy, replica count, connection-pool sizing, cache sizing, or multi-instance topology. U04 adds no cache, no BFF persistence, no database, and no topic. Per `technology-stack.md`, PostgreSQL, Kafka broker, Node.js, Yarn, and browser-runtime versions were not retained in the scan, so no capacity characteristic is inferred from them.

## Verification

The warmed ten-user sample at Build and Test verifies the acceptance capacity above; `limit` and cardinality bounds are verified by the contract tests in `business-rules.md` §Rule Verification. Per NFR-011, an untested headroom assumption is not evidence and is not recorded here as one.
