# W3-04 Unit of Work Story Map

## Source Alignment

This map assigns approved User Stories `stories.md` to the units derived from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, while checking functional/NFR coverage against `requirements.md`. It does not add deferred backlog behavior or turn technical layers into stories.

## Mapping Rules

- **Primary** means the unit must satisfy the story’s complete operator outcome and acceptance criteria.
- **Contributing** means the unit implements a named slice of a cross-cutting story; the primary unit owns final end-to-end closure.
- Authorization, privacy, accessibility, correlation, idempotency, tests and live evidence are part of each affected unit’s DoD, not deferred to U08.
- “Internal story order” below describes causal work/evidence within one unit only. It is not a Bolt sequence, recommended topological path or economic priority decision.

## Story-to-Unit Assignment

| Story | Primary unit | Contributing units | Assigned outcome |
|---|---|---|---|
| US-01 — Create and reopen PB-01 request spine | U01 | US-10 and US-11 constraints within U01 | Real create/reopen, quantity `3`, null ID, stable revision/idempotency and LinerCore recovery on Compose |
| US-02 — Capture complete commercial request | U02 | U01, U04, U05, U08 | Full field dictionary, optional round-trip, canonical references and shared multiline primitive |
| US-03 — Trust requested and carrier-derived schedule | U03 | U01, U05, U08 | Separate requested date, selected schedule provenance/variance and degraded states |
| US-04 — Correct legacy and incomplete requests safely | U04 | U02, U03, U08 | Snapshot compatibility/backfill, truthful incompleteness, same-ID correction and conflict recovery |
| US-05 — Validate canonical current facts | U05 | U02, U03, U08 | Server completeness/current reference and schedule validation at exact revision/fingerprint |
| US-06 — Price exact current request | U06 | U04, U05, U08 | Fallback-free Charge input and authoritative itemized quantity-scaled evidence plus the live Correct recovery required by provider outcomes |
| US-07 — Reprice and recover without duplicate effects | U06 | U01, U04, U05, U07, U08 | Unified operation status plus deterministic refresh/retry/correct/inspect/conflict/replay behavior |
| US-08 — Confirm once and start pending assignment | U07 | U05, U06, U08 | Atomic confirm/outbox, exact Avro, CMM pending truth, no journey and safe Journey read |
| US-09 — Inspect one canonical operational workflow | U08 | U01, U03, U04, U06, U07 | One `/booking` composition with Overview/Charges/Journey/Activity and one next action |
| US-10 — Protect actions, data and error evidence | U08 | U01–U07 | Final policy matrix/privacy regression; every earlier unit enforces its own operation before protected work |
| US-11 — Prove W3-04 on integrated stack | U08 | U01–U07 | Final integrated manifest plus unit-tagged live/contract/migration/security/a11y/duplicate/correlation evidence |
| US-12 — Inspect privacy-safe diagnostics | U08 | U04, U05, U06, U07 | Collapsed safe TechnicalDetails/activity evidence without raw party/cargo/price/provider payloads |

## Unit-to-Story Coverage

| Unit | Primary stories | Contributing stories | Unit story closure |
|---|---|---|---|
| U01 | US-01 | US-02, US-03, US-07, US-09, US-10, US-11 | Establishes canonical route/persistence/operation/evidence spine consumed by later outcomes |
| U02 | US-02 | US-04, US-05, US-10, US-11 | Completes request facts and canonical reference capture needed by correction/validation |
| U03 | US-03 | US-04, US-05, US-09, US-10, US-11 | Completes schedule authority/provenance needed by correction/validation/detail |
| U04 | US-04 | US-02, US-06, US-07, US-09, US-10, US-11, US-12 | Makes brownfield data/correction/conflict/activity behavior truthful and supplies the live Correct route consumed by pricing recovery |
| U05 | US-05 | US-02, US-03, US-06, US-07, US-08, US-10, US-11, US-12 | Supplies current validation authority and safe blocked/provider outcomes |
| U06 | US-06, US-07 | US-09, US-10, US-11, US-12 | Supplies exact price authority and deterministic commercial recovery |
| U07 | US-08 | US-07, US-09, US-10, US-11, US-12 | Supplies atomic confirmation, canonical event, pending assignment and Journey truth |
| U08 | US-09, US-10, US-11, US-12 | US-02–US-08 | Converges all route-backed operational views/actions and closes integrated evidence |

## Stories Spanning Multiple Units

### US-09 canonical operational workflow

U01 establishes `/booking` create/reopen; U03 supplies schedule states; U04 supplies same-record correction/migration/conflict; U06 supplies Charges and pricing recovery; U07 supplies confirmation/Journey truth; U08 owns final RouteTabs/action-precedence/compatibility convergence. No contributing unit may create a parallel page implementation.

### US-10 authorization, privacy and safe errors

Each unit enforces only the operations it introduces before protected lookup/provider/mutation work and records safe correlation. U08 verifies the complete read/create/correct/validate/price/confirm policy matrix and privacy-safe cross-view behavior. This is a cross-cutting acceptance obligation, not a horizontal security unit.

### US-11 integrated proof

U01–U07 record fresh unit-tagged live evidence for their seams. U08 drives the complete create → reopen → invalidate/correct → validate → price/recover → confirm → consume → detail journey and aggregates, but does not replace, missing unit evidence. Any missing real provider/browser/audit prerequisite remains BLOCKED.

### US-12 diagnostics

U04–U07 produce safe migration, validation, pricing, confirmation/event and CMM correlation evidence. U08 exposes it through collapsed LinerCore diagnostics and privacy-safe Activity without copying raw exception/provider/customer/cargo/commercial payloads.

## Internal Story Order Within Each Unit

These sequences express causal completion inside a unit; all listed story constraints remain part of the same vertical DoD.

| Unit | Internal story/evidence sequence |
|---|---|
| U01 | Apply the US-10 create/read guard → complete US-01 create/reopen/recovery → record the U01 slice of US-11 live/a11y/idempotency evidence |
| U02 | Complete US-02 fields/round-trip → verify U02’s US-10 role/privacy constraints → record U02’s US-11 evidence |
| U03 | Complete US-03 schedule/provenance/degradation → verify U03’s US-10 safe provider behavior → record U03’s US-11 evidence |
| U04 | Complete US-04 migration/correction/conflict → expose its US-09/US-12 safe activity slice → verify US-10 and record US-11 evidence |
| U05 | Complete US-05 current validation → expose validation contribution to US-09/US-12 → verify US-10 denial/privacy and record US-11 evidence |
| U06 | Complete US-06 exact pricing → complete US-07 outcome recovery → expose Charges contribution to US-09/US-12 → verify US-10 and record US-11 evidence |
| U07 | Complete US-08 atomic confirmation/pending assignment → complete Journey/confirm contribution to US-07/US-09/US-12 → verify US-10 and record US-11 evidence |
| U08 | Converge US-09 route/actions → close US-12 diagnostics → verify full US-10 policy/privacy matrix → drive and record final US-11 integrated evidence |

## Requirements and Acceptance Coverage

| Requirement / acceptance range | Owning unit(s) | Story basis |
|---|---|---|
| FR-001–FR-005; AC-001–AC-002 | U01, U02 | US-01, US-02 |
| FR-006–FR-007; AC-003 | U02, U05 | US-02, US-05 |
| FR-008–FR-010; AC-004–AC-005 | U01, U03, U05 | US-01, US-03, US-05 |
| FR-011–FR-014; AC-006 | U04 | US-04 |
| FR-015–FR-019; AC-007–AC-008 | U05, U06, U08 | US-05, US-06, US-07, US-09 |
| FR-020–FR-023; AC-009–AC-010 | U07 | US-08 |
| FR-024–FR-027; AC-011 | U01, U03, U06, U07, U08 | US-01, US-03, US-06, US-07, US-09 |
| FR-028–FR-030; AC-012 | U01–U08, final closure U08 | US-05, US-08, US-09, US-10, US-12 |
| FR-026, FR-028–FR-030; NFR-005–NFR-006; AC-012 (diagnostics trace) | U04–U08, primary closure U08 | US-12 |
| NFR-001; AC-014 | U01–U08, final closure U08 | US-11 |
| NFR-002–NFR-010; AC-013 | U01–U08, final closure U08 | US-01, US-04, US-06–US-11 |

## Coverage Verification

- All twelve approved stories US-01–US-12 have exactly one primary owning unit; US-06 and US-07 intentionally share U06 because pricing and its recovery use one authority/fingerprint/operation boundary, while U08 owns four inseparable operational convergence stories.
- Every unit U01–U08 has at least one primary story and explicit cross-cutting authorization/evidence responsibilities.
- Every FR-001–FR-030, NFR-001–NFR-010 and AC-001–AC-014 range is assigned to one or more units consistent with `requirements.md` and `stories.md`.
- Deferred efficient-prefill/provenance-help/recent-choice candidates and all declared Won’t-Have behavior remain unmapped; they cannot enter Delivery Planning by implication.
- No story is assigned to a frontend/backend/database/testing-only unit, and no unit can reach DoD without observed live vertical behavior.
