# Performance Requirements - U02 Reference Data Operational Completion

## Source Alignment

These targets refine `requirements.md` NFR-001 for U02's route set, using this unit's `business-logic-model.md` (the completed read workflow, the create and update workflows, the conflict and unknown-outcome algorithms) and `business-rules.md` (BR2-010 through BR2-015 route and query rules, BR2-030 through BR2-038 mutation rules) as the shape of the work measured. `technology-stack.md` bounds runtime assertions. Per the answered Q1, NFR-001's thresholds are the **binding** gate; the segment breakdown is non-binding guidance.

U02 extends U01's proven read path with mutation depth, so its performance question is narrower than U01's: the platform cost is already established, and what is new is command latency and the authoritative re-read.

## Binding Targets (NFR-001, unchanged)

Under 10 concurrent warmed local users on the isolated acceptance host:

| Target | Threshold | Scope |
| --- | --- | --- |
| BFF list/detail response p95 | <= 1,000 ms | Set list, record list, and record detail including Summary, Attributes, and History |
| Route operational readiness p95 | <= 2,500 ms | Same routes, to usable rendered state |

Create and edit routes (`/reference-data/[setCode]/new`, `/[recordId]/edit`) are read-then-render paths for the purposes of readiness and are measured under the same readiness threshold; the command itself has no separate NFR-001 threshold.

## Non-Binding Segment Budget

| Segment | Indicative share of the list/detail budget | Notes |
| --- | --- | --- |
| Platform baseline (edge, session, shared shell) | as established by U01 | Not re-derived here; a change against U01's recorded baseline is a platform signal |
| Identity authorization | ~10-15% | Read decision; create and update each add their own independent decision |
| Reference provider call | ~50-60% | `listSets`, `listRecords`, or `getRecord` |
| History retrieval | included in detail | Scoped: a History failure must not delay or block Summary and Attributes |
| Form catalog derivation | ~2-5% | Compile-time `ReferenceFormCatalogV1`, so this is derivation not I/O; a large share indicates it is being rebuilt per request rather than reused |
| BFF adaptation and VM build | ~5-10% | Pure transformation |

## Command-Path Timing

Create and update have no NFR-001 threshold, but their shape is recorded so it is not later mistaken for a defect:

- A command costs **provider write plus authoritative re-read** (BR2-036). Confirmed success is not claimed until `getRecord` returns, so the user-perceived time is deliberately two round-trips. This is a correctness-over-latency trade and must not be "optimized" into rendering the submitted draft as truth.
- The unknown-outcome recovery path adds an exact-ID re-read before any retry (BR2-042, BR2-043). It is a rare path and is not budgeted, but it must not be made automatic to save time.
- Duplicate-submit prevention is a client-boundary check (BR2-034) and costs nothing at the provider — a second provider request appearing under rapid double-click is a correctness failure, not a latency one.

## Explicit Non-Targets

No throughput, sustained-load, soak, stress, write-rate, or capacity target. No production latency SLO, availability target, or cloud runtime characteristic. No target for provider-side validation or uniqueness checking, which the Reference service owns.

## Verification

Evidence is produced at Build and Test and repeated at intent exit, feeding the NFR-007 blocking gate. Denied and Identity-outage paths are measured separately and must be faster than the allowed path, since BR2-003 terminates them before provider access. Per NFR-011, a single unmeasured request or a screenshot is never performance evidence.
