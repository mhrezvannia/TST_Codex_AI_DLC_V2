# Logical Components - U03 Charge Agreements Operational Uplift

## Source Alignment

Per the answered Q4, this artifact maps the components that **actually exist** in the approved topology, states each one's blast radius from evidence already established, and identifies genuine shared coupling. It is not a proposed future decomposition. It consumes `business-logic-model.md`, all four U03 NFR requirements artifacts, and `tech-stack-decisions.md`, and bridges into Infrastructure Design (3.4) by naming where each NFR pattern lands.

**Consumed inputs.** `business-logic-model.md` supplies the workflows each component carries; `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md` each supply the designed properties mapped onto components in the pattern table below; and `tech-stack-decisions.md` fixes which components are new versus inherited.

## Component Inventory

| # | Component | Owner | U03 responsibility | Failure domain |
| --- | --- | --- | --- | --- |
| C1 | Nginx public edge (`/charge-agreements*` location) | Platform/operations | Prefix routing, URI and asset preservation, trust-header clear and replace | Per-location; a Charge-location failure does not affect other prefixes |
| C2 | `apps/charge-agreements` route layer | Charge (U03) | Canonical routes, tab state, safe-return validation, render | Per-app process |
| C3 | Charge BFF | Charge (U03) | Policy call, strict parsing, status adaptation, paging conversion, outcome mapping, authoritative re-read | Same process as C2 |
| C4 | `ChargeReferenceOptionsPort` adapter | Charge (U03) | Bounded active-option lookup with service credential | Logical sub-component of C3; fails independently at the call level |
| C5 | Shared `PlatformShell` + route registry | W2-02 platform | Consumed, never forked | Shared across all four apps — see coupling below |
| C6 | Identity service | Identity | Current-request policy decisions | Cross-cutting; its failure closes every U03 route |
| C7 | Charge Agreement service + database | Charge service owner | Agreements, versions, rate bindings, lifecycle, history, manual cases | Provider-owned |
| C8 | Reference Data service + database | Reference owner | Canonical active options | Shared with U04's location port — see coupling |

U03 **adds** no component: C2, C3, and C4 are changes inside an existing deployable, and C1, C5, C6, C7, and C8 are consumed as they are.

## Failure Domains and Blast Radius

Each statement below traces to evidence already established upstream rather than to a hypothetical.

| Failing component | Blast radius | Evidence basis |
| --- | --- | --- |
| C1 edge (Charge location) | `/charge-agreements*` only; other module prefixes continue serving | Target-scoped edge failure, established by U01's route foundation |
| C2/C3 app process | All U03 routes; no other module | Separate Next.js deployable per domain |
| C4 option port | Labels and canonical-validation actions only; reads continue with raw authorized IDs | Region containment in `reliability-design.md` |
| C5 shared shell | **All four apps simultaneously** — the genuine cross-unit coupling | Single shared package consumed by every canonical app |
| C6 Identity | Every U03 route, fail-closed with zero provider calls | FR-020, SEC-U03-03 |
| C7 Charge service | U03 record and command paths; degrades to stale truth only if source and time are supplied | FR-019 |
| C8 Reference service | U03 labels **and** U04 capture validation — shared downstream | Two consumers of one provider |

## Shared Resources and Coupling

Three couplings are real and worth stating because they are the only ways a U03 failure escapes U03, or a non-U03 failure reaches it:

1. **The shared `@erp/ui` shell package (C5).** Every canonical app renders the same shell implementation. A defective shell release affects all four modules at once, and W4 owns none of it. This is the largest correlated-failure surface in the intent, and its rollback path is a W2-02 question this design cannot answer — recorded as an open question rather than assumed.
2. **The host-wide session cookie.** `Path=/` means one session serves every prefix. A session-layer defect is cross-module by construction.
3. **The Reference service (C8) serving two consumers.** U03's label resolution and U04's capture location validation both depend on it, with different consequences: U03 degrades to raw IDs, while U04 must disable capture. The same outage therefore produces different, correct behaviours in the two units — which is why the disable reasons are kept distinct.

Notably **not** shared: no database, no cache, no queue, no BFF state. U03 shares no mutable resource with any other unit, so there is no cross-unit data-corruption path.

## Where Each NFR Pattern Lands

The bridge into Infrastructure Design — which component carries which designed property:

| Pattern | Component | Note |
| --- | --- | --- |
| Trust-header sanitation | C1 | The only control; no second layer catches a header that slips through |
| Fail-closed policy ordering | C3 | Provider client reachable only past the policy branch |
| Strict query and body allow-lists | C3 | Zod strict schemas; reject rather than strip |
| Server-derived replay key | C3 | Existing `deriveReplayKey` seam, `FORWARD_DERIVED` |
| Capability-before-credential | C4 | The confused-deputy mitigation |
| Bounded cardinality (50 options) | C4 | Enforced at the adapter, not by the caller |
| Exhaustive outcome reduction | C3 | Compile-time exhaustiveness |
| Region containment | C2/C3 boundary | Independent resolution per seam |
| Authoritative re-read | C3 | The only path to confirmed success |

## Infrastructure Design Handoff

For stage 3.4, three items in this map need infrastructure expression and are named here so they are not rediscovered: the Charge Nginx location and its shared header-policy include (C1); the existing Charge service credential and correlation configuration used by C4; and the Compose service definitions and health checks for C2/C3. U03 requires **no** new infrastructure component, network, volume, or secret store.

## Verification

Component boundaries are verified by the architecture tests already required — no domain-app React imports, no second shell, no shared-component fork, no cross-service database access. Blast-radius claims are verified behaviourally on the Compose stack by failing one dependency at a time and observing that the stated radius holds. Per NFR-011 an unverified blast-radius claim is BLOCKED evidence, not a pass.
