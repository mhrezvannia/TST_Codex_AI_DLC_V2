# Shared Infrastructure - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

CONDITIONAL artifact, produced because the units genuinely share infrastructure. Per the answered Q4 it records the shared resources, their owners, the units depending on each, and the cross-unit failure effect.

**Consumed inputs.** `logical-components.md` supplies U04's shared-resource analysis and blast radius; `services.md` supplies the topology and the recorded event-control gap; `components.md` supplies the ownership map; `reliability-design.md` supplies per-dependency failure behaviour; `security-design.md` supplies the trust boundaries across shared paths; `performance-design.md` and `scalability-design.md` supply the properties shared resources must preserve; and `business-logic-model.md` supplies U04's dependencies.

U04 both **consumes** shared infrastructure and **adds to it** — its new Nginx location joins the shared edge, and its app joins the shared Compose project. That makes it the unit most able to damage the others through infrastructure.

## Shared Resource Register

| Resource | Owner | Units depending on it | U04's relationship | Failure effect on others |
| --- | --- | --- | --- | --- |
| `linercore-wave-a` Compose project and network | Platform/operations | All four | **Adds a service and an image to it** | A project-level failure takes down every unit; a misconfigured new service could destabilise the project |
| Nginx edge | Platform/operations | All four | **Adds a location** | A per-location failure is target-scoped; a malformed new location could break edge config for every prefix |
| Shared header-policy include **(does not exist yet)** | Platform/operations | All four | Inherits it on the new location | A defect in the include is a simultaneous security defect everywhere; U04's mount must *include* it, never re-author it |
| Host-wide session cookie (`Path=/`) | Platform (W2-02) | All four | Authenticates the new prefix | A session defect is cross-module by construction |
| Shared `@erp/ui` shell package and registry | W2-02 platform | All four | Consumed from first implementation; forks nothing | A defective release affects all four apps at once — the largest correlated-failure surface |
| Identity service | Identity | All four | **Requires two new capabilities registered** | Outage closes all units fail-closed; U04's capabilities are unregistered today, so U04 alone is blocked until they exist |
| Reference Data service | Reference | U01, U02 (provider), U03 (labels), U04 (capture locations) | Bounded location port | One outage, different correct behaviours: U03 raw IDs; U04 additionally disables capture |
| `apps/shell` deployable | Platform + Booking composition owner | All (home, Booking) | **Hosts U04's Booking relationship adapter** | A defect in U04's adapter degrades the Booking page — a U04 defect surfacing in a platform-owned deployable |
| Existing Kafka topics and listeners | Platform / service owners | U04 (and Booking's projection) | Consumes; changes nothing | Unowned poison/replay gap; a blocked partition affects Booking's projected evidence only |

### Verified current state of the shared edge

The shared header-policy include is an **approved design that is not yet built**. `infrastructure/nginx/default.conf` today sets four headers (`Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Correlation-Id`) on each location, clears none, and has no include. Introducing it is a platform delta recorded in U01 and U04 `deployment-architecture.md`.

This matters for a shared-resource register specifically: until the include exists, each location carries its own header lines, so the property that a new mount inherits sanitation by construction is a **goal of this work**, not a protection currently in force.

## Access Boundaries

- **The edge**: platform configures it. U04's location is added by platform with the shared include; the domain app does not author edge rules and cannot alter the header policy.
- **The shell package**: consumed as a published API. CMM composes domain UI over it and may not fork, re-theme, or copy a primitive out. A missing primitive escalates to W2-02 as BLOCKED.
- **The session**: read, never minted or extended.
- **`apps/shell`**: U04 adds only the Booking relationship adapter beside the canonical page, using the shell's Booking client. It does not move Booking ownership, add unrelated routes, or alter shell composition.
- **The internal CMM service**: reachable only from inside the network. No edge location routes to it, and the v1 contract is not browser-callable.
- **Kafka**: consumed as-is. U04 adds no topic, no consumer group, and no listener configuration change.
- **Identity**: called per request; no decision cached or shared between units.

## What Is Not Shared

No database, no cache, no message queue of U04's own, no BFF state, no session store, no file volume. U04 shares **no mutable data resource** with any other unit — so there is no cross-unit data-corruption path. The sharing is read-only platform surfaces, provider contracts, and now one additional edge location and Compose service.

## Two Cross-Unit Risks U04 Introduces

Worth stating plainly, because they are the price of being the unit that adds infrastructure:

1. **A malformed Nginx location can break the shared edge.** Every other prefix depends on the same edge process. The mitigation is that the location uses the shared include and is verified by the route matrix and target-scoped-failure checks before merge — a new mount is exactly where an over-broad or syntactically fragile rule enters.
2. **A defect in the Booking relationship adapter surfaces inside `apps/shell`.** U04's code runs in the platform owner's deployable, so its failures appear on the Booking page rather than on a CMM route. The mitigation is region containment — the relationship region fails independently with its own Retry, leaving the Booking page intact.

## The Unowned Gap in Shared Topology

The existing Kafka topics and listeners have no error handler, bounded retry, dead-letter topic, poison ledger, or replay contract. U04 depends on this path for Booking's projected movement evidence and does not close the gap: adding a DLQ here would create a control nobody owns and nothing verifies.

Blast radius, from verified configuration: a poison record can repeatedly block its partition; other partitions, CMM's persisted Journey truth, synchronous module reads, and the direct Booking-to-Journey lookup remain available and correct. **This remains a hard completion condition — U04 and W4-01 are not done while it is open**, and no infrastructure U04 adds changes that.

## Verification

Shared-resource claims are verified by failing one shared dependency at a time on the Compose stack and observing the recorded effect across units — including a Reference outage producing U03's raw-ID degradation and U04's capture disablement in the same run, and a blocked partition leaving CMM truth intact. Edge safety is verified by the route matrix plus an architecture test asserting the internal CMM service is not externally routable. Access boundaries are verified by build-failing architecture tests. Per NFR-011, an unverified coupling claim is BLOCKED evidence, not a pass.
