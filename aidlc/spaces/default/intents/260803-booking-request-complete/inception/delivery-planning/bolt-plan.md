# W3-04 Booking Request Completeness — Bolt Plan

## Source Alignment

This plan consumes `requirements.md`, `stories.md`, approved Refined Mockups `mockups.md`, Application Design `components.md`, Units Generation `unit-of-work.md`, `unit-of-work-dependency.md`, and `unit-of-work-story-map.md`, plus affirmed `team-practices.md`. It preserves the approved U01–U08 DAG, PB-01 walking-skeleton gate, canonical LinerCore `/booking` composition, real provider contracts, service-owned persistence, and BLOCKED-not-PASS evidence rule.

## Binding Planning Decisions

- Eight sequential Bolts wrap exactly one approved Unit each. A Bolt is one pass through the applicable Construction stages; it is not a sprint, layer or unreviewed work bundle.
- B01 is the separately gated PB-01 walking skeleton required by `team-practices.md` and US-01.
- The economic path is hybrid walking-skeleton-first then risk-first: `B01/U01`, `B02/U03`, `B03/U02`, `B04/U04`, `B05/U05`, `B06/U06`, `B07/U07`, `B08/U08`.
- The path is a valid topological ordering. B02-before-B03 and B04-before-B05 are economic choices between dependency-independent units, not new DAG edges.
- Only one Bolt crosses Construction and its human gates at a time. Bounded non-conflicting tasks and focused seam reviews may run in parallel inside the active Bolt; live Compose acceptance is serialized.
- No calendar duration, velocity, utilization, named staffing or production SLO is inferred. Entry is controlled by named readiness/evidence, not dates.

## Ordered Bolt Sequence

| Bolt | Unit | Direct unit prerequisites | Walking skeleton | Relative size | Primary outcome |
|---|---|---|---|---|---|
| B01 | `U01-pb01-request-spine` | none | Yes | L | Create/reopen one truthful quantity-3/null-ID request through the real shell/BFF/Booking/DB and schedule seam with same-identity recovery |
| B02 | `U03-trusted-voyage-schedule` | U01 | No | L | Complete requested-versus-derived voyage authority, provenance, variance and deterministic degraded states |
| B03 | `U02-complete-commercial-request` | U01 | No | L | Complete governed commercial fields, canonical references, optional round-trip and released multiline primitive |
| B04 | `U04-versioned-correction-migration` | U02, U03 | No | XL | Safely read/upcast/backfill representative records and correct the same ID with optimistic conflict recovery |
| B05 | `U05-current-request-validation` | U02, U03 | No | L | Produce current authoritative validation evidence and safe blocked/unavailable/denied outcomes |
| B06 | `U06-exact-pricing-recovery` | U04, U05 | No | XL | Obtain exact Charge pricing and prove every approved recovery with zero guessed or duplicate commercial effects |
| B07 | `U07-confirmation-pending-assignment` | U06 | No | XL | Confirm once, publish exact canonical Avro and create one truthful CMM pending assignment with no journey |
| B08 | `U08-canonical-operational-workflow` | U07 | No | XL | Converge one canonical operational workflow, policy matrix, route-backed views, diagnostics and final evidence |

## Bolt Definitions

### B01 — PB-01 request spine

**Definition of Done:** The U01 live DoD is observed on the isolated Compose stack: an authorized operator creates exactly one request through `/booking` with route, requested date, complete selected-voyage snapshot, equipment type, quantity `3`, and null `equipmentId`; it reopens with stable ID/revision and exact values. Duplicate/uncertain create resolves through the same operation identity, and loading/error/focus, audit and correlation evidence is fresh.

**Confidence hypothesis:** The established LinerCore shell, forwarder/BFF, Booking hexagonal path, PostgreSQL model and real schedule seam can carry one truthful request end to end without a second UI, fabricated physical fact or duplicate effect.

**Expected demo:** Create, induce/recover an uncertain duplicate submission, reopen, inspect stored revision/snapshot and show the tagged UI/API/database/audit evidence.

**Entry gate:** Named Booking owner/backup, frontend/BFF/backend/quality coverage, Shared Platform voyage window, LinerCore/UX review window and isolated Compose slot confirmed.

### B02 — trusted voyage schedule

**Definition of Done:** The U03 live DoD is observed: requested POL-local date remains separate; route-compatible carrier number, ETD/ETA, cutoff/deadline, source/version and variance persist; absent/partial/stale/incompatible/unavailable states preserve input, expose safe recovery and block confirmation without guesses.

**Confidence hypothesis:** Shared Platform can provide confirmation-grade voyage authority and failure semantics that Booking can capture without copying the master or inventing milestones.

**Expected demo:** Select a differing route-compatible voyage, reopen provenance, then exercise partial, stale, incompatible and unavailable responses with field/context preservation.

**Entry gate:** B01 approved; named Shared Platform contract owner/backup, reference test-data window and Booking/quality reviewers confirmed.

### B03 — complete commercial request

**Definition of Done:** The U02 live create-path DoD is observed for the entire approved field dictionary, numeric/text bounds, canonical role-aware references, explicit optional nulls and exact save/reopen round-trip. Cargo description uses the released W2-02 shared `TextArea`/counter; no local substitute exists.

**Confidence hypothesis:** The complete commercial request can extend the proven spine without optional-value loss, guessed defaults, copied masters or a LinerCore ownership fork.

**Expected demo:** Boundary/optional/invalid inputs, canonical option selection, save/reopen, linked errors and responsive/keyboard behavior using the released primitive.

**Entry gate:** B01 approved; B02 may already be approved by economic sequence but is not a DAG prerequisite. Named W2-02/LinerCore, Reference Data, Booking and accessibility/quality windows confirmed; missing shared primitive keeps B03 BLOCKED.

### B04 — versioned correction and migration

**Definition of Done:** The U04 live DoD is observed against representative v0/v1/current snapshots: additive migration and restartable backfill run twice; unsupported facts stay incomplete; same-ID full replacement correction, explicit nulls, optimistic conflict and activity/migration evidence behave truthfully.

**Confidence hypothesis:** Brownfield data can reach the approved typed model and correction workflow without lost/fabricated facts, destructive rewrite or last-write-wins.

**Expected demo:** Migrate/restart/rerun a representative corpus, inspect ledger outcomes, correct one incomplete record, trigger conflict and verify unchanged authoritative revision plus preserved client input.

**Entry gate:** B02 and B03 approved; named Booking data/migration owner/backup, representative sanitized corpus, database/restart window and quality/operations reviewers confirmed.

### B05 — current request validation

**Definition of Done:** The U05 live DoD is observed: complete current-revision facts are batch-validated against Reference Data/voyage authority; `VALID`, blocked and provider-unavailable states persist with safe field/reason/correlation; stale evidence cannot price and denial invokes no provider work.

**Confidence hypothesis:** Booking can establish one current validation fingerprint as the deterministic gate to pricing while retaining provider ownership and safe degradation.

**Expected demo:** Valid, invalid, stale, unavailable and denied cases with captured provider calls, persisted outcomes, linked UI recovery and no protected lookup on denial.

**Entry gate:** B02 and B03 approved; named Shared Platform validation owner/backup, Booking owner and security/quality review window confirmed.

### B06 — exact pricing and recovery

**Definition of Done:** The U06 live DoD is observed: Charge receives the exact current authority/fingerprint with no fallback; immutable itemized quantity-scaled evidence persists. Pending/unknown, manual/no-rate, validation, denied, unavailable/no-acceptance, malformed, conflict and replay each expose exactly one approved action and cause zero duplicate provider effects.

**Confidence hypothesis:** The bilateral Booking–Charge contract can remain exact and idempotent across every approved failure/recovery state, including live Correct recovery through B04.

**Expected demo:** Capture exact Charge input and output, mutate price basis, exercise the full outcome matrix, refresh/retry with the same identity and prove duplicate-effect count zero.

**Entry gate:** B04 and B05 approved; named Charge contract/provider owner/backup, fixture/provider window, Booking integration owner and contract/security/quality reviewers confirmed.

### B07 — confirmation and pending assignment

**Definition of Done:** The U07 live DoD is observed: one authorized confirm commits one Booking state/activity/idempotency/outbox effect; `booking.confirmed` matches checked-in Avro for quantity `3`/null ID; CMM records one pending assignment and zero synthetic IDs/journeys/movement effects. Journey distinguishes CMM 200, handoff 404, denied and unavailable; uncertain confirm refreshes by the same identity.

**Confidence hypothesis:** The transactional outbox and canonical consumer can cross the service boundary exactly once semantically while keeping commercial demand distinct from physical assignment.

**Expected demo:** Confirm/replay, inspect Booking transaction/outbox/broker schema and CMM rows, prove zero journey/movement effects, and exercise Journey handoff/dependency states.

**Entry gate:** B06 approved; named Booking integration, CMM consumer, Kafka/Schema Registry, operations, privacy/security and contract-quality owners/backups/windows plus consumer inventory confirmed.

### B08 — canonical operational workflow

**Definition of Done:** The U08 live DoD is observed: `/booking` alone owns create/correct/detail; `/bookings` is a redirect/thin delegate; Overview/Charges/Journey/Activity and diagnostics show truthful route-backed states and exactly one authorized next action. Required viewports, 200% zoom, keyboard, reduced-motion, light/dark, policy/privacy, migration, contract, duplicate/correlation, `aidlc-audit` and `erp-fidelity-audit` evidence are green. Any missing prerequisite keeps B08 BLOCKED.

**Confidence hypothesis:** The eight vertical increments converge into one governable operational workflow without duplicated composition, hidden authority, privacy leakage or evidence debt.

**Expected demo:** Drive create → reopen → invalidate/correct → validate → price/recover → confirm → consume → detail on the isolated stack, including negative policy/provider/browser cases and audit manifest inspection.

**Entry gate:** B07 approved; Core Booking cell and all final seam reviewers named, isolated Compose/demo window protected, browser/accessibility tooling and audit/fidelity prerequisites green.

## Cross-Bolt Controls

- Every Bolt inherits its Unit’s full story/requirement mapping and fresh live DoD; later Bolts cannot retroactively declare an earlier missing seam PASS.
- Tests are written alongside changes and record at least 80% changed executable-line coverage in every touched module, but coverage alone never completes a Bolt.
- The feature remains on `intent/W3-04-booking-request-completeness`, synchronized with `integ/main-reconciled` under the program backlog protocol. No unproven merge policy or calendar is invented.
- Provider and shared-owner decisions are recorded before dependent implementation; a missing owner, contract, primitive, data window or live environment blocks entry or completion.
- Each Bolt ends at its AI-DLC approval gate. No later Bolt or Construction work begins until the active gate is approved.

## Construction Entry Condition

This plan is artifact-complete but not a claim that B01 staffing or external windows are ready. Construction may be entered only after the final Inception gate is approved; B01 execution additionally remains BLOCKED until its named owner/backup, contributor windows and live environment are confirmed in `external-dependency-map.md` and `team-allocation.md`.
