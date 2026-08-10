# Units Generation Questions - W4-01 Module List-Detail Uplift

## Fixed Decomposition Context

The topology consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. It must preserve the single W2-02-owned `PlatformShell`, shared LinerCore tokens and `@erp/ui` ownership, existing service/data boundaries, and the approved domain route contracts. It must not turn global responsive, Compose, audit, or exit-gate evidence into a separate release-hardening unit, and it must not choose an implementation sequence; Stage 2.8 Delivery Planning owns economic sequencing.

## Q1. Which unit boundary strategy should W4-01 use?

A. Four outcome-oriented units: authenticated platform navigation/routing safety; Reference Data list-detail uplift; Charge Agreements list-detail uplift; and Container Journeys plus its Booking relationship (recommended)
B. Three domain-only units with all shell, route, authorization, and cross-module work duplicated inside each domain
C. Horizontal units by frontend, backend, tests, and infrastructure
D. One unit per deployable or repository folder
X. Other (please specify)

[Answer]: A - Four outcome-oriented units (Recommended) - 2026-08-10T11:52:32Z - **Mode:** guided - User response: `approve`

## Q2. What granularity should the units use?

A. Medium-grained vertical units that each deliver an independently testable operator outcome, while keeping provider/BFF/UI/contract changes for that outcome together (recommended)
B. One coarse unit containing the entire W4-01 intent
C. Fine-grained units for every route, component, API method, and test family
D. Separate units for shared tokens, shell, themes, and primitives
X. Other (please specify)

[Answer]: A - Medium-grained vertical units (Recommended) - 2026-08-10T11:52:32Z - **Mode:** guided - User response: `approve`

## Q3. How should dependency topology and parallelism be represented?

A. Record only real directed dependencies; the three domain units depend on the platform navigation/routing-safety unit and are otherwise independent, so the DAG exposes parallel development without selecting a build order (recommended)
B. Force Reference, then Charge, then Container Movement as dependency edges even where no implementation dependency exists
C. Declare every unit independent, including shell/route/authorization prerequisites
D. Choose a critical path and recommended implementation order in this stage
X. Other (please specify)

[Answer]: A - Real dependencies with domain parallelism (Recommended) - 2026-08-10T11:52:32Z - **Mode:** guided - User response: `approve`

## Q4. Which integration contracts belong at unit boundaries?

A. Use only the approved typed seams: shared `PlatformShell`/route registry and sanitized edge mounts; Identity policy; bounded Charge-to-Reference options; CMM v2 timeline/capture; signed Booking/Journey origin; and existing Kafka contracts, with no cross-domain React imports or shared database access (recommended)
B. Share domain view models and React components directly between apps
C. Add a common W4 API gateway and shared persistence model
D. Defer integration contracts until Construction
X. Other (please specify)

[Answer]: A - Approved typed integration seams only (Recommended) - 2026-08-10T11:52:32Z - **Mode:** guided - User response: `approve`

## Q5. Which deployment model should the units describe?

A. Hybrid brownfield delivery: embedded changes to existing shell/Reference/Charge/backend seams plus one new independently built CMM frontend deployable in the existing isolated Compose topology; no new backend service, database, topic, AWS stack, shell, theme, or `@erp/ui` fork (recommended)
B. Merge all module pages into one new monolithic frontend
C. Deploy each unit as a new backend microservice and database
D. Treat every unit as documentation-only with no deployable boundary
X. Other (please specify)

[Answer]: A - Hybrid brownfield deployment (Recommended) - 2026-08-10T11:52:32Z - **Mode:** guided - User response: `approve`

## Ambiguity Analysis

The five selected answers are mutually consistent and leave no decomposition ambiguity. They define one platform prerequisite and three independently testable domain outcomes, keep provider/BFF/UI changes cohesive, restrict integration to approved typed seams, and preserve the existing deployment and ownership model. The requested Reference-then-Charge-then-Container design sequence is not encoded as false dependency topology; Stage 2.8 Delivery Planning will decide the economic Bolt sequence.

## Review Clarification

Architecture review confirmed the four approved outcome boundaries but found that W2-02, not U01, publishes the shared platform contract. The final minimal topology therefore applies Q3's controlling rule - record only real directed dependencies - as U02 depending on U01's executable Reference route/read foundation, while U01, U03, and U04 are independent roots behind their named external platform/provider blockers. This removes an unintended economic-sequence encoding without changing the approved unit count, boundaries, integration contracts, or deployment model.
