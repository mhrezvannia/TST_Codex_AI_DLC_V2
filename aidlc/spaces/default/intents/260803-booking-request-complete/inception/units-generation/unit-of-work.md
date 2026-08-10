# Units of Work — W3-04 Booking Request Completeness

## Source Alignment

This decomposition consumes the approved Application Design artifacts `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, together with Requirements Analysis `requirements.md` and User Stories `stories.md`. Unit boundaries preserve the approved canonical `/booking` composition, Booking-owned operation journal, checked-in `BookingConfirmed` Avro mapping, exact CMM booking-journey OHS, service-owned persistence, and LinerCore/W2-02 ownership constraints.

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit (after the walking skeleton) must move one thin capability through **every layer it needs** (UI → API → domain → persistence → any cross-module seam) and its Definition of Done must be an **observed end-to-end behavior on the running stack** — never “layer X tests pass,” and never “without live proof.” A unit whose DoD can be met without running the app is mis-sliced; re-slice it.

No unit below is a frontend, backend, database, contract, migration, security, or testing layer. Shared concerns are attached to the operator behavior that first exercises them and are extended by later units. Complexity is relative within W3-04 and is not a delivery priority.

## Units

| Unit | Name | Vertical scope (layers it cuts) | Deployment model | Complexity | Definition of Done (observed on live stack) |
|---|---|---|---|---|---|
| U01 | `U01-pb01-request-spine` | LinerCore `/booking` create/reopen → shell forwarder → Booking BFF → Booking API/domain → additive persistence and operation status; live voyage option seam | Hybrid increment on existing shell, Booking app/service, PostgreSQL and Reference Data Compose services | L | On the running Compose stack, an authorized operator creates exactly one PB-01 request with route, requested date, confirmation-grade voyage snapshot, equipment type, quantity `3`, and null `equipmentId`; the request reopens with stable ID/revision and exact values. Duplicate/uncertain create reuses one operation identity, Refresh is non-mutating, and observed UI loading/error/focus plus audit/correlation evidence is captured. |
| U02 | `U02-complete-commercial-request` | Shared create form → BFF/API → Booking value objects/completeness → snapshot/projection; Reference Data role/options; W2-02 shared multiline primitive | Hybrid increment on existing shell, Booking app/service, Booking DB and Reference Data | L | On the live create path, every approved required and optional commercial field is entered or explicitly left/cleared before save, saved, and reopened without fabricated defaults or optional-value loss; canonical references and role masking are observed. Same-record post-save correction is proved only in U04. Cargo description uses the released W2-02 `TextArea`/counter; if unavailable, the unit remains BLOCKED and cannot meet DoD—there is no local substitute. |
| U03 | `U03-trusted-voyage-schedule` | Route/date form behavior → Booking schedule facade/domain evidence → Reference Data voyage OHS → captured provenance | Hybrid increment on existing shell, Booking app/service and Reference Data | L | On the live stack, requested POL-local departure remains user authority while a route-compatible selected voyage supplies versioned carrier number, ETD/ETA, cutoff and deadline; variance/provenance survives reopen. Partial, stale, incompatible and unavailable schedule states preserve input, expose safe recovery, and block confirmation without guessed facts. |
| U04 | `U04-versioned-correction-migration` | `/booking/{id}/correct` shared form → full replacement PUT → optimistic aggregate update → snapshot v2/projection/Flyway ledger/backfill | Hybrid increment on existing shell and Booking app/service/database; no new runtime | XL | Against representative live pre-W3 and current snapshots, additive migrations and restartable backfill run twice without lost/fabricated facts; unsupported records remain explicitly incomplete. An authorized operator corrects the same ID through the shared form, explicit nulls round-trip, stale revision conflicts preserve input, and activity/migration evidence is observed. |
| U05 | `U05-current-request-validation` | Validate action → per-operation authorization/BFF → Booking completeness/fingerprint → Reference Data batch validation and voyage authority → persisted result | Hybrid increment on existing shell, Booking app/service, Booking DB and Reference Data | L | On the live stack, the exact current revision validates canonical party/commodity/package/location/equipment/voyage facts and complete schedule evidence. Valid, blocked and provider-unavailable outcomes persist with stable safe field/reason/correlation data; stale evidence cannot authorize price, and denied users trigger no protected provider work. |
| U06 | `U06-exact-pricing-recovery` | Charges/action UI and U04 correction route → operation status → Booking pricing orchestration/fingerprint → Charge OHS → immutable pricing evidence | Hybrid increment on existing shell, Booking app/service/database and Charge | XL | On the live stack, Charge receives the exact current customer/commodity/POL/POD/equipment/date/quantity/currency basis with no fallback; authoritative itemized lines and quantity-scaled total persist. Pending/unknown, manual/no-rate, validation, denied, unavailable/no-acceptance, malformed, conflict and replay each expose exactly one approved recovery—including the live U04 Correct route where required—reuse the same identity where permitted, preserve context, and create no duplicate commercial request. |
| U07 | `U07-confirmation-pending-assignment` | Confirm UI/dialog/status → Booking preconditions/transaction/outbox → Kafka/Schema Registry → CMM pending persistence → Booking Journey facade/CMM OHS | Hybrid increment across existing shell, Booking, Kafka/Schema Registry, CMM and their owned databases | XL | On the live stack, one authorized confirm of a current priced revision commits exactly one confirmation/activity/idempotency/outbox effect. The record on `booking.confirmed` matches checked-in Avro exactly for quantity `3`/null ID; CMM stores one pending assignment and zero synthetic IDs/journeys/movement effects. Journey distinguishes CMM 200 pending/journey from handoff-pending 404, denied and unavailable, and uncertain confirm refreshes by the same operation identity. |
| U08 | `U08-canonical-operational-workflow` | Canonical create/correct/detail composition and RouteTabs → action precedence/status/focus → BFF/service policy → Overview/Charges/Journey/Activity/diagnostics plus compatibility delegates | Hybrid convergence increment across existing shell, Booking app/service and already exercised provider seams; no new service or `packages/ui` edit | XL | On the live stack and required viewports/themes/zoom/keyboard modes, `/booking` alone owns create, correct and operational detail; `/bookings` is a redirect/thin delegate. Overview, Charges, Journey and Activity show truthful route-backed states, exactly one authorized next action, privacy-safe diagnostics and recovery; action-permission combinations expose no protected facts. Full W3-04 live, browser/a11y, contract, migration, security, audit and fidelity evidence is green; an unavailable prerequisite leaves the unit BLOCKED and cannot satisfy DoD. |

## Unit Responsibilities and Boundaries

### U01 — PB-01 request spine

- Owns the thinnest approved US-01 vertical route, stable create identity/revision, create-scoped operation journal/status lookup, persistence round-trip, and observed LinerCore recovery.
- Exercises real shell/BFF/Booking/DB and required voyage-option behavior; a health-only or stub-backed path cannot satisfy the unit.
- Does not broaden to the complete field dictionary, final validation/pricing/confirmation, or physical assignment.

### U02 — complete commercial request

- Owns the approved field dictionary, normalization/range/null semantics, reference option roles, create-path save/reopen round-trip and completeness reasons for owned/request facts. Post-save same-record correction/clearing belongs to U04.
- Consumes the W2-02-owned `TextArea`/counter and released `@erp/ui`; it cannot edit `packages/ui`, create a local multiline primitive, or copy Reference Data masters.
- Extends the U01 form/persistence path rather than creating a second form or route.

### U03 — trusted voyage schedule

- Owns requested-versus-derived schedule separation, route-compatible voyage choice, full schedule snapshot/provenance, variance and degraded recovery states.
- Reference Data remains authority; Booking captures only the confirmation-grade selected snapshot and never guesses milestones.
- Extends U01 schedule evidence without taking ownership of full current-reference validation in U05.

### U04 — versioned correction and migration

- Owns explicit snapshot v2 reads/writes, v0/v1 upcast, additive projection/migration ledger, restart/baseline-drift behavior and same-record correction.
- Uses `/booking/{bookingId}/correct` with the same Booking-owned form composition and a full replacement PUT guarded by expected revision and operation identity.
- Does not introduce destructive migration, last-write-wins correction, or fabricated legacy values.

### U05 — current request validation

- Owns canonical server completeness, current-revision validation fingerprint, batched Reference Data/voyage checks, result persistence and validate-scoped operation recovery.
- Produces the only validation evidence that permits pricing; client checks remain advisory.
- Does not calculate price, duplicate reference authority, or mutate on denial/provider failure.

### U06 — exact pricing and recovery

- Owns fallback-free `PricingInput`, current fingerprint, Charge request/status/retry/replay mapping, immutable accepted snapshot and Charges-view evidence.
- Extends the unified operation journal for price and enforces pending/unknown Refresh versus proven-not-accepted Retry once.
- Does not guess a trade lane, commodity, quantity, currency, rate, or accept a malformed/partial price.

### U07 — confirmation and pending assignment

- Owns confirm preconditions, confirmation-scoped operation recovery, one Booking transaction/outbox row, canonical Kafka/Avro publication, CMM idempotent pending assignment and exact Journey read boundary.
- Uses the checked-in Avro fields and maps AsyncAPI headers as approved; internal command idempotency is not an Avro payload field.
- Creates no CMM `ContainerJourney`, physical equipment ID, movement status, database join or per-event dual publication.

### U08 — canonical operational workflow

- Owns final convergence of the one `/booking` shell composition, RouteTabs, action precedence, policy matrix, privacy-safe activity/diagnostics, compatibility delegates and complete responsive/accessibility behavior.
- Integrates already implemented vertical capabilities; it cannot mask missing upstream live evidence or become a horizontal “final testing” unit.
- Retains the LinerCore master, released `@erp/ui`, light/dark operational-console contract and W2-02 ownership boundary.

## Cross-Module Seams In This Intent

| First exercising unit | Seam and real mechanism | Authority / live evidence obligation |
|---|---|---|
| U01 | Browser → shell forwarder → Booking BFF → Booking service REST; Booking PostgreSQL; bounded voyage option/read seam | Authenticated create/reopen and same-identity status recovery observed on Compose; no mock/stub satisfies DoD |
| U02 | Booking facade → Reference Data role-aware option OHS; released W2-02 shared multiline primitive | Provider-owned IDs/versions/status and executable shared primitive observed; missing dependency is BLOCKED |
| U03 | Booking `VoyageSchedulePort` → Reference Data voyage OHS | Route/date compatibility and full schedule provenance/degradation observed from the real provider |
| U04 | Booking snapshot codec/projection/Flyway ledger and full replacement REST contract | Representative persisted snapshots, restart/rerun and conflict behavior observed against Booking PostgreSQL |
| U05 | Booking `ReferenceValidationPort`/`VoyageSchedulePort` → Reference Data batch validation | Real valid/invalid/stale/unavailable and denial-before-provider outcomes observed |
| U06 | Booking `PricingPort` → Charge pricing request/status REST | Exact request capture, all approved provider outcomes and duplicate-effect count observed from Charge |
| U07 | Booking transactional outbox → Kafka `booking.confirmed`/Schema Registry → CMM consumer; Booking → exact CMM booking-journey HTTP OHS | Schema-valid record, one pending effect, zero journey/movement effects, replay and 200/404/403/timeout mappings observed |
| U08 | Canonical `/booking` pages/RouteTabs and `/bookings` compatibility delegates across the established BFF chain | Full route/action/security/a11y/fidelity behavior observed without app-to-app imports or a second implementation |

## Dependency DAG

The authoritative direct-edge block and integration rationale are in `unit-of-work-dependency.md`. The topology has one root (`U01`), independent `U02`/`U03` branches, independent `U04`/`U05` branches after both request authorities exist, convergence of correction plus validation into U06, and then pricing → confirmation → canonical operational workflow. This describes constraints only; it selects no Bolt order or critical path.

## Verification Obligations

- Every unit carries unit/component/contract tests alongside production changes and records at least 80% changed executable-line coverage per touched module.
- A unit DoD requires its own tagged live Compose evidence; another intent’s or unit’s PASS cannot be reused.
- Authorization, privacy, correlation, idempotency/replay, responsive/a11y and failure-state checks attach to the unit that exercises the behavior.
- Provider, consumer, shared-primitive or browser prerequisites that are unavailable remain BLOCKED rather than converted to PASS through stubs, screenshots, design intent, or fallback values.

## Exit Gate

The intent is not complete until the full vertical path across all units has been driven on the real Compose runtime and `aidlc-audit` plus `erp-fidelity-audit` are green. The final evidence manifest must link unit-tagged live, contract, migration, security, browser/accessibility, duplicate-effect and correlation observations. Construction does not begin from this artifact alone; all remaining required Inception gates must be approved through the engine.

## Open Questions

1. Is U01's walking-skeleton path the right thinnest end-to-end route?
   - `[Answer]: Yes — approved US-01/PB-01 exactly; do not narrow to health/persistence or widen to the full field dictionary.`

No unit-boundary question remains open after the approved decomposition plan.

## Review

**Verdict:** READY  
**Reviewer:** aidlc-architecture-reviewer-agent  
**Date:** 2026-08-09  
**Iteration:** 2

### Findings

| # | Severity | Location | Finding | Recommendation |
|---|---|---|---|---|
| 1 | Minor | `unit-of-work-story-map.md`, US-06 and U04 rows | The corrected U04 -> U06 contract is explicit in the DAG because US-06/US-07 recovery consumes the live Correct route, but U04 is not mirrored as a contributing unit for US-06 even though US-06 acceptance criterion 3 includes that recovery. This is trace-only; the implementing boundary and topology are unambiguous. | Add U04 to the US-06 contributing-units cell and US-06 to U04's contributing-stories cell during the next artifact maintenance. |

### Iteration 1 Resolution

| Previous finding | Status | Verification |
|---|---|---|
| U06 consumed U04 without a dependency | Resolved | U06 now depends directly on U04 and U05 in prose, Mermaid, YAML and integration rationale; U04 -> U08 was correctly removed as transitive. |
| U02/U04 correction ownership was ambiguous | Resolved | U02 is explicitly limited to create-path entry/save/reopen and pre-save clearing; U04 alone proves post-save same-record correction. |
| US-12 diagnostics trace was incomplete | Resolved | The exact FR-026, FR-028-FR-030, NFR-005-NFR-006 and AC-012 diagnostics row is restored with U08 primary closure. |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| required-sections sensor | PASS | Required sections and the machine-readable YAML DAG are structurally valid and cycle-free. |
| upstream-coverage sensor | PASS | All declared upstream artifacts are referenced. |
| Reviewer edge parity and coverage check | PASS | Mermaid and YAML contain the same ten direct edges; all eight units and US-01-US-12 resolve exactly once in their authoritative registries. |

### Summary

The decomposition is vertically implementable, service/data ownership and real provider/W2-02 blockers remain explicit, the minimal DAG is consistent and cycle-free, and all stories plus FR/NFR ranges are covered without a hidden horizontal unit or economic-sequencing claim. The sole remaining finding is a non-blocking story-map trace mirror that does not require architectural guidance to implement.

### Post-review Maintenance

The non-blocking trace mirror was applied after the final reviewer iteration: U04 is now listed as a contributor to US-06, and US-06 is listed in U04's contributing stories. No unit boundary or dependency edge changed.
