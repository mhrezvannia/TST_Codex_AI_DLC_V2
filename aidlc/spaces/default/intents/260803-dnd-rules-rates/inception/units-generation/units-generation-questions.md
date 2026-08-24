# Units Generation Questions - W3-01 Vertical Redo

This redo replaces the archived horizontal decomposition. It is governed by the binding project rule that every Unit of Work is a live vertical story slice and by the affirmed W3-01 walking-skeleton practice. Contracts, migrations, backend, UI and attributable proof must travel inside the slice that exercises them; global Compose coordination, demo guards and exit audits remain intent exit gates rather than a release-hardening unit.

Upstream authority: approved `requirements.md`, `stories.md`, Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, and the W3-01 LinerCore Refined Mockups.

## Q1. Vertical unit shape

Which outcome-oriented decomposition should replace the archived layer units?

A. Four live vertical slices: author-and-price walking skeleton; govern versions and booking-time triggers; calculate exact historical/successor snapshots; handle attempts safely and expose authorised evidence
B. Three larger vertical slices by combining version governance with exact historical calculation
C. Five smaller vertical slices by separating each rule type into its own end-to-end unit
D. One unit per user story with no cross-story walking skeleton
E. One monolithic W3-01 unit containing every story and exit gate
X. Other (please specify)

[Answer]: A

## Q2. Walking-skeleton boundary

What must the first vertical slice prove?

A. One representative approved D&D term from Reference Data and Charge migration/domain/API through the exact provider happy path, generated bilateral fixtures/signoff, minimal LinerCore author/detail UI, port-local zero/non-zero calculation, and attributable automated evidence
B. Database migration and repositories only
C. OpenAPI schema and generated fixtures only
D. A static UI prototype without live Charge behavior
E. All three rule types, every error, successor history and full release acceptance in the first slice
X. Other (please specify)

[Answer]: A

## Q3. Shared migration and contract ownership

How should shared schema/contract seams be owned without becoming horizontal units?

A. The walking-skeleton unit owns the ordered Charge migration foundation, additive provider contract, generated fixtures and signoff; later vertical slices consume them and add only their outcome-specific behavior/tests
B. Each vertical slice may rewrite the same migration and regenerate/sign the bilateral contract independently
C. Create separate migration and contract units again
D. Defer migrations and contract fixtures to a final integration unit
E. Let Delivery Planning assign ownership later
X. Other (please specify)

[Answer]: A

## Q4. UI and shared-platform distribution

How should UI work follow the vertical slices and W2-02 ownership boundary?

A. Each slice delivers the LinerCore UI states/actions that expose its outcome; W2-02 `PlatformShell`/`Dialog` work is an external prerequisite in Delivery Planning, not a W3-01 Unit, and no local substitute is allowed
B. Create one standalone W3-01 UI unit after all backend work
C. Fold W2-02 shared-shell changes into the first W3-01 unit
D. Defer all UI to another intent
E. Duplicate missing shared primitives locally in Charge
X. Other (please specify)

[Answer]: A

## Q5. Evidence and live acceptance placement

Where should verification responsibilities live?

A. Focused domain/contract/API/UI evidence travels with each vertical unit; isolated Compose orchestration, p99 owner decision, global coverage report, security resolution, dual audit and ERP fidelity remain binding intent exit gates rather than a standalone Unit
B. Create a final test-only Unit that owns all tests and acceptance
C. Put tests only in the walking skeleton and reuse its result for later units
D. Treat automated tests as optional until the live demo
E. Move all acceptance evidence to Operation
X. Other (please specify)

[Answer]: A

## Q6. Dependency topology

Which hard dependency shape reflects the approved story and architecture constraints?

A. A four-unit chain: walking skeleton -> version/trigger governance -> exact historical/successor calculation -> safe attempts/evidence; U01 remains a solo separately gated Bolt, while Delivery Planning may consider grouping only U02-U04 without violating the chain
B. All four units independent
C. Safe attempts before provider calculation
D. UI outcomes after a separate backend-only chain
E. Leave dependencies unspecified until Construction
X. Other (please specify)

[Answer]: A

## Ambiguity check

After answers are collected, verify that every proposed unit crosses the relevant contract/persistence/application/API/UI/proof layers, that the first unit owns the single migration/contract foundation, that no test-only or UI-only unit exists, and that the DAG preserves US-01 through US-04 dependencies without inventing Booking or CMM runtime scope.

## Consolidated answers

1. Use four live vertical outcome slices rather than technical-layer units.
2. Make the first slice a real walking skeleton spanning Reference Data, Charge migration/domain/API/provider, generated fixtures/signoff, minimal LinerCore UI, port-local calculation and attributable proof.
3. Give that walking skeleton exclusive ownership of the ordered migration foundation, additive bilateral contract, generated fixtures and signoff; later slices consume them.
4. Distribute LinerCore UI states/actions across the slice that exposes each outcome. Treat W2-02 shared-shell/Dialog work as an external prerequisite, never a W3-01 Unit or local fork.
5. Keep focused tests with every slice. Keep Compose coordination, p99 owner decision, global coverage, security resolution, `aidlc-audit` and `erp-fidelity-audit` as intent exit gates rather than a test-only Unit.
6. Use the hard chain walking skeleton -> version/trigger governance -> exact historical/successor calculation -> safe attempts/evidence. U01 remains a solo separately gated Bolt; any grouping decision is limited to U02-U04 and belongs to Delivery Planning.

## Proposed replacement decomposition plan

| Unit | Live outcome | Cross-layer contents | Direct dependency |
| --- | --- | --- | --- |
| `dnd-author-price-walking-skeleton` | An authorised analyst creates and approves one representative D&D term, sees it in the LinerCore Charge route, and a direct exact provider request returns attributable zero/non-zero port-local results | Reference timezone seed/read, ordered Charge migration foundation, aggregate/repository/API, additive provider contract and signed fixtures, exact evidence/calculator happy path, minimal list/create/detail UI, focused domain/contract/API/UI proof | none |
| `dnd-version-trigger-governance` | Approved terms become immutable, successor/history and AgreementVersion relationships are visible, and fresh W2 pricing returns exact metadata-only D&D triggers without replay drift | lifecycle/overlap persistence and services, W2 enrichment and Standard release, history/relationship APIs, successor/approval UI, runtime/replay regression proof | `dnd-author-price-walking-skeleton` |
| `dnd-exact-historical-calculation` | Exact Agreement/Tariff, old/successor and timezone-boundary snapshots calculate reproducibly without reselection or silent upgrade | historical evidence adapter, exact applicability/version resolution, full calendar boundary/numeric cases, authorised result evidence presentation, performance harness and focused proof | `dnd-version-trigger-governance` |
| `dnd-safe-attempts-evidence` | Malformed, denied, no-rate, invalid, conflicting, concurrent and unavailable attempts receive deterministic outcomes with no partial charge and authorised disposition evidence | exact filter/controller/auth precedence, namespaced idempotency/release/takeover, durable attempt query/indexes, denied/scoped UI evidence states, security/concurrency/audit proof | `dnd-exact-historical-calculation` |

The four units are vertical: none is contract-only, migration-only, backend-only, UI-only or test-only. The first unit owns the single shared migration/contract foundation. Subsequent units extend a user-observable behavior and carry their own focused proof. W2-02 `packages/ui` delivery and the final intent exit gates are external dependencies/checkpoints, not Units of Work.

## Ambiguity analysis

No selected answer contradicts `requirements.md`, `stories.md`, ADR-001 through ADR-012, the W2-03 preservation contract, the LinerCore/W2-02 ownership model, or the existing-deployable constraint. The proposed chain preserves story prerequisites and contains no Booking or CMM runtime trigger. No follow-up question is required before plan approval.
