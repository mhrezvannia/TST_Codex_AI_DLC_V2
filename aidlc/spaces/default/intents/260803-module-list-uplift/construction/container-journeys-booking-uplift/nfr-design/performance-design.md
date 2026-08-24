# Performance Design - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

This design realizes U04's `performance-requirements.md` targets using the workflows in `business-logic-model.md` and the constraints in `tech-stack-decisions.md`, `scalability-requirements.md`, `security-requirements.md`, and `reliability-requirements.md`. Per the answered Q3, **non-cache optimizations only**; per Q1, non-applicable catalogue patterns are recorded with reasons.

U04 is the only unit adding a deployable, so it is the only one whose cold-start, asset-resolution, and first-render characteristics are designed rather than inherited.

**Consumed inputs.** `performance-requirements.md` supplies the binding NFR-001 thresholds and the segment breakdown this design realizes structurally; `security-requirements.md` fixes the fail-closed ordering whose measurable consequence is that denied paths cost less; `scalability-requirements.md` supplies the bounds (page sizes, option cardinality) that keep payloads fixed; `reliability-requirements.md` fixes the authoritative re-read that shapes command-path timing; `tech-stack-decisions.md` bounds what may be assumed about the runtime; and `business-logic-model.md` supplies the workflows being measured.

## Applied Design

### Fail-fast ordering

Session, then current-request Identity decision, then strict `limit` parsing, then the CMM v2 call. Denied and Identity-outage requests make zero CMM and zero Reference calls and must measure faster than the allowed path. Capture adds a second, independent authorization before any token is issued, so an unauthorized capture costs nothing at the provider.

### Provider-side timeline computation

`timelineV1` is computed inside the CMM service. This is a correctness decision (one authority for merge rules) with a direct performance consequence: the BFF and browser do no merge, dedupe, ordering, or next-move work at all, so detail rendering cost is independent of history length on the client. A slow timeline is a provider-side signal and is measured there.

### One atomic detail read

Summary and timeline arrive together in a single v2 call. Unlike U03's per-bound-version rate reads, U04's detail issues no per-item fan-out — detail cost does not scale in round-trips with timeline length.

### Bounded payloads

The recent list is capped by `limit` at 25, 50, or 100 with no pagination at all, and the location port caps at 50 active options per request. There is no cursor, page, or total to compute, so list cost is independent of Journey population.

### Server-side authoritative reads

Reads run in server components; the browser receives rendered output. The client holds only draft, dirty, pending, and focus state — never provider truth, and never a refetch waterfall.

### New-deployable specifics

Three costs exist only because the app is new, and each is a design position rather than an accident:

- **Base path matches the Nginx prefix exactly**, so assets resolve under `/container-movement/_next/*` without edge rewriting. A mismatch surfaces as readiness-time regression rather than as an error, which is why it is verified live.
- **Warm-up is documented and precedes measurement**, so first-compile cost is excluded. An unwarmed first request on a brand-new Next.js app is not comparable to the other three units' numbers.
- **`/api/health` is base-path aware, authorizes nothing, and stays off the measured path.** It is not a readiness proxy for domain routes.

### Command-path shape

Capture costs provider write plus authoritative re-read, deliberately (BR4-049). Confirmed success is not claimed until the re-read returns. Recorded so it is not later "optimized" into an optimistic update — which would break the no-optimistic-advancement rule the whole outcome model depends on.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Response caching / cache tiers | Last-known facts require provider source and time; a cache becomes an unowned second truth | Application Design (no cache); FR-019, FR-020 |
| CDN | No public hosting; local Compose acceptance only | NFR-012 |
| Authorization caching | Read and capture each require a current-request decision | FR-020, BR4-001 |
| Timeline precomputation in the BFF | Would duplicate the provider's merge rules and allow drift | BR4-030, BR4-031 |
| Connection-pool tuning | Provider-owned; W4 changes no service runtime configuration | `tech-stack-decisions.md` |
| Async processing / queue offload | U04 adds no topic; its reads and capture are synchronous. The existing event path is not a performance mechanism U04 may lean on | Application Design (no new topic) |
| Prefetching Journey details from the list | Would issue provider calls for records the user has not opened and cannot be pre-authorized for | FR-020 |
| Virtualized timeline rendering | Timeline length is bounded by a Journey's own history; no measured need | `scalability-requirements.md` |

## Performance Budget Realization

`performance-requirements.md` fixes NFR-001's thresholds as binding with a non-binding segment breakdown; this design realizes those segments as the pipeline stages above. Two sensitivities to watch: assertion signing sits on **every** v2 call, so an outsized share there indicates a signing misconfiguration rather than provider slowness; and the shell-owned Booking relationship region adds a lookup to `/booking/[bookingId]`, which must not push that page past the same thresholds.

## Verification

The warmed ten-user sample verifies the binding thresholds for both the CMM routes and the changed Booking page. Denied and Identity-outage paths are sampled separately to confirm fail-fast ordering. Asset resolution under the new base path and the exclusion of `/api/health` from the measured path are verified live. Per NFR-011, container startup is never performance evidence.
