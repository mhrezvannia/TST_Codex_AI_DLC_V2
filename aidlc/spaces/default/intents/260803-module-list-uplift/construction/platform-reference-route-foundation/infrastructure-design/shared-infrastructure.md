# Shared Infrastructure - U01 Platform and Reference Route Foundation

## Source Alignment

CONDITIONAL artifact, produced because the units genuinely share infrastructure. Per the answered Q4 it records the shared resources, their owners, the units depending on each, and the cross-unit failure effect.

**Consumed inputs.** `logical-components.md` supplies U01's shared-resource analysis and blast radius; `services.md` supplies the topology and the known event-control gap; `components.md` supplies the ownership map; `reliability-design.md` supplies per-dependency failure behaviour; `security-design.md` supplies the trust boundaries across shared paths; `performance-design.md` and `scalability-design.md` supply the properties a shared resource must preserve; and `business-logic-model.md` supplies U01's dependencies.

U01 is the unit that **first exercises** every shared resource, so the register below is observed rather than assumed — that is the walking skeleton's infrastructure contribution.

## Shared Resource Register

| Resource | Owner | Units depending on it | U01's dependency | Failure effect on others |
| --- | --- | --- | --- | --- |
| `linercore-wave-a` Compose project and network | Platform/operations | All four | Runs the Reference app and reaches Reference and Identity | A project-level failure takes down every unit; it is the acceptance boundary itself |
| Nginx edge (single instance) | Platform/operations | All four | Serves `/reference-data*` | A per-location failure is target-scoped — **first proven by U01**; an edge-process failure affects all prefixes |
| Shared header-policy include **(does not exist yet)** | Platform/operations | All four | Applied to the Reference location | A defect in the include is a simultaneous security defect in every module |
| Host-wide session cookie (`Path=/`) | Platform (W2-02) | All four | Authenticates every U01 route | A session-layer defect is cross-module by construction |
| Shared `@erp/ui` shell package and route registry | W2-02 platform | All four | **First consumer** — replaces Reference's local shell composition | A defective release affects all four apps at once; the largest correlated-failure surface in the intent |
| Identity service | Identity | All four | Every read decision | Outage closes every unit's routes fail-closed, simultaneously |
| Reference Data service | Reference | U01, U02 (as provider), U03 (labels), U04 (capture locations) | **U01 is its first W4 consumer** | One outage, different correct behaviours per consumer: U01/U02 provider error or stale; U03 raw IDs; U04 additionally disables capture |
| Existing Kafka topics and listeners | Platform / service owners | U04 only | **None** — U01 is entirely synchronous | Not a U01 dependency; recorded because it is shared topology with an unowned gap |

### Verified current state of the shared edge

The shared header-policy include is an **approved design that is not yet built**. `infrastructure/nginx/default.conf` today sets four headers (`Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Correlation-Id`) on each location, clears none, and has no include. Introducing it is a platform delta recorded in U01 and U04 `deployment-architecture.md`.

This matters for a shared-resource register specifically: until the include exists, each location carries its own header lines, so the property that a new mount inherits sanitation by construction is a **goal of this work**, not a protection currently in force.

## Access Boundaries

- **The shell package** is consumed as a published API. U01 composes domain UI over it and may not fork, re-theme, or copy a primitive out. If the shared contract cannot carry session, visible routes, active module, breadcrumbs, and children, U01 stays **BLOCKED** rather than shipping a compatibility shim — the single most consequential access rule in the intent, because a shim would be indistinguishable from a fork once merged.
- **The session** is read, never minted or extended by a domain app.
- **The edge** is configured by platform; U01 does not author locations or alter the header include.
- **The Reference service** is reached only through its HTTP contract. No app import, no shared SQL, no shared cache.
- **Identity** is called per request; no decision is cached or shared between units.

## What Is Not Shared

No database, no cache, no message queue, no BFF state, no session store, no file volume. U01 shares **no mutable resource** with any other unit, so there is no cross-unit data-corruption path. Sharing is limited to read-only platform surfaces and provider contracts.

## What U01 Establishes for the Others

Three shared-infrastructure facts are observed here first and relied on thereafter: that a per-location edge failure is target-scoped; that the shared shell package renders correctly for a domain app that previously had its own composition; and that one Identity decision per request is achievable within the p95 target. A later unit that finds any of these untrue has found a platform regression, not a new constraint.

## The Unowned Gap in Shared Topology

The existing Kafka topics and listeners have no configured error handler, bounded retry, dead-letter topic, poison ledger, or replay contract. U01 does not depend on them and is unaffected.

It is recorded here anyway so a reader of U01's infrastructure does not conclude the intent's messaging is unproblematic. The gap belongs to U04 and the platform owners, and it is a hard completion condition for W4-01 as a whole — which includes U01's release, since the intent closes only when all four units integrate.

## Verification

Shared-resource claims are verified by failing one shared dependency at a time on the Compose stack and observing the recorded effect across units — U01 is where that matrix is first run. Access boundaries are verified by the architecture tests U01 installs, which fail the build rather than a request. Per NFR-011, an unverified coupling claim is BLOCKED evidence, not a pass.
