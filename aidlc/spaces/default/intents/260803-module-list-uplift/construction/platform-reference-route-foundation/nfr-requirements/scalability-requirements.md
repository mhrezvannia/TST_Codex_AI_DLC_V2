# Scalability Requirements - U01 Platform and Reference Route Foundation

## Source Alignment

Per the answered Q2, this artifact records **local acceptance capacity only**. Bounded surfaces come from this unit's `business-logic-model.md` (the record-list query workflow) and `business-rules.md` (its route and query rules). It is constrained by `requirements.md` NFR-001 and NFR-012 and by `technology-stack.md`, which states that static evidence does not justify claims about a public-cloud runtime, production orchestration, autoscaling, or a managed database.

## Acceptance Capacity

| Dimension | Value | Source |
| --- | --- | --- |
| Concurrent local users | 10, warmed | NFR-001 |
| Acceptance topology | isolated `linercore-wave-a` Compose project | NFR-012 |
| Set list query controls | none | U01 business rules |
| Record list page size | 25, 50, or 100; default 25, page 1 | U01 business rules |
| Paging conversion | browser one-based to provider zero-based, in the BFF only | U01 business rules |

These are acceptance parameters, not capacity planning.

## Bounded-Growth Properties

- **The set list has no query surface at all**, so its cost is fixed by the provider's enumeration rather than by anything a user can vary.
- **Record-list cost is bounded by page size, not by set population.** Provider paging and fixed provider order mean no layer holds the full record set, and search, selectable sort, and client filtering do not exist — so there is no path by which a large set becomes client work.
- **Detail is one call.** `getRecord` returns the record and the provider history the thin proof requires; U01 adds no per-row fan-out.
- **No aggregation anywhere.** U01 introduces no cache, no BFF persistence, and no client store, so it adds no scaling dimension of its own.

## What U01 Does Not Establish

U01 is the thinnest end-to-end slice; it deliberately does not exercise mutation load, concurrent writes, version-conflict contention, or bounded option lookups. Nothing about its capacity should be read as evidence for U02's mutation paths, U03's per-version rate reads, or U04's capture path. Each unit records its own sample.

## Explicit Non-Claims

No production load projection, growth model, capacity plan, scaling trigger, autoscaling policy, replica count, connection-pool sizing, or multi-instance topology. Per `technology-stack.md`, PostgreSQL, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan, so no capacity characteristic is inferred from them. Per NFR-012 no production hosting, availability, cadence, backup, recovery, or cloud claim is made.

## Verification

The warmed ten-user sample at Build and Test verifies the acceptance capacity above. Page-size enumeration and paging conversion are verified by the contract tests already required in this unit's rule verification. Per NFR-011 an untested headroom assumption is not evidence.
