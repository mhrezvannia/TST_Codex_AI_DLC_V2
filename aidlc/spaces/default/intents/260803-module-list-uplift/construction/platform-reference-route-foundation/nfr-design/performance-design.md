# Performance Design - U01 Platform and Reference Route Foundation

## Source Alignment

This design realizes U01's `performance-requirements.md` targets using the canonical read pipeline in `business-logic-model.md` and the constraints in `tech-stack-decisions.md`, `scalability-requirements.md`, `security-requirements.md`, and `reliability-requirements.md`. Per Q3, **non-cache optimizations only**; per Q1, non-applicable catalogue patterns are recorded with reasons.

U01 is the walking skeleton, so this design has a second purpose beyond meeting its own targets: it establishes the platform cost baseline the other three units inherit and compare against.

**Consumed inputs.** `performance-requirements.md` supplies the binding NFR-001 thresholds and the segment breakdown this design realizes structurally; `security-requirements.md` fixes the fail-closed ordering whose measurable consequence is that denied paths cost less; `scalability-requirements.md` supplies the bounds (page sizes, option cardinality) that keep payloads fixed; `reliability-requirements.md` fixes the authoritative re-read that shapes command-path timing; `tech-stack-decisions.md` bounds what may be assumed about the runtime; and `business-logic-model.md` supplies the workflows being measured.

## Applied Design

### Fail-fast ordering

The pipeline is ordered edge → session → Identity decision → strict parse → provider call. A denied or Identity-unavailable request makes zero provider calls and must measure faster than an allowed one. Because U01 has no mutation path and no option port, this is the cleanest place in the intent to establish that property — the measurement is uncontaminated by domain work.

### Bounded payloads

The set list has no query surface at all, so its cost is fixed by provider enumeration. The record list is capped at 25, 50, or 100 rows with fixed provider order and no client filtering, sorting, or merging. Detail is one `getRecord` call. No layer holds an unbounded set at any point.

### Server-side authoritative reads

Reads run in server components; the browser receives rendered output with no refetch waterfall and no client store of provider truth. U01 has no draft state at all, so its client-side JavaScript surface is the smallest of the four units — which is itself the point: the skeleton proves the path with minimal client work in the measurement.

### Base-path asset resolution

Next `basePath=/reference-data` matches the Nginx prefix exactly, so assets resolve under `/reference-data/_next/*` without edge rewriting. This is a first-integration cost that U02, U03, and U04 inherit rather than re-derive; a mismatch surfaces as a readiness-time regression rather than an error, so it is verified live.

### Stable-size loading

Shape-stable skeletons sized to eventual content, so arrival causes no layout shift and a routine load does not steal focus.

## The Baseline U01 Establishes

Three costs are measured here once and referenced thereafter: the shared shell's render cost, the edge's per-request overhead under a canonical prefix, and one Identity decision's latency. Recording them separately rather than folding them into "render" is deliberate — when a later unit misses its target, comparing against these segments distinguishes a platform regression from a domain one.

This is guidance, not a gate: no unit's acceptance depends on another unit's numbers.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Response caching / cache tiers | Last-known facts require provider source and time; a cache becomes an unowned second truth | Application Design (no cache); FR-019, FR-020 |
| CDN | No public hosting; local Compose acceptance only | NFR-012 |
| Authorization caching | Every read evaluates Identity for the current request, including on refresh | FR-020 |
| Connection-pool tuning | Provider-owned; U01 changes no service runtime configuration | `tech-stack-decisions.md` |
| Query optimization / indexing | Reference-service and database concern; U01 changes no Java or SQL | U01 non-responsibilities |
| Async processing / queue offload | U01 is entirely synchronous and request-scoped | Application Design (no new topic) |
| Prefetching / speculative navigation | Would issue provider calls for records the user has not requested and cannot be pre-authorized for | FR-020 |
| Lazy loading / virtualization | Page sizes bounded at 100 rows; no measured need | `scalability-requirements.md` |
| Client-side route caching of provider data | Would make refresh serve remembered rather than re-authorized truth | FR-020, REL-U01-07 |

## Performance Budget Realization

`performance-requirements.md` fixes the two NFR-001 thresholds as binding with a non-binding segment breakdown; this design realizes those segments as the pipeline stages above. U01's budget is the simplest of the four by construction — no mutation, no option port, no per-item fan-out — which is exactly what makes it usable as the platform baseline.

## Verification

The warmed ten-user sample verifies the binding thresholds across all three routes. Denied and Identity-outage paths are sampled separately to confirm fail-fast ordering; a denied path that is not faster indicates a provider call before the policy decision — a correctness defect surfaced by measurement. Asset resolution under the base path is verified live on direct load and refresh. Per NFR-011, container startup or a single unmeasured request is never performance evidence.
