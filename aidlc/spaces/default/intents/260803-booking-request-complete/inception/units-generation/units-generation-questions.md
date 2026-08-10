# W3-04 Units Generation Questions

## Guardrail

This stage defines vertical unit boundaries and a cycle-free dependency topology only. It does not choose a recommended build order, Bolt sequence, economic heuristic, or critical path; those decisions belong to Delivery Planning.

## Q1. Unit boundary strategy

How should W3-04 be decomposed?

- **Option A — vertical capability units (recommended):** Each unit delivers an observable operator outcome through every required layer and real cross-service seam. Service ownership remains explicit inside the unit, but no unit is merely “frontend,” “backend,” “database,” or “testing.”
- **Option B — service-aligned units:** Separate Booking, Reference Data, Charge, CMM, and frontend units. This mirrors ownership but delays integrated truth and permits layer-only completion.
- **Option C — coarse single unit:** Treat all W3-04 work as one unit. This avoids coordination artifacts but is too large to review, prove, or recover incrementally.

[Answer]: A — Use vertical capability units; retain explicit service ownership inside each unit and prohibit frontend/backend/database/testing-only units.

## Q2. Unit granularity and boundaries

Which granularity should the decomposition use?

- **Option A — eight thin vertical units (recommended):**
  - `U01-pb01-request-spine`: PB-01 live create/reopen spine.
  - `U02-complete-commercial-request`: full fields, normalization, reference selections, optional round-trip.
  - `U03-trusted-voyage-schedule`: requested-versus-derived schedule authority and provenance.
  - `U04-versioned-correction-migration`: snapshot v2 compatibility, ledger/backfill, same-record correction.
  - `U05-current-request-validation`: server completeness and authoritative current-reference validation.
  - `U06-exact-pricing-recovery`: fallback-free Charge pricing and deterministic status/retry/replay paths.
  - `U07-confirmation-pending-assignment`: atomic confirm/outbox, canonical event, CMM pending assignment, Journey read.
  - `U08-canonical-operational-workflow`: one `/booking` composition, action precedence, authorization/privacy, activity/diagnostics, compatibility-route retirement.
- **Option B — five coarse units:** Merge fields/schedule/validation and merge pricing/confirmation. This reduces unit count but produces large multi-authority review surfaces.
- **Option C — twelve story-shaped units:** Roughly one unit per story. This improves traceability but duplicates cross-cutting route/security/evidence work and creates artificial seams.

[Answer]: A — Use the eight named thin vertical units U01 through U08.

## Q3. Dependency topology and parallelism

How should dependencies constrain later planning?

- **Option A — minimal direct dependencies with independent branches allowed (recommended):** Record only true prerequisites. After U01, U02 and U03 are independent. After both, U04 and U05 are independent. U06 depends on U04 and U05 because US-07 recovery consumes the live correction route and current validation; U07 depends on U06; U08 depends on U07, which now carries U04 transitively. Delivery Planning may choose any valid topological path.
- **Option B — one strict chain:** Make every unit depend on the previous numbered unit. This is easy to read but invents dependencies and removes legitimate parallel development.
- **Option C — no dependencies:** Let Delivery Planning resolve all ordering. This loses implementability constraints and makes invalid Bolt plans possible.

[Answer]: A — Record only true direct prerequisites and preserve independent branches: U01; then independent U02/U03; then independent U04/U05 after both; U06 after U04 and U05; U07 after U06; U08 after U07. This review-driven refinement makes US-07 Correct recovery implementable and removes the now-transitive U04→U08 edge.

## Q4. Integration contract ownership

How should cross-unit/service contracts be represented?

- **Option A — contracts live in the unit that first exercises them end to end (recommended):** Each unit names the real HTTP, persistence, outbox/event, and UI contract it touches and proves it on Compose. Provider-owned contracts remain provider-owned; later units extend them additively. Placeholder publishers/adapters cannot satisfy a unit DoD.
- **Option B — separate integration foundation unit:** Build all contracts and adapters first. This creates a horizontal unit with no operator outcome.
- **Option C — defer contract proof to final integration:** Let units use stubs until the end. This contradicts the live vertical DoD and hides ownership failures.

[Answer]: A — The first unit exercising a real seam owns its end-to-end contract evidence; provider contracts remain provider-owned and later changes are additive.

## Q5. Deployment model

How should unit deployment be described?

- **Option A — hybrid vertical increments on the existing Compose topology (recommended):** A unit may change several independently deployed apps/services and their owned migrations/config, but it is accepted only as one observed vertical behavior on the shared Compose stack. No unit creates a new deployable service or edits `packages/ui`.
- **Option B — service-by-service deployment acceptance:** Accept each service change independently before the vertical flow works. This turns units into architectural layers.
- **Option C — one all-or-nothing monolithic deployment:** Deploy only after all units complete. This delays feedback and rollback evidence.

[Answer]: A — Use hybrid vertical increments on the existing Compose topology; no new deployable service and no W3-04 edit to `packages/ui`.

## Q6. Walking-skeleton scope

Is the approved PB-01 story the correct U01 boundary?

- **Option A — yes, use US-01/PB-01 exactly (recommended):** On the real stack, an authorized user creates and reopens one request through `/booking` with route/requested date, confirmation-grade voyage snapshot, equipment type, quantity `3`, null `equipmentId`, stable identity/revision, idempotent duplicate handling, and LinerCore recovery/focus behavior.
- **Option B — narrow to a health/persistence ping:** Easier, but not an operator-valued vertical request and conflicts with the approved first gated Construction slice.
- **Option C — widen to the full field dictionary:** Delivers more breadth but ceases to be the thinnest architecture-proving slice.

[Answer]: A — Use approved US-01/PB-01 exactly as the U01 walking-skeleton boundary.

## Ambiguity Analysis

- **Boundary overlap resolved:** U01 proves only the approved PB-01 spine. U02 adds the remaining complete commercial field dictionary and round-trip rules; U03 adds the complete requested-versus-derived schedule behavior, degraded states, and provenance. Neither reimplements the U01 route/persistence spine.
- **Direct-edge meaning resolved:** the DAG records only immediate prerequisites: `U01 -> U02,U03`; `U02,U03 -> U04,U05`; `U04,U05 -> U06`; `U06 -> U07`; `U07 -> U08`. Transitive prerequisites are not duplicated as direct edges.
- **External dependency handling resolved:** W2-02 `TextArea`/counter, Shared Platform reference/voyage facts, Charge behavior, CMM contracts, and consumer inventory remain named external prerequisites/evidence blockers, not invented W3-04 units. Missing evidence is BLOCKED, never a local substitute.
- **Contract ownership resolved:** U07 uses the exact checked-in `BookingConfirmed` Avro mapping and existing CMM booking-journey OHS from approved Application Design; it does not introduce a `BookingConfirmedV2` wire alias.
- **Sequencing boundary resolved:** the story map may note prerequisite order inside a unit, but this stage will not choose a Bolt sequence, economic heuristic, recommended topological path, or critical path.

No contradictory or vague answer remains, so no follow-up question is required before the plan gate.

## Decomposition Plan Summary

- **Strategy:** eight thin vertical capability units, each independently reviewable and testable on the live Compose stack while respecting service/data ownership.
- **Topology:** one root unit, two independent branches after U01, two independent branches after U02+U03, then pricing-to-confirmation and final operational convergence. The graph is acyclic and admits multiple valid topological orderings.
- **Contracts:** the first unit exercising a seam carries its real end-to-end contract evidence; provider-owned contracts remain provider-owned and later changes are additive.
- **Deployment:** hybrid vertical increments across existing apps/services; no new deployable service, local theme/shared primitive, `packages/ui` edit, or horizontal test-only/integration-only unit.
- **Coverage intent:** U01 maps PB-01/US-01; U02–U08 cover all remaining US-02–US-12 with cross-cutting authorization, privacy, accessibility, migration, contract, and live evidence assigned explicitly rather than deferred to an unowned final phase.

## Interaction mode

- **Guided recommendations:** accept all recommended Option A answers and review the decomposition-plan summary at the mandatory plan gate.
- **Question-by-question:** decide Q1–Q6 interactively.
- **Self-guided:** edit every `[Answer]:` line and return when complete.

[Answer]: Guided recommendations selected on 2026-08-09; all recommended Option A answers accepted for decomposition-plan review.
