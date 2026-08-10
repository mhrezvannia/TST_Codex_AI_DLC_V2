# Units Generation Questions - W3-01 D&D Rules and Rates

These questions define decomposition topology only. They do not choose implementation order, delivery priority, a walking skeleton, or a critical path; those decisions belong to Delivery Planning 2.8.

Upstream authority: approved `requirements.md`, `stories.md`, and Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`.

## Q1. Unit boundary strategy

How should the approved cross-service and UI work be divided into Units of Work?

A. Architecture-aligned vertical capabilities: contracts, Charge persistence/domain, terms administration/API, pricing evaluation, W2 enrichment, Reference Data timezone support, UI platform dependency, Charge UI/BFF, and acceptance evidence
B. One coarse W3-01 unit containing all backend, contract, UI, and acceptance work
C. One unit per repository folder or technical layer, even when a user story spans several units
D. One unit per user story, duplicating shared contract and persistence prerequisites where necessary
E. Deployment-target units only: Charge service, Reference Data service, packages/ui, and Charge web
X. Other (please specify)

[Answer]: A

## Q2. Unit granularity

What granularity should the topology target?

A. Medium-grained, approximately 8-10 independently testable units with explicit cross-unit contracts
B. Coarse-grained, approximately 4-5 units with broader responsibilities and fewer edges
C. Fine-grained, approximately 12-15 units with narrow responsibilities and more integration edges
D. Minimal, only one unit per existing deployable/package
E. Mixed, with smaller high-risk provider/persistence units and larger UI/acceptance units
X. Other (please specify)

[Answer]: A

## Q3. Parallel-development representation

How should independent work be represented in the dependency DAG?

A. Declare only hard compile, schema, contract, ownership, or test-fixture dependencies; explicitly identify antichains that may proceed in parallel
B. Serialize all units behind the contract unit even when no hard dependency exists
C. Serialize all backend units before any frontend or acceptance unit
D. Treat every unit as independent and defer integration dependencies to Delivery Planning
E. Group parallel work into single larger units so the DAG has fewer branches
X. Other (please specify)

[Answer]: A

## Q4. Externally owned UI prerequisites

How should the approved W2-02 `packages/ui`/shared-shell prerequisites be represented?

A. A distinct prerequisite unit owned by W2-02, with W3-01 Charge UI depending on its merged revision and package tests; no local substitute
B. Fold the shared-shell and Dialog changes into the W3-01 Charge UI unit
C. Record them only as a note, with no DAG edge
D. Defer all W3-01 UI work until a future intent
E. Duplicate the required primitives locally in Charge to avoid a dependency
X. Other (please specify)

[Answer]: A

## Q5. Deployment model

How should unit deployment boundaries reflect the approved brownfield architecture?

A. Embedded units in existing Charge, Reference Data, Charge web, contract, and `packages/ui` targets; no new deployable
B. Create a standalone D&D microservice and database
C. Create a standalone D&D frontend module with its own shell
D. Package all work only inside the Charge deployable, including Reference Data and shared UI ownership
E. Hybrid: new D&D worker plus existing synchronous APIs
X. Other (please specify)

[Answer]: A

## Ambiguity check

After answers are collected, verify that the selected unit count, ownership boundaries, hard dependencies, and embedded deployment model do not contradict ADR-001 through ADR-012 or the approved W2-03 preservation contract. Any contradiction requires a follow-up question before plan approval.

## Consolidated answers

1. **Architecture-aligned vertical capabilities:** separate contracts, persistence/domain, application/API, provider, enrichment, Reference Data, shared UI prerequisite, Charge UI/BFF, and acceptance responsibilities without duplicating shared prerequisites.
2. **Medium granularity:** target nine independently testable units with explicit interfaces and ownership.
3. **Hard dependencies only:** compile, schema, contract, ownership, or fixture edges are represented; independent antichains remain visible for Delivery Planning.
4. **W2-02 prerequisite:** `packages/ui` and shared-shell/Dialog work remains a distinct W2-02-owned prerequisite with no Charge-local substitute.
5. **Embedded deployment:** all units land in existing contract, Charge, Reference Data, `packages/ui`, and Charge web targets; no new deployable or database is introduced.

## Proposed decomposition plan

The generation step will define these nine units without selecting a build order or critical path:

| Unit | Boundary | Direct hard dependencies |
| --- | --- | --- |
| `pricing-contract-evolution` | Additive `pricing.v1` provider/consumer schemas and fixtures | none |
| `charge-dnd-persistence-foundation` | Namespaced receipts, D&D terms/activity/attempt tables, repositories, locks, indexes | none |
| `reference-location-timezones` | LOCATION timezone validation/backfill and Charge read contract | none |
| `ui-platform-prerequisites` | W2-02-owned `PlatformShell` and `Dialog` seams in `packages/ui` | none |
| `dnd-terms-administration` | D&D aggregate, lifecycle, overlap rules, admin API and AgreementVersion queries | persistence, Reference timezone |
| `dnd-pricing-provider` | Exact historical-evidence validation, idempotent calculation API, audit and telemetry | contract, persistence, Reference timezone, terms administration |
| `standard-pricing-dnd-enrichment` | Fresh W2 pricing metadata/evidence enrichment and Standard claim release | contract, persistence, terms administration |
| `charge-dnd-ui-bff` | D&D list/form/detail/history and AgreementVersion section using LinerCore | terms administration, UI platform prerequisite |
| `w3-01-live-acceptance` | Cross-unit contract, regression, security, fidelity, Compose and performance evidence | provider, enrichment, UI/BFF |

The graph begins with four independent prerequisite units. The terms-administration unit joins persistence and Reference Data; provider, enrichment, and UI/BFF then branch on their actual contracts. Live acceptance joins the three user-visible/runtime branches. This is topology only; Delivery Planning 2.8 will choose the economic Bolt sequence.

## Ambiguity analysis

No selected answer contradicts the approved requirements, stories, ADR-001 through ADR-012, W2-03 preservation contract, LinerCore ownership model, or existing-deployable constraint. No follow-up question is required before plan approval.
