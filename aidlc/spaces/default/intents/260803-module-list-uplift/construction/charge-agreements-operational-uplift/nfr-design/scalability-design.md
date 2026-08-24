# Scalability Design - U03 Charge Agreements Operational Uplift

## Source Alignment

This design realizes `scalability-requirements.md`, which per the answered Q2 of NFR Requirements records **local acceptance capacity only**. It uses the bounded surfaces in `business-logic-model.md` and the stack in `tech-stack-decisions.md`. Per the answered Q1 of this stage, non-applicable catalogue patterns are recorded with reasons.

There is no scaling architecture to design here, and saying so plainly is the honest output. What this artifact does design is the set of **boundedness properties** that make the ten-user acceptance target a structural consequence rather than a lucky measurement.

**Consumed inputs.** `scalability-requirements.md` supplies the acceptance capacity and non-claims this design realizes; `business-logic-model.md` supplies the bounded surfaces; `tech-stack-decisions.md` records the stack whose evidence limitations forbid inferring a production runtime; `performance-requirements.md` supplies the ten-user warmed method under which the bounds are measured; `security-requirements.md` supplies the per-request authorization that forecloses caching as a scaling device; and `reliability-requirements.md` supplies the recovery semantics that batching or queueing would break.

## Boundedness by Design

| Property | Mechanism | Consequence |
| --- | --- | --- |
| List work is bounded by page size | Provider paging at 25/50/100, fixed provider order, no client filter/sort/merge | Cost is independent of total Agreement population |
| Label work is bounded per request | One option-port call capped at 50 active records, not one call per row | Cost is independent of row count |
| Detail work is bounded by bound versions | One `getRateVersion` per bound rate version | The single place per-record work scales; bounded by how many versions an Agreement version binds |
| Queue work is bounded by segment | Server-filtered, independently paged segments, no client merge | An unadmitted or large segment cannot become client work |
| No accumulation anywhere | No cache, no BFF persistence, no client store of provider truth | No component grows with usage over time |

The design intent behind every row is the same: keep the working set proportional to what the user asked for, never to what exists.

## The One Scaling Sensitivity

Detail cost grows with the number of bound rate versions, because each is its own provider read. This is the only place U03 issues N calls for one record. Two design positions follow:

- The number is bounded by the domain — an Agreement version binds Freight, Surcharge, and Local rate versions, not an open-ended set — so this is bounded fan-out, not unbounded.
- The performance fixture must include an Agreement with a representative bound-version count rather than a minimal one, or the sample measures the easy case. This is recorded so the fixture is chosen deliberately.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Horizontal / vertical scaling strategy | Acceptance is a single local Compose topology; no replica or sizing decision exists to make | NFR-012 |
| Auto-scaling rules | No orchestration platform; `technology-stack.md` states static evidence does not justify a production runtime claim | NFR-012, `technology-stack.md` |
| Load balancing | Single instance per app in the acceptance topology | `services.md` |
| Data partitioning / sharding | U03 owns no data; Charge owns its database and its own partitioning decisions | U03 non-responsibilities |
| Queue-based decoupling | U03 is entirely synchronous and introduces no topic | Application Design (no new topic) |
| Caching tiers | Forbidden — last-known facts require provider source and time; authorization is never cached | FR-019, FR-020 |
| Capacity planning / growth model | Explicitly excluded; the ten-user figure is an acceptance parameter, not a projection | `scalability-requirements.md`, NFR-012 |
| Stateless-design migration | The BFF is already stateless; there is nothing to convert | `tech-stack-decisions.md` |

## Capacity Thresholds

The only thresholds U03 asserts are the acceptance parameters already fixed upstream: 10 concurrent warmed local users, page sizes 25/50/100, manual-pricing size 25, and at most 50 Reference options per request. No threshold triggers an action — there is no autoscaler, queue-depth alarm, or capacity alert to trigger, and inventing one would imply an operational surface that does not exist.

## What Would Change This

Recorded so a future reader knows what would make this artifact wrong rather than merely minimal: a production hosting decision, an approved cache, a provider contract that returns unbounded sets, or a change to the no-new-persistence boundary. None is in W4's scope, and each would require its own change control.

## Verification

The warmed ten-user sample at Build and Test verifies the acceptance capacity. The boundedness properties are verified by the contract tests already required in `business-rules.md` — page-size enumeration, option cardinality, and the prohibition on client filtering, sorting, and merging. Per NFR-011, an untested headroom assumption is not evidence.
