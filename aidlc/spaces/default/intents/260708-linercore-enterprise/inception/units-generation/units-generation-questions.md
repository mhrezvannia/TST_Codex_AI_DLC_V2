# Units Generation Questions - LinerCore Enterprise

## Source Context

These questions consume `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. Graphify was used before decomposition through `query`, `explain`, and `path`; it confirmed the brownfield Shared Platform/Charge foundations and the contract/document status of Booking/CMM.

## Q1 - Unit Boundary Strategy

How should Units of Work be bounded for Construction design and implementation?

A. By service/domain boundary: Shared Platform foundation, Charge, Booking, CMM, Enterprise Web, contracts, runtime/observability. Recommended because it preserves ownership and maps cleanly to approved Application Design.  
B. By end-to-end business flow: Flow 1 through Flow 5 each becomes one or more units.  
C. By technical layer: backend, frontend, infrastructure, tests, and operations as separate units.  
D. By team workstream: one unit per enterprise workstream regardless of technical dependencies.  
E. Hybrid, with service/domain units plus cross-cutting contract/runtime units. Recommended when a domain needs executable contracts or runtime before dependent integration work.  
X. Other (please specify)

[Answer]: E

## Q2 - Unit Granularity

What granularity should the unit list use?

A. Coarse-grained: roughly 6-8 large units.  
B. Medium-grained: roughly 10-14 units, small enough for focused Construction passes but not one unit per tiny task. Recommended for enterprise scope.  
C. Fine-grained: 20+ narrow units.  
D. One unit per user-story epic.  
E. One unit per deployable service only.  
X. Other (please specify)

[Answer]: B

## Q3 - Dependency Topology

How should dependencies be represented in `unit-of-work-dependency.md`?

A. Strict DAG only: unit edges show only real prerequisites, with no economic build-order recommendation. Recommended because Stage 2.7 must not choose Delivery Planning order.  
B. DAG plus a suggested implementation order.  
C. Parallel-first grouping only, no explicit edge list.  
D. One linear chain to simplify downstream planning.  
E. Separate DAGs for backend, frontend, runtime, and contracts.  
X. Other (please specify)

[Answer]: A

## Q4 - Contract And Integration Units

How should executable contracts be handled in the unit decomposition?

A. Embed contracts inside each domain service unit.  
B. Create a dedicated contract platform/catalog unit before dependent cross-module integration units. Recommended because markdown-only contracts cannot support readiness claims.  
C. Delay executable contracts until Build and Test.  
D. Treat contracts as documentation only.  
E. Split HTTP contracts and message contracts into separate units.  
X. Other (please specify)

[Answer]: B

## Q5 - Deployment Model Per Unit

What deployment model should units assume?

A. Independent backend service deployables plus one integrated enterprise web app and shared local runtime. Recommended because it preserves service boundaries and local full-runtime proof.  
B. Single monolithic deployable for all backend modules.  
C. Existing apps only; no integrated enterprise web app unit.  
D. Backend services only; defer frontend and runtime units.  
E. Hybrid with services independently deployable, shared packages embedded, and infrastructure as shared runtime units. Recommended if paired with A.  
X. Other (please specify)

[Answer]: A, E

## Q6 - Cross-Cutting Enterprise Units

Which cross-cutting units should be explicit rather than hidden inside service units? Select all that apply.

A. Enterprise security and authorization hardening. Recommended.  
B. Contract catalog, Schema Registry, OpenAPI/AsyncAPI/Avro/Pact/message-pact. Recommended.  
C. Observability and correlation evidence. Recommended.  
D. Local Docker runtime, migrations, and seed data. Recommended.  
E. CI/CD and Operation readiness artifacts. Recommended, while later Operation stages add deployment detail.  
X. Other (please specify)

[Answer]: A, B, C, D, E

## Recommended Answer Set

Recommended answers for confirmation: Q1 E, Q2 B, Q3 A, Q4 B, Q5 A and E, Q6 A/B/C/D/E.

Rationale: this keeps module ownership explicit, creates executable-contract and runtime prerequisites before integration readiness, and leaves economic sequencing to Delivery Planning.
