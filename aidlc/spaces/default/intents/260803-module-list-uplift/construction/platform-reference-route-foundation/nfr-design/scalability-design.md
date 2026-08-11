# Scalability Design - U01 Platform and Reference Route Foundation

## Source Alignment

This design realizes `scalability-requirements.md`, which records **local acceptance capacity only**. It uses the bounded read surfaces in `business-logic-model.md` and the stack in `tech-stack-decisions.md`. Per Q1, non-applicable catalogue patterns are recorded with reasons.

There is no scaling architecture to design. What this artifact designs is the boundedness that makes the acceptance target structural, and — because U01 is the walking skeleton — the **absence of any accumulating component**, which is the property every later unit inherits.

**Consumed inputs.** `scalability-requirements.md` supplies the acceptance capacity and non-claims this design realizes; `business-logic-model.md` supplies the bounded surfaces; `tech-stack-decisions.md` records the stack whose evidence limitations forbid inferring a production runtime; `performance-requirements.md` supplies the ten-user warmed method under which the bounds are measured; `security-requirements.md` supplies the per-request authorization that forecloses caching as a scaling device; and `reliability-requirements.md` supplies the recovery semantics that batching or queueing would break.

## Boundedness by Design

| Property | Mechanism | Consequence |
| --- | --- | --- |
| Set list has no query surface | No filters, sort, search, or paging | Cost fixed by provider enumeration; nothing a user can vary |
| Record list bounded by page size | 25/50/100, fixed provider order, no client filter/sort/merge | Cost independent of set population |
| Detail is one call | `getRecord` returns the record and its thin-proof history | No per-row fan-out |
| Nothing accumulates | No cache, no BFF persistence, no client store of provider truth, no draft state | No component grows with usage or session length |
| Paging conversion is one-way and server-side | Browser one-based → provider zero-based in the BFF only | No convention leakage that could compound into off-by-one paging churn |

The last row of that table is the one U01 uniquely establishes: because the skeleton adds no stateful component at all, there is no accumulation baseline for later units to inherit and no shared mutable resource for them to contend on.

## What U01 Deliberately Does Not Establish

U01 is the thinnest end-to-end slice. It exercises no mutation load, no concurrent writes, no version-conflict contention, and no bounded option lookups. Nothing about its capacity is evidence for U02's mutation paths, U03's per-version rate reads, or U04's capture path — each records its own sample. Stating this explicitly prevents the skeleton's comfortable numbers from being read as headroom for the units that follow.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Horizontal / vertical scaling strategy | Single local Compose topology; no replica or sizing decision exists | NFR-012 |
| Auto-scaling rules | No orchestration platform; static evidence does not justify a production runtime claim | NFR-012, `technology-stack.md` |
| Load balancing | One instance per app in the acceptance topology | `services.md` |
| Data partitioning / sharding | U01 owns no data; Reference owns its database | U01 non-responsibilities |
| Queue-based decoupling | U01 is entirely synchronous; no topic exists or is added | Application Design (no new topic) |
| Caching tiers | Forbidden — last-known facts need provider source and time; authorization is never cached | FR-019, FR-020 |
| Capacity planning / growth model | Explicitly excluded; ten users is an acceptance parameter | `scalability-requirements.md` |
| Stateless-design migration | The BFF is already stateless; nothing to convert | `tech-stack-decisions.md` |
| Session affinity / sticky routing | Session is host-wide and stateless at the app; no affinity requirement exists | `components.md` |

## Capacity Thresholds

The only asserted thresholds are acceptance parameters: 10 concurrent warmed local users, record-list page sizes 25/50/100 defaulting to 25 at page 1. None triggers an action — there is no autoscaler or capacity alarm to trigger, and inventing one would imply an operational surface that does not exist.

## What Would Change This

A production hosting decision, an approved cache, a provider contract returning unbounded sets, or a change to the no-new-persistence boundary. Each would require its own change control; none is in W4's scope.

## Verification

The warmed ten-user sample verifies acceptance capacity across the three routes. Boundedness is verified by the contract tests already required — page-size enumeration, paging conversion, and the prohibition on client filtering, sorting, and merging. Per NFR-011, an untested headroom assumption is not evidence.
