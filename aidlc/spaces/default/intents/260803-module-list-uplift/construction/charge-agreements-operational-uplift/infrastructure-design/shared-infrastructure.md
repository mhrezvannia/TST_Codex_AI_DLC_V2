# Shared Infrastructure - U03 Charge Agreements Operational Uplift

## Source Alignment

This artifact is CONDITIONAL — produced when multiple units share infrastructure resources. Per the answered Q4 they genuinely do, so it is produced. It records the shared resources, who owns each, which units depend on it, and what its failure does to the others.

**Consumed inputs.** `logical-components.md` supplies U03's shared-resource analysis and blast radius; `services.md` supplies the topology and the known event-control gap; `components.md` supplies the ownership map; `reliability-design.md` supplies the per-dependency failure behaviour; `security-design.md` supplies the trust boundaries across shared paths; `performance-design.md` and `scalability-design.md` supply the properties a shared resource must preserve; and `business-logic-model.md` supplies U03's actual dependencies.

## Shared Resource Register

| Resource | Owner | Units depending on it | U03's dependency | Failure effect on others |
| --- | --- | --- | --- | --- |
| `linercore-wave-a` Compose project and network | Platform/operations | U01, U02, U03, U04 | Runs the Charge app and reaches Charge, Reference, and Identity | Project-level failure takes down every unit; this is the acceptance boundary itself |
| Nginx edge (single instance) | Platform/operations | All | Serves `/charge-agreements*` | A per-location failure is target-scoped; an edge-process failure affects all prefixes |
| Shared header-policy include **(does not exist yet)** | Platform/operations | All | Applied to the Charge location | A defect in the include is a simultaneous security defect in every module |
| Host-wide session cookie (`Path=/`) | Platform (W2-02) | All | Authenticates every U03 route | A session-layer defect is cross-module by construction |
| Shared `@erp/ui` shell package and route registry | W2-02 platform | All | Rendered at the Charge root; Charge forks nothing | A defective release affects all four apps at once — the largest correlated-failure surface in the intent |
| Identity service | Identity | All | Every read and command decision | Outage closes every unit's routes fail-closed, simultaneously |
| Reference Data service | Reference | U01, U02 (as their provider), U03 (labels), U04 (capture locations) | Bounded option lookup | One outage, different correct behaviours: U03 degrades to raw IDs; U04 additionally disables capture |
| Existing Kafka topics and listeners | Platform / service owners | U04 only | **None** — U03 is entirely synchronous | Not a U03 dependency; recorded because it is shared topology with an unowned gap |

### Verified current state of the shared edge

The shared header-policy include is an **approved design that is not yet built**. `infrastructure/nginx/default.conf` today sets four headers (`Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Correlation-Id`) on each location, clears none, and has no include. Introducing it is a platform delta recorded in U01 and U04 `deployment-architecture.md`.

This matters for a shared-resource register specifically: until the include exists, each location carries its own header lines, so the property that a new mount inherits sanitation by construction is a **goal of this work**, not a protection currently in force.

## Access Boundaries

Each shared resource is consumed through exactly one sanctioned path, and the prohibitions are what keep sharing from becoming coupling:

- **The shell package** is consumed as a published package API. Charge may compose domain UI over it; it may not fork it, re-theme it, or copy a primitive out of it. A missing primitive is escalated to W2-02 as a BLOCKED dependency.
- **The session** is read, never minted or extended by a domain app.
- **The edge** is configured by platform. Charge does not add a location or alter the header include.
- **The Reference service** is reached only through the bounded option port with a service credential gated behind the current request's Charge capability. No app import, no shared SQL, no shared cache.
- **Identity** is called per request. No decision is cached or shared between units, so no unit can benefit from another's authorization.

## What Is Not Shared

No database, no cache, no message queue, no BFF state, no session store, no file volume. U03 shares **no mutable resource** with any other unit — which is why there is no cross-unit data-corruption path, and why a U03 defect cannot silently damage U01, U02, or U04. Sharing here is limited to read-only platform surfaces and provider contracts.

## The Unowned Gap in Shared Topology

The existing Kafka topics and their listeners are shared topology with no configured error handler, bounded retry, dead-letter topic, poison ledger, or replay contract. U03 does not depend on them and is unaffected by their state.

It is recorded in this register anyway, for one reason: a reader of U03's infrastructure could otherwise conclude the intent's messaging is unproblematic because U03 never touches it. The gap is real, it belongs to U04 and the platform owners, and it is a hard completion condition for the intent as a whole — including for U03's release, since W4-01 closes only when all four units integrate.

## Verification

Shared-resource claims are verified by failing one shared dependency at a time on the Compose stack and observing the recorded effect across units — particularly that a Reference outage produces U03's raw-ID degradation and U04's capture disablement in the same run. Access boundaries are verified by architecture tests (no fork, no cross-app import, no cross-service DB access) that fail the build rather than a request. Per NFR-011, an unverified coupling claim is BLOCKED evidence, not a pass.
