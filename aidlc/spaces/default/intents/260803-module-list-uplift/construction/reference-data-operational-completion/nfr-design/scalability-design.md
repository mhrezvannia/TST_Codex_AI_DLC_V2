# Scalability Design - U02 Reference Data Operational Completion

## Source Alignment

This design realizes `scalability-requirements.md`, which records **local acceptance capacity only**. It uses the bounded surfaces in `business-logic-model.md` and the stack in `tech-stack-decisions.md`. Per Q1, non-applicable catalogue patterns are recorded with reasons.

No scaling architecture is designed. What this artifact designs is the boundedness that makes the acceptance target structural, plus the one consideration unique to U02: it is the first unit with a **write path**, and the design position on write capacity is that correctness, not throughput, is the requirement.

**Consumed inputs.** `scalability-requirements.md` supplies the acceptance capacity and non-claims this design realizes; `business-logic-model.md` supplies the bounded surfaces; `tech-stack-decisions.md` records the stack whose evidence limitations forbid inferring a production runtime; `performance-requirements.md` supplies the ten-user warmed method under which the bounds are measured; `security-requirements.md` supplies the per-request authorization that forecloses caching as a scaling device; and `reliability-requirements.md` supplies the recovery semantics that batching or queueing would break.

## Boundedness by Design

| Property | Mechanism | Consequence |
| --- | --- | --- |
| List work bounded by page size | 25/50/100, `includeInactive` only, fixed provider order, no client filter/sort/merge | Cost independent of set population |
| Form derivation is compile-time | `ReferenceFormCatalogV1` is build-time data, not a runtime fetch | No per-request I/O; independent of set size |
| Canonical selectors are bounded reads | Existing REGION and VESSEL_VOYAGE/LOCATION record-list reads | A selector cannot become the page's dominant cost |
| History is a scoped facet | Panel-scoped failure and rendering | History growth cannot make the detail route fail |
| Nothing accumulates | No cache, no BFF persistence, no draft database, no client store of provider truth | Nothing grows with usage or session length |

The compile-time catalog row is worth emphasis: an earlier design proposed a runtime field-schema endpoint. Removing it eliminated a per-request round trip *and* a runtime failure mode, which is the rare case where the simpler contract is also the faster one.

## Write-Path Capacity Position

U02 sets **no** write throughput, write concurrency, or contention target, and this is a deliberate position rather than an omission.

The question "can two operators edit the same record at once?" is answered by the concurrency design, not by a capacity figure: yes, safely, with one of them reconciling explicitly against current truth. A throughput number would not make that safer, and a contention target would imply a tuning knob that does not exist — there is no lock, no queue, and no retry budget to size.

Provider-side uniqueness checking, validation, and optimistic-concurrency enforcement are Reference-service costs U02 does not own and sets no target for.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Horizontal / vertical scaling strategy | Single local Compose topology | NFR-012 |
| Auto-scaling rules | No orchestration platform; static evidence does not justify a production runtime claim | NFR-012, `technology-stack.md` |
| Load balancing | One instance per app | `services.md` |
| Data partitioning / sharding | U02 owns no data; Reference owns its database and its partitioning decisions | U02 non-responsibilities |
| Queue-based decoupling of writes | Would separate submission from outcome, defeating the authoritative re-read that confirmed success depends on | BR2-036 |
| Write batching | Would obscure per-command authorization and per-record conflict resolution | BR2-002, BR2-031 |
| Caching tiers | Forbidden — last-known facts need provider source and time; authorization is never cached | FR-019, FR-020 |
| Capacity planning / growth model | Explicitly excluded; ten users is an acceptance parameter | `scalability-requirements.md` |
| Connection-pool sizing | Provider-owned | `tech-stack-decisions.md` |

The write-batching and queue rows are specific to U02: both are standard write-scaling patterns, and both would break the synchronous authorize-write-reread chain that the entire outcome model depends on. They are excluded on correctness grounds, not capacity grounds.

## Capacity Thresholds

The only asserted thresholds are acceptance parameters: 10 concurrent warmed local users, record-list page sizes 25/50/100, and the bounded existing reads backing canonical selectors. None triggers an action — there is no autoscaler, queue-depth alarm, or capacity alert to trigger.

## What Would Change This

A production hosting decision, an approved cache, a provider contract returning unbounded sets, an approved bulk-import requirement, or a change to the no-new-persistence boundary. Each would require its own change control; none is in W4's scope.

## Verification

The warmed ten-user sample verifies acceptance capacity. Boundedness is verified by the contract tests already required — page-size enumeration, filter allow-listing, catalog fixture parity, and the prohibition on client filtering, sorting, and merging. Concurrency behaviour is verified by the conflict tests rather than by a load figure. Per NFR-011, an untested headroom assumption is not evidence.
