# Requirements — W3-01 D&D Rules & Rates

**Traceability inputs:** [intent-statement.md](../../ideation/intent-capture/intent-statement.md), [scope-document.md](../../ideation/scope-definition/scope-document.md), [business-overview.md](../../../codekb/TST_Codex_W3-01/business-overview.md), [architecture.md](../../../codekb/TST_Codex_W3-01/architecture.md), [code-structure.md](../../../codekb/TST_Codex_W3-01/code-structure.md), and [team-practices.md](../practices-discovery/team-practices.md).

## Intent Analysis

W3-01 must make Charge the authoritative, maintainable source of detention and demurrage rules and flat daily rates while preserving W2-03's versioned agreement/tariff authority. A Pricing Analyst must maintain the provider-side rules in the shared Charge application, and an internal caller must receive a deterministic, itemised and version-attributable result from an additive D&D pricing operation. W3-02 owns the later Booking trigger and invoice journey.

The binding bilateral contract resolves two earlier concept ambiguities: the MVP rule set is import demurrage, import detention and export detention—not a generic combined rule—and the MVP uses one flat daily rate after free time, not progressive bands. Calendar-day counting uses the applicable port's local date and includes weekends/holidays; working-day/holiday calendars are deferred.

## Functional Requirements

1. **FR-01 — Rule-type authority.** Charge shall maintain exactly the three MVP rule types and fixed DCSA T&T v2.2 bounding semantics: `IMPORT_DEMURRAGE` (`DISC/LADEN` → `GTOT/LADEN`), `IMPORT_DETENTION` (`GTOT/LADEN` → `GTIN/EMPTY`), and `EXPORT_DETENTION` (`GTOT/EMPTY` → `GTIN/LADEN`).
2. **FR-02 — Rule/rate terms and applicability.** A Pricing Analyst shall create a D&D rule/rate version with rule type, exact approved pricing-basis version, applicable POL/POD side and UN/LOCODE port, trade lane, equipment type, non-negative free-day count, one non-negative flat daily rate, ISO 4217 currency, charge code, effective window and lifecycle status. Import rule types use the POD side; export detention uses the POL side. Activation shall reject overlapping approved rate windows for the same basis version, rule type, port, trade lane and equipment type.
3. **FR-03 — Version lifecycle.** Draft versions may be edited; approval makes a version immutable. A change shall create a successor and preserve complete historical rule/rate, agreement-or-tariff and audit lineage.
4. **FR-04 — Echoed pricing-basis and applicability validation.** `DndPricingRequest` shall carry `pricingBasis`, `pricingRef`, `pricingBasisVersionId`, `pricingEffectiveDate`, `dndRuleType`, `portLocationCode`, `tradeLane`, `equipmentType`, booking/equipment identity and both movements. Charge shall validate these echoed values against the immutable booking-time pricing snapshot and exact approved D&D rate version; POL/POD side is derived from `dndRuleType`. Charge shall not re-select agreement-first, infer missing applicability, or switch to a newer basis/rate during D&D evaluation. Unknown, inactive, mismatched or inapplicable echoed basis/rate evidence returns `404 NO_RATE`.
5. **FR-05 — Port-local calendar days.** Evaluation shall convert both event timestamps to dates in the applicable port timezone and calculate `elapsedDays = max(0, endPortLocalDate.toEpochDay - startPortLocalDate.toEpochDay)` and `chargeableDays = max(0, elapsedDays - freeDays)`. Same-local-date events yield zero elapsed days; weekends and holidays remain ordinary dates. Working-day and holiday-exclusion logic is forbidden in W3-01.
6. **FR-06 — Request validation and exact errors.** Charge shall validate the rule type, pricing basis/reference, equipment/booking identity and exact start/end code/qualifier/order. Malformed input returns `400 PRICING_BAD_REQUEST`; missing/invalid identity and denied capability return the approved `401`/`403` errors; unknown/inapplicable basis or rate returns `404 NO_RATE`; idempotency conflict/in-progress returns `409 IDEMPOTENCY_CONFLICT`/`PRICING_IN_PROGRESS`; invalid pair, qualifier, timestamp order or semantic value returns `422 PRICING_VALIDATION`; unavailability returns `503 PRICING_UNAVAILABLE`. Every failure persists no charge result.
7. **FR-07 — Deterministic itemised result.** A successful evaluation shall return booking/equipment identity, pricing basis/reference, rule type, charge code, currency, free days, elapsed calendar days, chargeable days, flat daily rate, amount, exact rule/rate and agreement-or-tariff version identifiers, calculation timestamps and correlation evidence. Within-free-time results shall return an explicit zero line rather than no result.
8. **FR-08 — Idempotency and atomicity.** `POST /dnd-pricing-requests` shall require the bilateral key `bookingId + equipmentId + closingMovementEventId`. The same key and request fingerprint shall replay the immutable result; the same key with a different fingerprint shall return a distinct conflict. Partial charge results are forbidden.
9. **FR-09 — Charge UI.** Under the authenticated shared Charge Agreements shell, authorised Pricing Analysts shall use stable list, create/edit-draft and detail routes to filter rules, maintain flat terms, approve/create successors and inspect version/audit evidence. The UI shall show loading, empty, denied, validation, error/retry and success states. A calculation-preview UI is not mandatory; direct API/live acceptance proves evaluation.
10. **FR-10 — Rate-change re-evaluation.** After a successor becomes effective, subsequent booking-time pricing may return the successor's exact basis/reference/version and pricing-effective-date evidence; a D&D request echoing that full snapshot shall use the linked successor rate. A request echoing an older preserved snapshot shall continue to use its historical rule/rate version and shall never be silently upgraded.
11. **FR-11 — Additive bilateral contract.** Charge shall add `pricing.dnd-request`/`pricing.dnd-result` shapes and `/dnd-pricing-requests` to `contracts/openapi/pricing.v1.yaml` without removing, renaming or changing required W2-03 fields. The documented idempotency-key composition is the provisional W3-01 fixture contract; Booking and Charge shall sign the regenerated consumer/provider fixtures before release, while Booking runtime triggering remains out of scope.
12. **FR-12 — Authorization and audit.** The provider and UI shall reuse the approved W2-03 identity, permission and correlation boundaries for local acceptance. Create, edit, approve, successor and evaluation actions shall emit attributable audit evidence without logging secrets or unnecessary commercial payloads.

## Data & Standards Alignment

| Concept | Canonical field/value | Standard or authority |
| --- | --- | --- |
| Rule type | `dndRuleType`: `IMPORT_DEMURRAGE`, `IMPORT_DETENTION`, `EXPORT_DETENTION` | Bilateral Booking↔Charge contract |
| Bounding movement | `moveTypeCode`: `DISC`, `GTOT`, `GTIN` | DCSA Track & Trace v2.2 pinned vocabulary |
| Load state | `emptyIndicatorCode`: `EMPTY`, `LADEN` | DCSA-aligned MovementEvent vocabulary |
| Event time | `eventDateTime` | ISO 8601/RFC 3339 date-time; converted to port-local date for calculation |
| Port | `portLocationCode` | UN/LOCODE |
| Equipment | `equipmentId`, `equipmentType` | Existing platform identity; ISO 6346 where the equipment identifier is a container number |
| Currency | `currency` | ISO 4217; MVP fixture uses `USD` |
| Charge classification | `chargeCode` | LinerCore Reference Data/SMDG-aligned charge-code authority |
| Pricing lineage | `pricingBasis`, `pricingRef`, version identifiers | Approved W2-03 pricing contract |

## Cross-Module Contracts

| Contract | Producer → consumer | Style | W3-01 obligation |
| --- | --- | --- | --- |
| `pricing.result.applicableDndRuleTypes` | Charge → Booking | Synchronous REST, existing `/pricing-requests` | Preserve W2-03 fields and return only trigger metadata: applicable rule type, bound move codes and qualifiers; do not expose free time/rates. |
| `pricing.dnd-request` | Booking → Charge | Synchronous REST, additive `POST /dnd-pricing-requests` | Define the required echoed basis/version, pricing effective date, port, trade lane and equipment inputs plus movements; implement validation, auth/correlation and idempotency. W3-01 proves via fixtures/direct API, not a Booking runtime trigger. |
| `pricing.dnd-result` | Charge → Booking | Synchronous REST response | Return atomic itemised D&D result with basis/reference and calculation/version evidence. |
| `containermovement.status` | Container Movement → Booking | Async, external to W3-01 | Referenced only as the future source of movement facts. Charge shall not consume CMM directly and CMM shall hold no D&D ruleset. |

## Non-Functional Requirements

1. **NFR-01 Performance.** On the isolated warm local stack, D&D evaluation shall meet provisional p99 ≤ 1.5 seconds. Evidence shall state host, build, concurrency, sample size and distribution, and Charge/Booking owners shall accept or revise the provisional target before release; this is not a production SLO.
2. **NFR-02 Reliability.** Calculation shall be deterministic, idempotent and atomic. No stale/guessed/partial charge is permitted; persisted immutable results shall survive normal service restart within existing Compose volumes.
3. **NFR-03 Security.** Local acceptance shall reuse least-privilege W2-03 identities/capabilities and request correlation. Non-local profiles shall fail closed until approved production identity/transport controls exist. Required security gates remain fail-closed; unavailable scanners cannot be reported green.
4. **NFR-04 Observability.** Correlated logs/metrics shall expose request count, outcome, validation/error category and latency without unbounded labels or secrets. Audit evidence shall trace every result to its source versions and request identity.
5. **NFR-05 Quality.** Touched Charge backend and UI production code shall achieve at least 80% changed-line coverage, supplemented by deterministic boundary, versioning, idempotency/concurrency, contract, accessibility and live acceptance evidence.
6. **NFR-06 Accessibility/responsiveness.** UI shall use the shared LinerCore shell and `@erp/ui`, meet WCAG 2.1 AA, remain keyboard-operable with visible focus/announced errors, and pass at 375, 768, 1024 and 1440 pixels in light and dark themes.
7. **NFR-07 Compatibility.** All existing W2-03 contract fixtures and pricing behavior shall remain green. D&D additions within v1 shall be backward compatible for legacy consumers.

## Acceptance Criteria (live behavior)

1. **AC-01 Rule maintenance.** Given an authorised Pricing Analyst on the running Charge UI, when they create and approve each MVP rule type with POL/POD side, UN/LOCODE port, trade lane, equipment type, free days, flat USD daily rate, effective window and exact pricing-basis version, then each immutable approved detail is retrievable through the UI/API with exact DCSA pair, applicability and version evidence.
2. **AC-02 Applicability and overlap.** Given two draft versions with the same pricing-basis version, rule type, derived POL/POD side, port, trade lane and equipment type and overlapping effective windows, when approval is attempted, then activation is blocked with a field-specific validation error. Given one approved rate and a request echoing its exact basis/version, pricing effective date, port, trade lane and equipment type, evaluation validates and uses only that rate.
3. **AC-03 Within free time.** Given five free days and start/end events on the same local date or with an end-local-date epoch difference of five, when evaluated, then the live API returns `elapsedDays` of 0 or 5 respectively, `chargeableDays=0`, `amount=0.00`, and source versions.
4. **AC-04 Beyond free time.** Given start local date 2026-08-04, end local date 2026-08-14, five free days and USD 75/day, when evaluated, then `elapsedDays=10`, `chargeableDays=5`, and the itemised amount is USD 375.00.
5. **AC-05 Port-local boundary.** Given timestamps straddling midnight in the applicable port timezone but not UTC (and vice versa), when evaluated, then elapsed/chargeable days follow the exact local-date formula and the result identifies the timezone basis.
6. **AC-06 Error matrix.** Contract tests exercise malformed, unauthenticated, forbidden, unknown/inapplicable basis/rate, idempotency conflict/in-progress, invalid pair/qualifier/order and unavailable requests and observe the exact FR-06 HTTP/code mapping, correlation evidence, zero persisted result and no partial line.
7. **AC-07 Echoed basis and applicability.** Given Charge originally returned an agreement basis/reference/version, pricing effective date and applicability snapshot, when all values are echoed, then evaluation validates and uses them even if a newer agreement/rate exists; the equivalent tariff case uses the echoed tariff snapshot. A missing/mismatched basis version, effective date, port, trade lane or equipment type returns `404 NO_RATE`, and Charge never switches or infers a basis.
8. **AC-08 Version change.** Given an approved rate and a successor, when a new booking-time pricing result returns the newly effective basis/version and its D&D request echoes it, then evaluation uses the successor; an older echoed basis replays or evaluates against its preserved historical version without mutation.
9. **AC-09 Idempotency.** Given a successful request, when the same documented key and fingerprint are repeated, then the immutable result is replayed; the same key with different content returns `409 IDEMPOTENCY_CONFLICT`; concurrent ownership returns `409 PRICING_IN_PROGRESS`; no second charge is created.
10. **AC-10 UI, authorization and audit.** On the authenticated running route, Playwright verifies list/create/detail, draft edit, approval/successor, version evidence, and loading/empty/denied/validation/error/success states. Unauthorised actions are denied, authorised mutations are attributable in audit evidence, and keyboard/focus/error/contrast/four-breakpoint checks pass.
11. **AC-11 Contract and exit evidence.** Charge provider and Booking consumer fixtures generated from the implemented contract both pass and record dual owner signoff; the isolated Compose demonstration proves rule creation, zero/non-zero evaluation and successor behavior; measured p99 evidence is accepted/revised by owners; existing W2-03 checks, changed-code coverage, `aidlc-audit` and `erp-fidelity-audit` are green. Any required security scanner that did not execute remains blocking/non-green unless an approved policy resolution is recorded.

## Requirements-to-Acceptance Traceability

| Requirement | Acceptance evidence |
| --- | --- |
| FR-01, FR-02 | AC-01, AC-02 |
| FR-03 | AC-01, AC-08, AC-10 |
| FR-04 | AC-07, AC-08 |
| FR-05 | AC-03, AC-04, AC-05 |
| FR-06 | AC-06 |
| FR-07 | AC-03, AC-04, AC-05, AC-07 |
| FR-08 | AC-09 |
| FR-09 | AC-10 |
| FR-10 | AC-08 |
| FR-11 | AC-11 |
| FR-12 | AC-06, AC-10, AC-11 |

## Assumptions & Constraints

- W2-03 Rate/RateVersion, Agreement/AgreementVersion, pricing authority, identity boundary and `pricing.v1` behavior are approved and must not be replaced.
- The MVP supports the three bilateral rule types, at least one real UN/LOCODE port and USD, with flat rates and calendar-day counting by port-local dates.
- The port timezone is authoritative reference data available to Charge during validation/evaluation; holiday datasets are not required because holidays are ordinary calendar days.
- Booking runtime trigger, invoice/waiver/dispute workflow, CMM integration, working-day/holiday calendars, tiered rates, per-customer overrides beyond agreement linkage, optimisation and external distribution are out of scope.
- `pricing.dnd-request` contract additions require Charge provider and Booking consumer co-review, even though Booking runtime wiring is W3-02.
- Local Compose evidence does not establish production availability, capacity, backup, disaster recovery, cloud deployment or legal invoice compliance.

## Out of Scope

- Generic combined D&D rule type or arbitrary user-defined movement pairs.
- Progressive/tiered rates, working-day calculations and holiday exclusions.
- Booking movement recognition/triggering, invoicing, manual D&D case workflow, waiver, dispute and settlement.
- Direct Charge↔Container Movement coupling or any D&D ruleset in Container Movement.
- New service, shared database, new AWS resource, external D&D platform or external calendar provider.
- Redesign of the shared shell, `packages/ui`, Booking routes or non-Charge module UX.

## Open Questions

1. Any requirement blocked on a deferred enterprise decision?
   - A. None — all inputs available
   - B. Yes — release evidence is blocked until the required security-scanner gate actually executes or an approved policy resolution is recorded; DevSecOps/program ownership must resolve it. The provisional 1.5-second p99 is confirmed only through Milestone/live measurement. (selected)
   - X. Other
   - `[Answer]: B — carry the security-gate resolution and measured p99 confirmation as explicit release dependencies; neither blocks Requirements approval.`
