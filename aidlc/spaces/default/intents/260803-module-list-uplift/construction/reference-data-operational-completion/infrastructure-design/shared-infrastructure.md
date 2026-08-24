# Shared Infrastructure - U02 Reference Data Operational Completion

## Source Alignment

CONDITIONAL artifact, produced because the units genuinely share infrastructure. Per the answered Q4 it records the shared resources, their owners, the units depending on each, and the cross-unit failure effect.

**Consumed inputs.** `logical-components.md` supplies U02's shared-resource analysis including the build-time coupling; `services.md` supplies the topology and known event-control gap; `components.md` supplies the ownership map; `reliability-design.md` supplies per-dependency failure behaviour; `security-design.md` supplies the trust boundaries; `performance-design.md` and `scalability-design.md` supply the properties shared resources must preserve; and `business-logic-model.md` supplies U02's dependencies.

## Shared Resource Register

| Resource | Owner | Units depending on it | U02's dependency | Failure effect on others |
| --- | --- | --- | --- | --- |
| `linercore-wave-a` Compose project and network | Platform/operations | All four | Runs the Reference app and reaches Reference and Identity | Project-level failure takes down every unit |
| Nginx edge (single instance) | Platform/operations | All four | Serves `/reference-data*`, including the new child routes | Per-location failure is target-scoped; edge-process failure affects all prefixes |
| Shared header-policy include **(does not exist yet)** | Platform/operations | All four | Applied to the Reference location | A defect in the include is a simultaneous security defect everywhere |
| Host-wide session cookie (`Path=/`) | Platform (W2-02) | All four | Authenticates every read and command | A session-layer defect is cross-module by construction |
| Shared `@erp/ui` shell package and registry | W2-02 platform | All four | Consumed; U02 additionally depends on the **form primitives** (Field, Input, Select, Combobox, Dialog) | A defective release affects all four apps; a missing form primitive blocks U02's mutation surface specifically |
| Identity service | Identity | All four | Read, create, and update decisions | Outage closes every unit fail-closed, simultaneously |
| Reference Data service | Reference | U01, U02 (as provider), U03 (labels), U04 (capture locations) | **U02 is its heaviest consumer** — reads and commands | One outage, different correct behaviours: U01/U02 provider error or stale; U03 raw IDs; U04 additionally disables capture |
| **Catalog producer/consumer fixture** | Reference (U02) + Reference service owner | U02 only | **New CI coupling U02 introduces** | Couples two build pipelines; drift blocks release rather than affecting a request |
| Existing Kafka topics and listeners | Platform / service owners | U04 only | **None** — U02 is entirely synchronous | Not a U02 dependency; recorded as shared topology with an unowned gap |

## The Coupling U02 Introduces

U02 is the only unit that adds a shared coupling of its own, and it is deliberately a **build-time** one. The V1 catalogs are two implementations in two languages; the fixture is the contract between them. That makes the frontend's build and the Reference service's build mutually dependent for correctness — a real coupling, but one whose failure mode is a blocked release rather than a broken request.

Recorded here rather than only in `cicd-pipeline.md` because it is a cross-repository ownership fact: the Reference service owner must accept the fixture as a blocking gate on their side, or the coupling is one-sided and drift ships.

### Verified current state of the shared edge

The shared header-policy include is an **approved design that is not yet built**. `infrastructure/nginx/default.conf` today sets four headers (`Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Correlation-Id`) on each location, clears none, and has no include. Introducing it is a platform delta recorded in U01 and U04 `deployment-architecture.md`.

This matters for a shared-resource register specifically: until the include exists, each location carries its own header lines, so the property that a new mount inherits sanitation by construction is a **goal of this work**, not a protection currently in force.

## Access Boundaries

- **The shell package** is consumed as a published API, including its form primitives. U02 may not fork, re-theme, or copy a primitive out; a missing one is escalated to W2-02 as BLOCKED.
- **The session** is read, never minted or extended.
- **The edge** is configured by platform; U02's new child routes need no edge change and U02 does not author locations.
- **The Reference service** is reached only through its HTTP contract, including for writes. No shared SQL, no direct database access, no shared cache.
- **Identity** is called per request and per command; no decision is cached or shared.

## What Is Not Shared

No database, no cache, no message queue, no BFF state, no draft store, no session store, no file volume. U02 shares **no mutable runtime resource** with any other unit — so there is no cross-unit data-corruption path, and the create attempt ID is a provider record identity rather than shared state.

## The Unowned Gap in Shared Topology

The existing Kafka topics and listeners have no configured error handler, bounded retry, dead-letter topic, poison ledger, or replay contract. U02 does not depend on them and is unaffected.

Recorded so a reader of U02's infrastructure does not conclude the intent's messaging is unproblematic. The gap belongs to U04 and the platform owners and is a hard completion condition for W4-01 as a whole — which includes U02's release, since the intent closes only when all four units integrate.

## Verification

Shared-resource claims are verified by failing one shared dependency at a time on the Compose stack and observing the recorded effect across units. The build-time coupling is verified by introducing a deliberate catalog divergence and confirming **both** pipelines block. Access boundaries are verified by build-failing architecture tests. Per NFR-011, an unverified coupling claim is BLOCKED evidence, not a pass.
