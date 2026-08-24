# User Stories Plan Questions — W3-04 Booking Request Completeness

## Planning Context

- `requirements.md` fixes 30 FRs, 10 NFRs, 14 live acceptance criteria, one canonical `/booking` composition, and deterministic action/recovery mappings.
- `business-overview.md` and `component-inventory.md` establish Booking as Driver with bounded Reference Data, Charge, CMM, shared-shell, and contract dependencies.
- `team-practices.md` requires PB-01 first, tests alongside code, 80% changed executable-line evidence, and mandatory contract/migration/browser/a11y/live/audit proof.
- LinerCore remains binding. This stage defines testable vertical outcomes; it does not produce or expand Refined Mockups.

## Persona Approach

1. Which human persona model should frame the stories?
   - A. Booking Desk Agent as primary creator/validator/pricer/confirmer; Customer Service Agent as correction/inspection persona; Booking Supervisor as manual/exception oversight persona; Auditor as a supporting read-only evidence persona (recommended)
   - B. One generic Booking User persona with permission variants
   - C. Separate persona for every permission and each contributing service team
   - X. Other (please specify)
   - `[Answer]: A — Booking Desk Agent, Customer Service Agent, Booking Supervisor, and supporting read-only Auditor.`

2. How should permission differences appear without inventing role names or entitlements?
   - A. Keep personas goal-based, state required action permission on each story, and test independent read/create/correct/validate/price/confirm combinations (recommended)
   - B. Assign every persona a fixed permission bundle now
   - C. Defer authorization from stories to technical design only
   - X. Other (please specify)
   - `[Answer]: A — Goal-based personas; state action permissions per story and test read/create/correct/validate/price/confirm independently.`

## Story Slicing and Granularity

3. What breakdown should govern the story set?
   - A. Vertical workflow outcomes in risk order: PB-01 create/reopen spine; completeness/schedule; correction/migration; exact price; confirm/consume; operational detail/recovery; live proof (recommended)
   - B. Horizontal stories by frontend, Booking service, Reference Data, Charge, Kafka, and CMM
   - C. One large end-to-end story for the entire intent
   - X. Other (please specify)
   - `[Answer]: A — Risk-ordered vertical workflow outcomes from PB-01 through live proof.`

4. What target granularity should the generated backlog use?
   - A. About 10–14 independently demonstrable stories, with Must stories small enough for one focused cross-layer Bolt and Should/Could refinements kept separate (recommended)
   - B. About 5–7 large epic-sized stories
   - C. More than 20 field- or component-level stories
   - X. Other (please specify)
   - `[Answer]: A — About 10–14 independently demonstrable stories sized for focused cross-layer Bolts, with separate Should/Could refinements.`

## Priority and Acceptance

5. How should MoSCoW priority follow the approved scope?
   - A. Every minimum-complete vertical-slice, optional-field round-trip, migration, pricing, confirmation, one-shell, operational-state, and live-proof story is Must; authoritative prefill/help/diagnostics are Should; recent-choice accelerators are Could; exclusions remain Won't (recommended)
   - B. Treat pricing, confirmation, and live proof as Should so the form can ship first
   - C. Mark every story Must, including accelerators and diagnostic refinements
   - X. Other (please specify)
   - `[Answer]: A — Preserve the approved Must/Should/Could/Won't boundary exactly.`

6. How should acceptance criteria be expressed?
   - A. Given/When/Then scenarios with FR/NFR/AC trace IDs, including positive, boundary, authorization, idempotency/conflict, provider-degraded, responsive/a11y, and live-evidence cases where applicable (recommended)
   - B. Short outcome bullets without trace IDs
   - C. Link only to `requirements.md` and avoid story-level criteria
   - X. Other (please specify)
   - `[Answer]: A — Traced Given/When/Then scenarios covering applicable positive, boundary, authorization, idempotency/conflict, provider-degraded, responsive/a11y, and live-evidence behavior.`

7. How should cross-module contributions and UI states appear in vertical stories?
   - A. Keep each story centered on an operator outcome, list contributing owners/contracts as dependencies, embed its applicable LinerCore states/recoveries, and maintain one trace matrix rather than separate horizontal UI/service stories (recommended)
   - B. Create separate technical stories for every service, contract, migration, and UI state
   - C. Mention only Booking UI behavior and defer downstream dependencies
   - X. Other (please specify)
   - `[Answer]: A — Operator-centered vertical stories with explicit owner/contract dependencies, embedded applicable LinerCore states/recoveries, and one trace matrix.`

## Ambiguity and Contradiction Analysis

- All seven answers select explicit option A; no response contains vague, mixed, or conditional language.
- Persona goals remain distinct from permission bundles, so no role entitlement is invented.
- Vertical story slicing, 10–14-story granularity, and the PB-01-first team practice are mutually consistent.
- MoSCoW treatment preserves `scope-document.md`; it does not defer any minimum-complete outcome.
- Traced Given/When/Then criteria and embedded owner/state dependencies preserve `requirements.md` and LinerCore without turning service components into user personas.
- No follow-up question is required before generation.

## Fixed Boundaries

- Stories shall not reopen the approved field dictionary, schedule authority, CMM pending-assignment semantics, `booking.confirmed` authority, canonical `/booking` route, privacy policy, or measurable local evidence posture.
- User Stories may structure delivery and acceptance; they may not redefine product scope, shared-shell ownership, `packages/ui`, or the later Refined Mockups contract.
- Any answer that conflicts with `requirements.md`, `scope-document.md`, LinerCore, or affirmed `team-practices.md` requires explicit resolution before generation.
