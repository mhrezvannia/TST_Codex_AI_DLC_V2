# Performance Requirements - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

These targets refine `requirements.md` NFR-001 for U04's route set, using this unit's `business-logic-model.md` (recent-list, detail/timeline, capture, and relationship workflows) and `business-rules.md` (BR4-010 through BR4-020 route and read rules, BR4-040 through BR4-049 capture rules) as the shape of the work being measured. The verified `technology-stack.md` scan bounds what may be asserted. Per the answered Q1, NFR-001's two thresholds remain the **binding** acceptance gate; the segment breakdown is non-binding guidance for attributing a regression.

U04 is the only unit that introduces a new deployable, so it is also the only unit whose cold-start and first-render characteristics are genuinely new rather than inherited.

## Binding Targets (NFR-001, unchanged)

On the isolated acceptance host after documented warm-up, under 10 concurrent local users:

| Target | Threshold | Scope |
| --- | --- | --- |
| BFF list/detail response p95 | <= 1,000 ms | `/container-movement` recent read; `/container-movement/journeys/[journeyId]` detail read |
| Route operational readiness p95 | <= 2,500 ms | Same routes, measured to usable rendered state |

The shell-owned Booking relationship region is measured as part of `/booking/[bookingId]`, which U04 changes; its added lookup must not push that page past the same thresholds.

Evidence records host, fixture, warm-up, concurrency, samples, failures, and percentile method. A miss is a failure, not an averaged-away pass.

## Non-Binding Segment Budget

| Segment | Indicative share of the list/detail budget | Notes |
| --- | --- | --- |
| Session resolution + Identity authorization | ~10-15% | One current-request decision per read (BR4-001); capture adds a second, independent decision |
| Subject-assertion issuance | ~2-5% | HMAC signing per provider call — cheap, but it is on every v2 read, so a large share here indicates a signing misconfiguration |
| CMM v2 provider call | ~55-65% | Includes the service's own `timelineV1` computation |
| Reference active-location resolution | ~10-15% | Bounded to <= 50 active options; label failure degrades to raw ID rather than blocking |
| BFF adaptation and VM build | ~5-10% | Pure transformation; `timelineV1` is rendered as provided, not recomputed |
| Serialization and route render | remainder | — |

Two properties follow from the design rather than from measurement. First, `timelineV1` is computed **inside the CMM service** (BR4-030), so timeline cost is provider-side and does not grow with BFF or browser work — a slow timeline is a provider signal, not a UI one. Second, detail cost does not scale with history length in the BFF, because no merge, dedupe, or next-move calculation happens downstream (BR4-031).

## New-Deployable Considerations

`apps/container-movement` is new, so these are measured rather than inherited:

- **Cold start and first compile** are excluded from the warmed sample by the documented warm-up, but the warm-up procedure itself must be recorded — an unwarmed first request on a brand-new Next.js app is not comparable to the other three units' numbers.
- **Base-path asset resolution** under `/container-movement/_next/*` is a new edge path; asset 404s or double-prefixing show up as readiness-time regressions rather than as errors.
- **Container health** (`/api/health`) is base-path aware and authorizes nothing, so it must stay off the measured path and must not be used as a readiness proxy for the domain routes.

## Capture-Path Timing

Capture is measured separately from reads and has no NFR-001 threshold of its own. What matters for U04 is that the **authoritative re-read** (BR4-049) is inside the user-perceived command time: confirmed success is not claimed until the re-read completes, so the command feels as slow as provider-write plus provider-read. That is a deliberate correctness-over-latency trade recorded here so it is not later mistaken for a performance defect and "optimized" into an optimistic update.

## Explicit Non-Targets

No throughput, sustained-load, soak, stress, or capacity target. No production latency SLO, availability target, or cloud runtime characteristic. No Kafka delivery-latency or end-to-end event-propagation target — publication, delivery, and Booking projection are asynchronous truths U04 does not own and must not imply timing for (BR4-053).

## Verification

Performance evidence is produced at Build and Test and repeated at intent exit, feeding the NFR-007 blocking gate. Per NFR-011, container startup, a screenshot, or a single unmeasured request is never performance evidence.
