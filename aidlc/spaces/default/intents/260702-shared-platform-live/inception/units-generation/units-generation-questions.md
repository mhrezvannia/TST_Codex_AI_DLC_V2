# Units Generation Questions - Shared Platform Local Functionality

## Context

This decomposition plan consumes `components`, `component-methods`, `services`, `component-dependency`, `decisions`, `requirements`, and `stories`. Answers are inferred from approved artifacts and are topology-focused only; Delivery Planning chooses the economic Bolt sequence later.

## Questions and Answers

### Q1. What unit boundary strategy should be used?

A. One unit per source file.
B. Unit boundaries by coherent component capability across app, BFF, service, data, event, seed, contract, and readiness surfaces.
C. One unit for the entire platform.
D. One unit per downstream module.
E. One unit per visual screen only.
X. Other (please specify)

[Answer]: B - `components`, `component-methods`, `services`, and `component-dependency` define capability boundaries that can be independently tested without collapsing the whole platform into one unit.

### Q2. What granularity is appropriate?

A. Very large units that take the whole project through implementation at once.
B. Medium units that each deliver a testable capability and can later be grouped into Bolts.
C. Tiny single-function units.
D. Documentation-only units.
E. Downstream-business-module units.
X. Other (please specify)

[Answer]: B - `requirements` and `stories` need practical build units that are small enough to validate but large enough to represent useful capability.

### Q3. How should dependencies be described?

A. As a strict implementation order.
B. As a cycle-free dependency DAG only, with parallel opportunities noted but no economic sequencing.
C. As a priority list.
D. As a calendar.
E. As a team assignment plan.
X. Other (please specify)

[Answer]: B - The stage file explicitly reserves implementation sequence and walking-skeleton economics for Delivery Planning.

### Q4. What integration points define unit edges?

A. UI colors only.
B. BFF APIs, Java service APIs, repository ports, outbox/events, seed apply APIs, contract checks, and readiness checks.
C. Git branches only.
D. Marketing pages.
E. Production deployment environments.
X. Other (please specify)

[Answer]: B - These integration points come directly from `component-methods`, `services`, and `component-dependency`.

### Q5. What deployment model should units assume?

A. Independent public cloud services.
B. Hybrid local Compose topology: apps/services as buildable local processes or images, backing services in Compose, seed/checks as jobs/scripts.
C. Browser-only deployment.
D. Manual database-only deployment.
E. Production promotion now.
X. Other (please specify)

[Answer]: B - `decisions` and `team-practices` require local/on-prem Compose and self-hosted runner readiness, not public cloud.

## Plan Summary

- Boundary strategy: capability units across existing Shared Platform components.
- Estimated unit count: 11.
- DAG type: cycle-free topology only.
- Deployment model: local Compose plus buildable app/service/dev profiles.
- Scope guard: no Charge, Booking, Container Movement, public cloud, or production deployment units.

