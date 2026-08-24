# Logical Components - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

Per the answered Q4, this maps the components that **actually exist** in the approved topology plus the ones U04 adds, states blast radius from established evidence, and identifies genuine shared coupling. It consumes `business-logic-model.md`, all four U04 NFR requirements artifacts, and `tech-stack-decisions.md`, and bridges into Infrastructure Design (3.4).

U04 is the only unit that adds components, so this inventory is the largest of the four — and the handoff to 3.4 is correspondingly the most substantial.

**Consumed inputs.** `business-logic-model.md` supplies the workflows each component carries; `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md` each supply the designed properties mapped onto components in the pattern table below; and `tech-stack-decisions.md` fixes which components are new versus inherited.

## Component Inventory

| # | Component | Owner | New in W4? | U04 responsibility | Failure domain |
| --- | --- | --- | --- | --- | --- |
| C1 | Nginx `/container-movement*` location | Platform/operations | **New mount** | Prefix routing, URI and asset preservation, trust-header policy | Per-location |
| C2 | `apps/container-movement` route layer | Container Movement (U04) | **New deployable** | Recent/detail/capture routes, shared shell root layout | Per-app process |
| C3 | CMM BFF | Container Movement (U04) | **New** | Policy calls, assertion issuance, attempt-token issue/verify, view models, outcome mapping | Same process as C2 |
| C4 | `CmmReferenceLocationsPort` adapter | Container Movement (U04) | **New (additive contract)** | Bounded active-location lookup | Logical sub-component of C3 |
| C5 | CMM app container image + Compose service + health check | Platform/operations | **New** | Runtime packaging, base-path-aware `/api/health` | Per-container |
| C6 | CMM v2 controller + assertion adapter | CMM service owner | **New (additive contract)** | Media negotiation, assertion verification, subject mapping | Inside existing service |
| C7 | CMM `timelineV1` normalizer | CMM service owner | **New** | Deterministic expected/accepted sequence | Inside existing service |
| C8 | Shell Booking relationship adapter | Platform + Booking composition owner | **New** | Authorized exact-`bookingId` lookup beside the canonical Booking page | Inside `apps/shell` |
| C9 | Shared `PlatformShell` + registry | W2-02 platform | Consumed | Rendered from first implementation | Shared across all apps |
| C10 | Identity service | Identity | Consumed (2 new capabilities) | Current-request decisions | Cross-cutting |
| C11 | CMM service + database | CMM owner | Consumed | Journeys, history, idempotency receipts, outbox | Provider-owned |
| C12 | Reference service + database | Reference owner | Consumed | Active locations | Shared with U03 |
| C13 | Booking service + database | Booking owner | Consumed | Booking truth, movement projection | Provider-owned |
| C14 | Kafka + existing topics | Platform | Consumed, unchanged | Existing choreography | **Known gap — see below** |

## Failure Domains and Blast Radius

| Failing component | Blast radius | Evidence basis |
| --- | --- | --- |
| C1 mount | `/container-movement*` only; other prefixes serve | Target-scoped edge failure, established by U01 |
| C2/C3/C5 app or container | All U04 routes; `/booking/[bookingId]` still renders, its relationship region degrading | Separate deployable; C8 lives in `apps/shell` |
| C4 location port | Labels, and capture's second gate | Region containment in `reliability-design.md` |
| C6 assertion verification / key | All v2 calls, fail closed — no fallback to v1 or default JSON | SEC-U04-08, SEC-U04-11 |
| C7 normalizer | Timeline content within the detail read; shares Summary's result | BR4-073 |
| C8 Booking adapter | The Booking page's relationship region only | Four distinct relationship outcomes |
| C9 shared shell | **All four apps simultaneously** | Single shared package |
| C10 Identity | Every U04 route and capture, fail-closed | FR-020 |
| C11 CMM service | Journey reads and capture | FR-019 |
| C12 Reference service | U04 capture validation **and** U03 labels | Two consumers |
| C13 Booking service | Booking page and its projection | Provider-owned |
| C14 Kafka partition (poison record) | Booking's projected movement evidence only | Verified listener configuration; CMM truth and synchronous reads unaffected |

## Shared Resources and Coupling

1. **The shared `@erp/ui` shell package (C9).** U04 consumes it from first implementation. A defective shell release affects all four modules at once; W4 owns none of it. Largest correlated-failure surface in the intent.
2. **The host-wide session cookie.** `Path=/` spans every prefix, including the new one.
3. **The Reference service (C12), shared with U03.** One outage, two correct-but-different behaviours: U03 degrades to raw IDs, U04 additionally disables capture. This is why the disable reasons are kept distinct.
4. **`apps/shell` hosts C8.** U04's Booking-side work lives inside the platform owner's deployable, so a defect there affects the Booking page rather than the CMM app — a coupling that exists because canonical Booking ownership deliberately did not move.
5. **Kafka (C14) with no poison handling.** Not a resource U04 shares by choice; it is the pre-existing coupling between CMM and Booking projection, and its missing controls are the intent's hard blocker.

Not shared: no database, no cache, no BFF state, no new topic. There is no cross-unit data-corruption path.

## Where Each NFR Pattern Lands

| Pattern | Component |
| --- | --- |
| Trust-header sanitation | C1 |
| Base-path asset resolution | C1 + C2 |
| Fail-closed policy ordering (read, then capture) | C3 |
| Subject-assertion issuance | C3; verification at C6 |
| Attempt-token issue / verify / replace / retain | C3 |
| Strict allow-lists (`limit`, capture body) | C3 |
| Capability-before-credential | C4 |
| Bounded cardinality (50 locations) | C4 |
| Provider-owned timeline computation | C7 |
| Exhaustive outcome reduction | C3 |
| Authoritative re-read | C3 |
| Origin-token issue / verify | C3 and C8 (both directions) |
| Four-truths separation | C3 rendering; C11/C13/C14 evidence |

## Infrastructure Design Handoff

U04 is the only unit requiring new infrastructure, and 3.4 must express all of it:

1. **New Nginx location** `/container-movement*` with the shared header-policy include (C1).
2. **New Compose service** for the CMM app image, with internal service URL wiring and a base-path-aware health check (C5).
3. **Assertion key material** for C6 — a dedicated CMM key, distinct from the Charge key, provisioned in the Compose topology.
4. **Internal CMM service URL** reachable by C3 but **not** exposed through Nginx.
5. **No** new database, volume, topic, cache, or AWS resource.

Also carried forward, unresolved rather than designed: the poison/bounded-retry/DLQ/replay ownership for C14, and Identity registration of the two capabilities for C10. Neither is W4's to build.

## Verification

Component boundaries are verified by architecture tests — no domain-app React imports, no second shell, no shared-component fork, no cross-service database access, no direct external route to the internal service. Blast-radius claims are verified behaviourally by failing one dependency at a time on the Compose stack, including a blocked-partition scenario. Per NFR-011 an unverified blast-radius claim is BLOCKED evidence, not a pass.
