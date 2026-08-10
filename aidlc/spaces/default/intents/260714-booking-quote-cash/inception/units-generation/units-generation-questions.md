# Units Generation Questions - W1-01 Booking Quote-to-Cash

## Q1. Unit Boundary Strategy

How should W1-01 implementation units be bounded?

A. Vertical capability slices aligned to owned deployables and contracts (Recommended)
B. One unit per service or app, regardless of internal capability boundaries
C. Horizontal technical layers such as schema, persistence, application, and transport
D. One coarse unit for the complete W1-01 journey
X. Other (please specify)

[Answer]: A. Vertical capability slices aligned to owned deployables and contracts (Recommended)

## Q2. Unit Granularity

What granularity should the decomposition target?

A. Seven independently testable units covering contracts, Charge pricing, Booking command flow, CMM event flow, Booking projection, Booking UI/BFF, and live acceptance (Recommended)
B. Four coarse units covering contracts, all backend services, frontend, and acceptance
C. Fine-grained units for each adapter, migration, schema, and UI route
D. Three deployment units only: backend services, frontend, and acceptance
X. Other (please specify)

[Answer]: A. Seven independently testable units covering contracts, Charge pricing, Booking command flow, CMM event flow, Booking projection, Booking UI/BFF, and live acceptance (Recommended)

## Q3. Dependency Topology

How should independent work be represented in the dependency DAG?

A. Preserve all valid parallel branches and record only hard compile-time, contract, or runtime-proof dependencies (Recommended)
B. Serialize every unit behind the preceding unit for simpler coordination
C. Allow dependencies to be inferred during Construction instead of freezing them here
D. Group every backend unit behind one shared backend dependency
X. Other (please specify)

[Answer]: A. Preserve all valid parallel branches and record only hard compile-time, contract, or runtime-proof dependencies (Recommended)

## Q4. Integration Contract Ownership

Where should cross-unit executable contract changes live?

A. A dedicated contract-foundation unit owns canonical Avro, AsyncAPI, OpenAPI, Pact, examples, catalog, and compatibility proof; service units consume it (Recommended)
B. Each service unit independently edits its local and shared contract copies
C. The live-acceptance unit owns all contract changes after service implementation
D. Keep existing contract files unchanged and adapt only runtime serializers
X. Other (please specify)

[Answer]: A. A dedicated contract-foundation unit owns canonical Avro, AsyncAPI, OpenAPI, Pact, examples, catalog, and compatibility proof; service units consume it (Recommended)

## Q5. Deployment Model

How should units relate to deployable boundaries?

A. Hybrid: service capabilities remain independently deployable, Booking UI/BFF deploys as its app, contracts are shared build assets, and acceptance is evidence-only (Recommended)
B. Treat the full W1-01 journey as one monolithic deployment
C. Package contracts into a new runtime contract service
D. Embed the Booking UI into the Booking Spring Boot service
X. Other (please specify)

[Answer]: A. Hybrid: service capabilities remain independently deployable, Booking UI/BFF deploys as its app, contracts are shared build assets, and acceptance is evidence-only (Recommended)

## Upstream Context

These questions refine topology from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. Economic sequencing remains reserved for Delivery Planning.

## Binding Template Resolution

After generation and review, the deterministic `required-sections` sensor exposed that the selected capability units conflicted with the binding vertical-unit template at `aidlc/spaces/default/memory/templates/unit-of-work.md`.

[Answer]: Re-slice vertically (Recommended) - keep seven units aligned one-to-one with US-W1-001 through US-W1-007 and embed contracts, migrations, backend, UI, and evidence in the live slice that exercises them.
