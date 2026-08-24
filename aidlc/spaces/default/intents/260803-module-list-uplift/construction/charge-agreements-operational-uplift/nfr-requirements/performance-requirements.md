# Performance Requirements - U03 Charge Agreements Operational Uplift

## Source Alignment

These targets refine `requirements.md` NFR-001 for U03's route set, using this unit's `business-logic-model.md` (Agreement list, detail, command, and Reference-option workflows) and `business-rules.md` (BR3-010 through BR3-018 route and query rules, BR3-050 through BR3-055 option-port rules) as the shape of the work being measured. The verified `technology-stack.md` scan bounds what may be asserted about the runtime. Per the answered Q1, NFR-001's two thresholds remain the **binding** acceptance gate; the per-segment breakdown below is non-binding engineering guidance for attributing a regression.

## Binding Targets (NFR-001, unchanged)

On the isolated acceptance host after documented warm-up, under 10 concurrent local users:

| Target | Threshold | Scope |
| --- | --- | --- |
| BFF list/detail response p95 | <= 1,000 ms | `/charge-agreements` list read; `/charge-agreements/[agreementId]` detail read |
| Route operational readiness p95 | <= 2,500 ms | Same routes, measured to usable rendered state |

Evidence must record host, fixture, warm-up procedure, concurrency, sample count, failures, and percentile method. A miss is a failure, not an averaged-away pass. These are local acceptance targets, not production SLOs.

## Non-Binding Segment Budget

Guidance only — used to attribute a regression, never to redefine the gate. Segments are the calls this unit's Functional Design actually makes.

| Segment | Indicative share of the list/detail budget | Notes |
| --- | --- | --- |
| Session resolution + Identity authorization | ~10-15% | One current-request decision per read (BR3-001); no caching is permitted to "recover" this |
| Charge provider call (list page or detail) | ~55-65% | The dominant cost; provider-owned order and paging |
| Reference option resolution for labels | ~10-15% | Bounded to <=50 active options; absent or failed, the row still renders with a raw authorized ID |
| BFF adaptation (status mapping, paging conversion, VM build) | ~5-10% | Pure transformation; a large share here indicates an adaptation defect |
| Serialization and route render | remainder | — |

Two workload notes follow from the design rather than from measurement: label resolution is a per-request bounded call, so a list page's cost does not scale with row count beyond the option cap; and the Rates panel issues one `getRateVersion` per bound rate version, so detail cost scales with the number of bound versions and should be sampled against a fixture with a representative count.

## Measurement Method

The warmed ten-user sample runs against persisted Charge fixtures and real Identity decisions on the `linercore-wave-a` Compose project. Warm-up precedes measurement so first-compile and cold-connection costs are excluded, and the same fixture set is used across runs so numbers are comparable. Percentile method and raw samples are retained as evidence per NFR-001; a summary statistic alone is not evidence.

Denied and Identity-outage paths are measured separately and are expected to be faster than the allowed path, because BR3-003 terminates them before any Charge or Reference call. A denied path that is *not* faster is a signal that a provider call is being made before the policy decision — a correctness defect surfaced by a performance measurement.

## Explicit Non-Targets

No throughput, sustained-load, soak, stress, or capacity target is set for U03. No production latency SLO, availability target, or cloud runtime characteristic is claimed. Per NFR-012 and `technology-stack.md`'s evidence limitations, the acceptance host is the isolated local Compose topology; nothing here supports an inference about a hosted environment.

## Verification

Performance evidence is produced at Build and Test and repeated at intent exit. It is one input to the NFR-007 blocking gate; it does not by itself close the unit. Per NFR-011, a static reading of the code, a screenshot of a fast page load, or a single unmeasured request is never performance evidence.
