# Scalability Design - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

This design realizes `scalability-requirements.md`, which records **local acceptance capacity only**. It uses the bounded surfaces in `business-logic-model.md` and the stack in `tech-stack-decisions.md`. Per Q1, non-applicable catalogue patterns are recorded with reasons.

As with the other units there is no scaling architecture to design. What this artifact designs is the boundedness that makes the acceptance target structural — plus one genuinely different consideration: U04 is the only unit adjacent to an asynchronous path, and the design position there is deliberate non-reliance.

**Consumed inputs.** `scalability-requirements.md` supplies the acceptance capacity and non-claims this design realizes; `business-logic-model.md` supplies the bounded surfaces; `tech-stack-decisions.md` records the stack whose evidence limitations forbid inferring a production runtime; `performance-requirements.md` supplies the ten-user warmed method under which the bounds are measured; `security-requirements.md` supplies the per-request authorization that forecloses caching as a scaling device; and `reliability-requirements.md` supplies the recovery semantics that batching or queueing would break.

## Boundedness by Design

| Property | Mechanism | Consequence |
| --- | --- | --- |
| Recent-list work is bounded by `limit` | 25/50/100 with **no** pagination, cursor, or total | Cost independent of Journey population; nothing to page through |
| Detail work is one call | Single atomic v2 read carrying Summary and `timelineV1` | No per-item fan-out; round-trips independent of timeline length |
| Timeline work is provider-side | Computed in the CMM service, rendered verbatim | No client or BFF merge cost at any history length |
| Label work is bounded per request | Location port capped at 50 active options | Cost independent of row or timeline-item count |
| Relationship lookup is one exact-ID call | Booking-to-Journey by exact `bookingId` | No scan, search, or fan-out in either direction |
| No accumulation anywhere | No cache, no BFF persistence, no client store of provider truth | Nothing grows with usage |

The absence of pagination on the recent list deserves emphasis: it is a deliberate contract boundary, not an unfinished feature. There is no verified provider contract for search, filter, sort, cursor, or page, so offering one would mean simulating it client-side — which is exactly what the requirements forbid.

## The Asynchronous Path Is Not a Scaling Mechanism

U04 renders four separate truths — Journey persisted, published to outbox, delivered by broker, applied to Booking projection — and asserts no throughput, lag, backlog, consumer-scaling, or partition-count target for any of them. W4 adds no topic and changes no listener configuration.

One evidenced capacity-adjacent fact is recorded, and it is a blast-radius property rather than a throughput number: both listeners run at concurrency three with stable consumer groups and **no** configured error handler, bounded retry, DLQ, poison ledger, or replay contract. A poison record can therefore repeatedly block its partition, while other partitions, owning-service persisted truth, synchronous module reads, and direct Booking-to-Journey lookup remain available.

This is **not** a scaling item to tune. Raising concurrency would not address it and could widen the affected surface. It remains a BLOCKED platform dependency and a hard completion condition for U04 and the intent.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Horizontal / vertical scaling strategy | Single local Compose topology; no replica or sizing decision exists | NFR-012 |
| Auto-scaling rules | No orchestration platform; static evidence does not justify a production runtime claim | NFR-012, `technology-stack.md` |
| Load balancing | One instance per app in the acceptance topology | `services.md` |
| Data partitioning / sharding | U04 owns no data; CMM owns its database | U04 non-responsibilities |
| Kafka partition/consumer scaling | Existing configuration; W4 changes no messaging setup and the real gap is poison handling, not throughput | `services.md`, `reliability-requirements.md` |
| Queue-based decoupling of U04's own work | U04's reads and capture are synchronous by design; leaning on the event path for user-facing work would conflate the four truths | BR4-053 |
| Caching tiers | Forbidden — last-known facts need provider source and time; authorization is never cached | FR-019, FR-020 |
| Capacity planning / growth model | Explicitly excluded; ten users is an acceptance parameter | `scalability-requirements.md` |

## Capacity Thresholds

The only asserted thresholds are acceptance parameters: 10 concurrent warmed local users, `limit` ∈ {25, 50, 100} default 25, and ≤50 location options per request. None triggers an action — there is no autoscaler, queue-depth alarm, or capacity alert, and inventing one would imply an operational surface that does not exist.

## What Would Change This

A production hosting decision, an approved cache, a verified provider pagination contract for the recent list, or closure of the poison/replay exit with an approved retry and DLQ design. Each would require its own change control; none is in W4's scope.

## Verification

The warmed ten-user sample verifies acceptance capacity. Boundedness is verified by the contract tests in `business-rules.md` — `limit` enumeration, unknown-key rejection including actor fields, option cardinality, and the prohibition on client merge, dedupe, and next-move calculation. The blast-radius statement is verified by observing that a blocked partition leaves synchronous reads and the direct relationship lookup available. Per NFR-011, an untested headroom assumption is not evidence.
