# NFR Design Questions - W4-01 (stage group: all four units)

## Source and Authority Alignment

This question set consumes each unit's `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, and `tech-stack-decisions.md` from NFR Requirements, plus each unit's `business-logic-model.md` from Functional Design and the approved Application Design.

**On why one question set covers four units.** This is a conductor judgment call, not a protocol entitlement — the same correction recorded at NFR Requirements applies. The questions below decide *which NFR patterns apply to this project at all*, and that decision is project-wide: the same stack, the same local-Compose boundary, and the same prohibition on new persistence bind every unit. Per-unit design differences are expressed in the artifacts, not re-decided here. Each unit's directory records the same answered file so per-unit traceability is preserved.

## The Central Tension

The stage definition's focus areas list the standard enterprise NFR pattern catalogue: circuit breakers, bulkheads, caching tiers, CDN usage, horizontal/vertical scaling, auto-scaling rules, data partitioning and sharding, queue-based decoupling, connection pooling, data replication, and failover.

Most of these are **forbidden or inapplicable** here, and inventing them would contradict approved artifacts rather than satisfy them:

- `requirements.md` NFR-012 bounds acceptance to the isolated local `linercore-wave-a` Compose project and forbids production hosting, availability, backup, recovery, and cloud claims.
- NFR-009 forbids a local theme, shell, or shared-component fork and any universal migration.
- The approved Application Design adds **no cache, no BFF persistence, no database, no Kafka topic, and no AWS resource**; last-known facts require provider source and time, and authorization is never cached.
- The 3.2 answers fixed scalability as local acceptance capacity only, with no projection, autoscaling, or capacity plan.

So the real design question is not "which patterns do we adopt" but "which of the catalogue genuinely applies, and what do we record for the rest".

## Questions

### Q1. How should the artifacts treat the inapplicable pattern catalogue?

A. Design only the patterns this system actually uses, and record each non-applicable catalogue pattern explicitly with the reason it does not apply and the approved artifact that forecloses it — so a later reader sees a deliberate decision rather than an oversight, and cannot mistake absence for something forgotten (recommended)
B. Omit non-applicable patterns silently
C. Design the full catalogue anyway so the artifacts look complete
D. Mark every non-applicable pattern as a future enhancement
X. Other (please specify)

[Answer]: A - Design only applicable patterns; record each non-applicable catalogue pattern with its reason and the artifact that forecloses it (Recommended) - 2026-08-11T08:27:14Z - **Mode:** guided - User response: `A. Design real, record the rest (Rec)`

### Q2. What resilience pattern applies given fail-closed authorization and no cache?

A. Design the resilience that is actually present: fail-closed authorization ordering (policy before provider), typed exhaustive outcome unions, region-scoped failure containment, provider-owned idempotency for safe explicit retry, and user-triggered scoped retry — and explicitly record that circuit breakers, bulkheads, automatic retry with backoff, and fallback-to-cache are NOT used, because automatic retry contradicts the approved no-silent-advance rule and any cache contradicts the no-cached-truth and no-cached-authorization rules (recommended)
B. Add circuit breakers and automatic retry with exponential backoff
C. Add a fallback cache for provider outages
D. Add a bulkhead thread-pool isolation layer per provider
X. Other (please specify)

[Answer]: A - Design the resilience actually present; explicitly exclude circuit breakers, bulkheads, automatic backoff retry, and fallback cache (Recommended) - 2026-08-11T08:27:14Z - **Mode:** guided - User response: `A. Design what's actually there (Rec)`

### Q3. What performance design applies given caching is forbidden?

A. Design non-cache optimizations only: fail-fast ordering so denied and outage paths cost less than the allowed path, bounded payloads through provider paging and the option-cardinality cap, server-side rendering of authoritative reads so no client refetch waterfall exists, per-region independent resolution so a slow dependency does not serialize the page, and stable-size skeletons that avoid layout thrash — and record that response caching, CDN, connection-pool tuning, and query optimization are provider-owned or forbidden (recommended)
B. Introduce a BFF response cache with short TTL
C. Add a CDN tier in front of the apps
D. Defer all performance design to Operation
X. Other (please specify)

[Answer]: A - Non-cache optimizations only; record caching/CDN/pool-tuning as provider-owned or forbidden (Recommended) - 2026-08-11T08:27:14Z - **Mode:** guided - User response: `A. Non-cache optimizations only (Rec)`

### Q4. How should `logical-components.md` define failure domains and blast radius?

A. Map the components that actually exist in the approved topology — the edge, each canonical app and its BFF, Identity, each owning provider service and its database, and for U04 the async event path — and state each one's blast radius from evidence already established (target-scoped edge failure, per-region containment, fail-closed policy, and the poison-record partition-blocking behaviour), identifying shared resources (the shared shell package, the host-wide session, the Reference provider serving two consumers) as the genuine cross-unit coupling points (recommended)
B. Define logical components as a proposed future microservice decomposition
C. Map only the frontend components
D. Defer failure-domain analysis to Infrastructure Design
X. Other (please specify)

[Answer]: A - Map the real approved topology, its blast radius from established evidence, and the genuine shared coupling points (Recommended) - 2026-08-11T08:27:14Z - **Mode:** guided - User response: `A. Map the real topology (Rec)`

## Ambiguity Analysis Placeholder

After answers are recorded, they will be checked against each unit's NFR Requirements artifacts, the approved Application Design's no-cache/no-new-persistence boundary, NFR-009 and NFR-012, and the recorded poison/replay blocker. An answer that introduces a pattern the approved artifacts forbid must be resolved before generating the five per-unit artifacts.
