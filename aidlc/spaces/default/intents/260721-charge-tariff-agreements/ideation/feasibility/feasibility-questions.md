# Feasibility Questions — W2-03 Charge Tariffs & Agreements

Upstream context: [`intent-statement.md`](../intent-capture/intent-statement.md), [`competitive-analysis.md`](../market-research/competitive-analysis.md), [`market-trends.md`](../market-research/market-trends.md), and [`build-vs-buy.md`](../market-research/build-vs-buy.md).

## Q1. Integration boundary

Which existing systems define W2-03's integration boundary?

- A. Reuse Charge, Booking, Shared Platform references, auth/BFF, PostgreSQL/Flyway, bilateral contracts, and the isolated Wave A Compose stack only (recommended)
- B. Add external rate providers, settlement, or other program modules now
- C. Build Charge administration without proving Booking consumption
- X. Other (please specify)
- `[Answer]:` A - Wave A seams (Recommended)

## Q2. Compliance posture

What compliance posture should feasibility apply to this internal commercial-pricing slice?

- A. Treat customer agreements and actor/audit data as confidential or internal, enforce least privilege and auditable evidence, and make no unsupported certification claim (recommended)
- B. Assume PCI, HIPAA, GDPR, or SOC 2 scope without confirmed jurisdiction or data requirements
- C. Defer authorization, auditability, retention, and sensitive-data handling
- X. Other (please specify)
- `[Answer]:` A - Controls and evidence (Recommended)

## Q3. Technical delivery posture

Which technical posture should W2-03 use?

- A. Extend the current Java/Spring ports-and-adapters services, PostgreSQL/Flyway persistence, TypeScript/React shell, and existing contract/test tooling (recommended)
- B. Introduce a generic rules engine or new service platform
- C. Build a disconnected prototype
- X. Other (please specify)
- `[Answer]:` A - Extend existing (Recommended)

## Q4. Delivery constraints

How should feasibility handle budget and timeline constraints that were not supplied?

- A. Hold the approved thin slice and evidence gates fixed, use ordinal effort/risk, and avoid inventing staffing, cost, or dates (recommended)
- B. Invent a team size, budget, and deadline to produce numeric estimates
- C. Add advanced rating breadth and absorb the unknown schedule impact
- X. Other (please specify)
- `[Answer]:` A - Scope-bound proof (Recommended)

## Q5. Organizational and acceptance blockers

How should the current Docker and port-8088 access limitation be treated?

- A. Continue design and build work, but require an environment with Docker access for isolated Wave A live proof, demo guards, UI evidence, and audits before completion (recommended)
- B. Treat plans, tests, or static artifacts as equivalent to observed live acceptance
- C. Target or interrupt the protected manager demo
- X. Other (please specify)
- `[Answer]:` A - Release dependency (Recommended)

## Q6. Runtime and AWS scope

What runtime landscape should this stage assess?

- A. Assess the isolated local Wave A Compose topology; retain least-privilege, reliability, and evidence needs without adding AWS deployment scope (recommended)
- B. Design and provision AWS services and accounts as part of W2-03
- C. Block the local slice until an AWS account and region inventory exists
- X. Other (please specify)
- `[Answer]:` A - Compose canonical (Recommended)

## Ambiguity and Contradiction Review

- No answer conflicts with the approved [`intent-statement.md`](../intent-capture/intent-statement.md) or the bounded-build conclusion in [`build-vs-buy.md`](../market-research/build-vs-buy.md).
- No numeric budget, team capacity, cloud account, region, jurisdiction, retention period, or certification target was supplied. These remain unknowns rather than invented facts.
- The Docker-access limitation is compatible with continuing lifecycle work, but it is incompatible with declaring the live Definition of Done complete until the required environment is available.
