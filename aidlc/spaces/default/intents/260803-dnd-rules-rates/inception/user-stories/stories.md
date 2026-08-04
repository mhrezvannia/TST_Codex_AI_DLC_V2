# User Stories - W3-01 D&D Rules & Rates

**Inputs:** [requirements.md](../requirements-analysis/requirements.md), [business-overview.md](../../../codekb/TST_Codex_W3-01/business-overview.md), [component-inventory.md](../../../codekb/TST_Codex_W3-01/component-inventory.md), and [team-practices.md](../practices-discovery/team-practices.md)

## US-01 — Author deterministic D&D terms

**Story:** As a **Pricing Analyst**, I want to create a validated D&D rule/rate draft with exact applicability, so that Charge has an authoritative commercial term ready for controlled approval.

**Priority:** Must Have  
**Requirements:** FR-01, FR-02, FR-09, FR-12; NFR-03, NFR-06

**Acceptance criteria:**

1. Given the authorised shared Charge route, when the analyst creates any of the three MVP rule types, then the fixed DCSA code/qualifier pair is displayed and cannot be redefined arbitrarily.
2. Given a draft, when the analyst enters exact basis version, POL/POD-derived port side, UN/LOCODE port, trade lane, equipment type, pricing effective window, free days, flat daily rate, currency and charge code, then valid input persists and is retrievable from the stable detail route.
3. Given an overlapping equally applicable approved window or any negative/invalid term, when save/approval validation runs, then it identifies the exact field/conflict, preserves entered data and does not activate the draft.
4. Given loading, empty, denied, validation, service-error and success conditions at required breakpoints, when exercised by keyboard, then LinerCore focus, labels, announcements, contrast and responsive behavior meet the approved UI requirements.

**Dependencies:** W2-03 pricing substrate and reference data.  
**INVEST:** Valuable rule-authoring outcome; independently demonstrable as a validated draft; small enough for one vertical slice; testable through UI/API/persistence.

## US-02 — Govern immutable commercial versions

**Story:** As a **Pricing Analyst**, I want approved D&D terms to be immutable and changed through successors, so that historical and newly effective pricing remain attributable and safe.

**Priority:** Must Have  
**Requirements:** FR-03, FR-10, FR-12; NFR-02, NFR-07

**Acceptance criteria:**

1. Given a valid draft and required permission, when approved, then it becomes immutable and the UI replaces draft-save actions with `Create successor`.
2. Given an approved version, when any direct UI/API mutation is attempted, then the operation is denied without changing persisted history and an attributable audit outcome is recorded.
3. Given a successor with a later approved effective window, when booking-time pricing returns that new snapshot, then a D&D request echoing it uses the linked successor rate; an older echoed snapshot continues to use its historical version.
4. Given list/detail/history views, when an authorised Pricing Analyst inspects an active aggregate, then predecessor/successor, status, effective window, actor/time and exact basis/rate lineage are visible; the active version exposes no in-place mutation action.
5. Given an approved applicable rule, when booking-time `pricing.result` is produced, then `applicableDndRuleTypes` contains only rule identifier, fixed start/end DCSA codes and qualifiers; it excludes free days and daily rates.

**Dependencies:** US-01.  
**INVEST:** Delivers lifecycle governance independently; negotiable implementation, fixed immutability outcome; directly testable at UI/API/persistence/audit boundaries.

## US-03 — Calculate an exact echoed pricing snapshot

**Story:** As a **Pricing Analyst**, I want Charge to calculate D&D from the exact booking-time pricing snapshot and qualified movements, so that the happy-path amount is correct, reproducible and never silently repriced.

**Priority:** Must Have  
**Requirements:** FR-04, FR-05, FR-07, FR-10; NFR-01, NFR-02

**Acceptance criteria:**

1. Given an exact echoed basis/reference/version, pricing effective date, port, trade lane, equipment type and valid qualified movement pair, when posted to `/dnd-pricing-requests`, then Charge validates rather than re-selects the snapshot and returns the matching rule/rate versions.
2. Given start/end port-local dates with epoch difference 0, 5 or 10 and five free days at USD 75/day, when evaluated, then elapsed/chargeable days and amounts are respectively `0/0/USD 0`, `5/0/USD 0`, and `10/5/USD 375`.
3. Given a timezone case where local and UTC dates differ, when evaluated, then the exact port-local formula is applied and timezone/source evidence is returned.
4. Given a successor snapshot returned by subsequent booking-time pricing, when echoed, then evaluation uses the successor; an older echoed snapshot continues to use its historical preserved version.
5. Given a recorded warm local test profile, when the happy-path evaluator is sampled, then provisional p99 ≤1.5 seconds is measured with host, build, concurrency, sample size and distribution for owner acceptance/revision.

**Dependencies:** US-01 and US-02; additive bilateral fixture agreement.  
**INVEST:** A bounded happy-path provider calculation outcome; error/replay/contract hardening is separated into US-04, making this independently estimable and executable through direct API/live tests.

## US-04 — Handle evaluation attempts safely

**Story:** As a **Pricing Analyst**, I want failed, concurrent and repeated D&D evaluation attempts to have deterministic dispositions, so that Charge never creates a duplicate, partial or guessed charge.

**Priority:** Must Have  
**Requirements:** FR-06, FR-08, FR-12; NFR-02, NFR-03, NFR-04

**Acceptance criteria:**

1. Given malformed, unauthenticated, forbidden, unknown/inapplicable snapshot, invalid pair/qualifier/order or unavailable input, when posted, then the exact FR-06 HTTP/code is returned with correlation evidence, no persisted failed result and no partial charge.
2. Given a successful request, when the same documented idempotency key and fingerprint is repeated, then the immutable result is replayed; different content returns `409 IDEMPOTENCY_CONFLICT`, concurrent ownership returns `409 PRICING_IN_PROGRESS`, and no duplicate charge is created.
3. Given an evaluation attempt, when bounded operational evidence is inspected through the existing authorised audit boundary, then evidence is outcome-specific: success/replay records result identity, source versions, calculation and correlation; malformed/auth/validation records request identity, code and correlation without nonexistent source versions; no-rate records echoed applicability and reason without a rate version/calculation; conflict/in-progress records key fingerprint/disposition without duplicate result; unavailable records attempt/correlation/outcome. No evidence exposes secrets or raw payloads as the primary workflow.

**Dependencies:** US-02 and US-03.  
**INVEST:** One cohesive provider-safety outcome for the same real persona; independently demonstrable after the happy path and estimable through bounded error, idempotency/concurrency and disposition-evidence scenarios. Bilateral compatibility/signoff remains an intent-level verification gate.

## Story relationships and release constraints

```text
US-01 Author draft -> US-02 Govern versions -> US-03 Calculate snapshot -> US-04 Handle attempts safely
```

The sequence is dependency/risk-first, not a horizontal component plan. The four stories do not replace mandatory intent-level release gates: ≥80% changed-line coverage for touched Charge code, direct API and contract tests, Playwright accessibility, isolated live Compose behavior, provisional p99 evidence with owner acceptance, dual fixture signoff, existing W2-03 preservation, required security-gate resolution, `aidlc-audit`, and `erp-fidelity-audit` must all be green before release.

## Coverage assessment

| Requirement group | Story coverage |
| --- | --- |
| FR-01, FR-02 | US-01 |
| FR-03, FR-09, FR-10 | US-01, US-02 |
| FR-04, FR-05, FR-07, FR-10 | US-03 |
| FR-06, FR-08, FR-12 | US-04 |
| FR-11 | US-02 AC5 plus intent verification RV-05 |
| NFR-01 | US-03 AC5 |
| NFR-02, NFR-04 | US-03; US-04 AC2–AC3 |
| NFR-03 | US-01 AC4; US-04 AC1 and release verification RV-03 |
| NFR-05 | Release verification RV-01 |
| NFR-06 | US-01 AC4 |
| NFR-07 | US-02 AC5; US-04 AC4 |

## Intent-level verification mapping

| ID | Verification retained outside an INVEST story | Evidence |
| --- | --- | --- |
| RV-01 | ≥80% changed-line coverage for touched Charge backend/UI | Changed-file coverage report plus focused unit/component results |
| RV-02 | Isolated live vertical and visual/a11y proof | Compose demonstration, Playwright at four breakpoints, zero/non-zero/successor flows |
| RV-03 | Required security gate is operational or has approved policy resolution | Fail-closed scanner/policy evidence; no false green claim |
| RV-04 | Intent audit and ERP fidelity | `aidlc-audit` and `erp-fidelity-audit` green |
| RV-05 | Additive bilateral endpoint/result compatibility and owner signoff | Charge provider and Booking consumer fixtures cover echoed applicability, atomic result, exact errors and metadata-only `applicableDndRuleTypes`; existing W2-03 fixtures stay green and both owners sign |
