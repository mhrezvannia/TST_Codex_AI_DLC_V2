# Business Rules - dnd-exact-historical-calculation

## Source authority

Rules refine approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. Exact preserved evidence always outranks current authority or convenience fallback.

## Historical evidence rules

| ID | Rule |
| --- | --- |
| U03-R01 | `pricingRequestId` identifies the exact immutable `STANDARD_PRICING` terminal receipt. |
| U03-R02 | Receipt status/schema must be 200 `PRICED`/`pricing.v1`; manual, failed or partial records are not D&D authority. |
| U03-R03 | Booking, basis, reference, basis version and effective date must equal the echoed values exactly. |
| U03-R04 | Import port is the preserved POD; export-detention port is the preserved POL; lane/equipment also match exactly. |
| U03-R05 | Agreement requires exact AgreementVersion and source RateVersion evidence. |
| U03-R06 | Tariff requires the preserved ordered BASE/SURCHARGE/LOCAL source RateVersions and deterministic composite id. |
| U03-R07 | Pre-W3/incomplete/mismatched/inactive evidence is `404 NO_RATE`. Reconstruction or current selection is forbidden. |
| U03-R08 | Exact Approved D&D terms are selected by all applicability dimensions and `pricingEffectiveDate`; nearest/newest selection is forbidden. |
| U03-R08A | Requested `dndRuleType` and its derived fixed bounds must exactly match one structured item stored in the Standard receipt's `applicableDndRuleTypes`; absence/mismatch is `404 NO_RATE`. |

## Calculation rules

| ID | Rule |
| --- | --- |
| U03-R09 | Fixed pair, qualifiers and instant order validate before timezone lookup; then both instants convert through the same authoritative port `ZoneId`. |
| U03-R10 | `elapsedDays` is non-negative local epoch-day difference. |
| U03-R11 | `chargeableDays` is `max(0, elapsedDays-freeDays)`. |
| U03-R12 | Amount is exact non-negative scale-two daily rate multiplied by integral chargeable days. |
| U03-R13 | Same-local-date and within-free-time outcomes return an explicit one-line zero result. |
| U03-R14 | Weekends/holidays are included; working-day logic and progressive bands are forbidden. |
| U03-R15 | End-before-start, wrong code or wrong qualifier is `422 PRICING_VALIDATION`, never normalized. |
| U03-R16 | Missing/malformed timezone authority is `503`; mismatched/inactive echoed port remains `404 NO_RATE`. |

## Result evidence rules

- Every success names exact D&D aggregate/version, basis/reference/version, applicable source RateVersions, port/timezone, movements, calculation fields, `calculatedAt` and correlation.
- No inapplicable source id is fabricated. Agreement and Tariff evidence use discriminated shapes.
- Result contains exactly one charge item with currency, charge code, free/elapsed/chargeable days, rate and amount.
- Replay bytes remain immutable. The UI renders provider facts and cannot recompute or alter them.
- Raw payloads, tokens and unbounded commercial identifiers remain outside primary UI/log metrics.

## UI rules

- Use existing `/charge-agreements/dnd/terms/[dndTermsId]?version=...` and authorised audit/detail composition.
- Show selected/current/source/timezone meanings with text and links; do not depend on color.
- There is no calculation preview, simulation command or Booking/CMM trigger action.
- Scoped evidence unavailable state preserves already-known authorised terms facts and offers Retry only for the affected section.

## Acceptance constraints

The Unit is incomplete until live Agreement and Tariff old/successor numeric/timezone cases survive restart and match the provider/UI evidence. Focused test results and performance samples support but cannot replace this observation. The provisional p99 requires later named-owner acceptance or revision.
