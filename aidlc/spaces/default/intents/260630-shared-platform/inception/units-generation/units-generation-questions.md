# Units Generation Questions - Shared Platform MVP

> Stage: Units Generation
> Intent record: `260630-shared-platform`
> Source context: `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, `stories.md`.

## Q1. Unit boundary strategy

How should units of work be bounded?

A. By architectural seam and independently testable platform capability: repo/platform foundation, identity/authz, reference domain/API, event/outbox, frontend apps, contracts/quality, observability/deployment (recommended)
B. By deployable component only: one unit per service/app/platform integration
C. By user story only: one unit per story
X. Other (please specify)

[Answer]: A. Architecture seams (Recommended)

## Q2. Unit granularity

What unit granularity should the DAG target?

A. Standard MVP granularity: about 8-12 units, each independently testable and sized S/M/L/XL (recommended)
B. Coarse: about 4-6 larger units
C. Fine: about 18-25 smaller units
X. Other (please specify)

[Answer]: A. 8-12 units (Recommended)

## Q3. Dependency topology

How should the dependency DAG handle independent work?

A. Strict direct dependencies only, with independent units explicitly marked so Delivery Planning can choose among multiple valid topological paths (recommended)
B. Encode a preferred build order directly in the unit DAG
C. Make most units depend on a single foundation unit to simplify planning
X. Other (please specify)

[Answer]: A. Direct deps only (Recommended)

## Q4. Integration contracts between units

Which integration contracts should define unit boundaries?

A. OpenAPI for reference/admin/authz APIs, Avro/message-pact for reference events, BFF contracts for frontend, no shared databases (recommended)
B. Internal Java package APIs only
C. Shared database schema contracts between services
X. Other (please specify)

[Answer]: A. OpenAPI + Avro (Recommended)

## Q5. Deployment model per unit

How should deployment model be represented?

A. Units map to independently deployable services/apps where applicable, with embedded/shared units for schemas, contracts, test harnesses, and observability (recommended)
B. Every unit must be independently deployable
C. Treat the whole Shared Platform as one deployable unit
X. Other (please specify)

[Answer]: A. Mixed model (Recommended)

## Q6. Cross-cutting units

How should cross-cutting concerns be represented?

A. Include explicit units for contract/schema quality gates and observability/CI/deployment where they have shared dependencies and story coverage (recommended)
B. Hide cross-cutting work inside each service/app unit
C. Defer cross-cutting concerns to later Construction stages
X. Other (please specify)

[Answer]: A. Explicit units (Recommended)
