# Performance Design - U02 Reference Data Operational Completion

## Source Alignment

This design realizes U02's `performance-requirements.md` targets using the completed read, create, update, and recovery workflows in `business-logic-model.md`, within the constraints in `tech-stack-decisions.md`, `scalability-requirements.md`, `security-requirements.md`, and `reliability-requirements.md`. Per Q3, **non-cache optimizations only**; per Q1, non-applicable catalogue patterns are recorded with reasons.

U02 inherits U01's proven platform path, so its performance design is narrower: what is new is command latency and the authoritative re-read.

**Consumed inputs.** `performance-requirements.md` supplies the binding NFR-001 thresholds and the segment breakdown this design realizes structurally; `security-requirements.md` fixes the fail-closed ordering whose measurable consequence is that denied paths cost less; `scalability-requirements.md` supplies the bounds (page sizes, option cardinality) that keep payloads fixed; `reliability-requirements.md` fixes the authoritative re-read that shapes command-path timing; `tech-stack-decisions.md` bounds what may be assumed about the runtime; and `business-logic-model.md` supplies the workflows being measured.

## Applied Design

### Fail-fast ordering, per operation

The read pipeline is inherited from U01. What U02 adds is that **each command re-enters it independently**: create and update each perform their own current-request authorization before any provider access, so an unauthorized command costs a policy call and nothing more. Denied and Identity-outage paths make zero provider calls and must measure faster than the allowed path.

### Compile-time form catalog

`ReferenceFormCatalogV1` is build-time data, not a runtime schema fetch. Form derivation is therefore pure computation with no I/O, and it does not scale with set size. This is the direct performance consequence of removing the proposed runtime field-schema endpoint: the design that is easier to reason about is also the one with no per-request round trip.

An outsized share of time in form derivation would indicate the catalog is being rebuilt per request rather than reused — a measurable signal of a specific defect.

### Bounded payloads

Record list capped at 25/50/100 with fixed provider order and no client filtering, sorting, or merging. Canonical selectors (TRADE_LANE, VESSEL_VOYAGE) use existing bounded record-list reads rather than unbounded option fetches, so a selector cannot become the page's dominant cost.

### Server-side authoritative reads, client-side draft only

Reads run in server components. The client holds only draft values, dirty and pending flags, field issues, dialog state, and focus — never provider truth. There is no client store to hydrate and no refetch waterfall.

### Scoped history retrieval

History is a facet of the detail read whose failure is contained to its own panel. The performance consequence is that a slow or failing history must not delay Summary and Attributes — the panel resolves and degrades on its own.

### Command-path shape

A command costs **provider write plus authoritative re-read**, deliberately (BR2-036). Confirmed success is not claimed until `getRecord` returns. This is a correctness-over-latency trade recorded so it is not later "optimized" into rendering the submitted draft as truth — which would break the no-false-success rule the entire outcome model depends on.

Two related shapes: the unknown-outcome path adds an exact-ID re-read before any retry and must not be made automatic to save time; and duplicate-submit prevention is a client-boundary guard that costs nothing at the provider — a second provider request under rapid double-click is a correctness failure, not a latency one.

## Deliberately Not Used

| Catalogue pattern | Why it does not apply here | Forecloses it |
| --- | --- | --- |
| Response caching / cache tiers | Last-known facts require provider source and time; a cache becomes an unowned second truth | Application Design (no cache); FR-019, FR-020 |
| Runtime schema endpoint with caching | Removed by design in favour of compile-time catalogs; caching a schema that does not exist at runtime is moot | U02 functional design |
| CDN | No public hosting; local Compose acceptance only | NFR-012 |
| Authorization caching | Read, create, and update each require a current-request decision | FR-020, BR2-001 |
| Optimistic UI update on submit | Would render submitted input as provider truth before the re-read | BR2-036, NFR-005 |
| Debounced auto-save | Would issue unauthorized-at-the-time writes and multiply provider commands | BR2-034, FR-020 |
| Connection-pool tuning | Provider-owned; U02 changes no service runtime configuration | `tech-stack-decisions.md` |
| Query optimization / indexing | Reference-service and database concern | U02 non-responsibilities |
| Prefetching / speculative reads | Would issue provider calls for records not requested and not pre-authorizable | FR-020 |
| Client-side draft persistence | Would survive a session and a permission change; drafts are transient by design | `business-rules.md` persistence boundary |

## Performance Budget Realization

`performance-requirements.md` fixes NFR-001's thresholds as binding with a non-binding segment breakdown, and explicitly does not re-derive the platform baseline U01 established. This design realizes the remaining segments — policy, provider read, history facet, catalog derivation, adaptation — as the pipeline stages above, so an over-budget run attributes to a named stage.

## Verification

The warmed ten-user sample verifies the binding thresholds across list, detail, and the create/edit route renders. Denied and Identity-outage paths are sampled separately. Catalog derivation is verified as computation rather than I/O. History facet independence is verified behaviourally — a deliberately slowed history fixture must not delay Summary. Per NFR-011, a single unmeasured request or a screenshot is never performance evidence.
