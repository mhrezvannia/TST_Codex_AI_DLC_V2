# Business Logic Model - dnd-exact-historical-calculation

## Source authority and predecessor contract

This design refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. U03 consumes U01's signed contract/schema and U02's immutable lifecycle/trigger evidence without modifying either.

The Unit completes exact Agreement/Tariff, old/successor and timezone-boundary calculations. It never selects current authority or adds a browser calculation action.

## Exact evidence resolution algorithm

1. Receive an already authenticated, authorised, claimed `DndPricingCommand` with exact echoed `pricingRequestId`, basis/reference/version/effective date, derived-side port, trade lane and equipment type.
2. Load the immutable `STANDARD_PRICING` terminal receipt by exact receipt/idempotency identity.
3. Require a 200 `PRICED` `pricing.v1` terminal response, complete typed original-request evidence, and one stored structured `applicableDndRuleTypes` item whose rule type and fixed start/end codes/qualifiers exactly match the requested `dndRuleType`.
4. Compare booking reference, basis, reference, basis-version id and effective date byte/typed-value exactly.
5. Compare echoed applicability against the immutable request:
   - import rule -> echoed port equals original POD;
   - export detention -> echoed port equals original POL;
   - trade lane and equipment type equal the stored typed values.
6. Resolve preserved source evidence:
   - Agreement -> exact AgreementVersion id and stored source RateVersion ids;
   - Tariff -> exact ordered BASE/SURCHARGE/LOCAL RateVersion ids whose deterministic composite equals the echoed version id.
7. Load the exact Approved D&D version matching every dimension and `pricingEffectiveDate`.
8. Any absent, incomplete, inactive or mismatched fact, including missing/mismatched stored trigger membership, returns `404 NO_RATE`. No reconstruction, current lookup, nearest version or successor upgrade occurs.

## Port-local calculation algorithm

1. Validate the requested fixed pair, qualifiers and end-instant-not-before-start entirely from the request and exact terms. A semantic failure is `422 PRICING_VALIDATION` before any timezone dependency can fail.
2. Resolve the active IANA `ZoneId` for `portLocationCode` through Reference Data.
3. Convert both already-validated `Instant` values to `LocalDate` using the same zone.
4. Calculate epoch-day difference with a zero floor.
5. Subtract immutable `freeDays` with a zero floor.
6. Multiply non-negative scale-two `flatDailyRate` by integral `chargeableDays` using exact decimal arithmetic.
7. Construct exactly one immutable charge line, including zero values.
8. Attach exact terms, basis/source version, timezone, timestamps and correlation evidence.
9. Complete under the existing owner fence; stale ownership never publishes the new calculation.

Reference cases:

| Start/end local-date difference | Free days | Rate | Expected elapsed/chargeable/amount |
| --- | --- | --- | --- |
| 0 | 5 | USD 75.00 | `0 / 0 / USD 0.00` |
| 5 | 5 | USD 75.00 | `5 / 0 / USD 0.00` |
| 10 | 5 | USD 75.00 | `10 / 5 / USD 375.00` |

Weekends and holidays remain ordinary dates. No working-day calendar, band selection or rounding-policy discovery is invoked.

## Version scenarios

| Scenario | Required behavior |
| --- | --- |
| Old Agreement receipt after successor becomes current | Use exact old AgreementVersion and old D&D terms |
| Fresh successor Agreement receipt | Use linked successor version |
| Old Tariff composite | Validate exact ordered preserved RateVersions and use old terms |
| Incomplete pre-W3 receipt | `404 NO_RATE`, no reconstruction |
| UTC crosses midnight but local does not | Same local date -> zero elapsed |
| Local crosses midnight but UTC does not | Epoch-day difference follows local dates |
| Reference timezone missing/malformed | `503 PRICING_UNAVAILABLE`, no calculation |

## Provider and UI evidence flow

The result renderer emits exact source ids, `portTimeZoneId`, elapsed/free/chargeable days, flat rate and amount. The authorised existing detail/audit composition consumes a bounded projection of these facts. It labels selected/current historical versions and timezone in text, keeps raw payload secondary and exposes no evaluation form/simulator.

The UI view does not recalculate money or dates. It renders provider facts and links exact immutable terms/basis versions. Any mismatch between UI facts and the provider result is a failed acceptance condition.

## Performance measurement hook

The focused warm-local harness records host, build, concurrency, warm-up, sample population, distribution and p99. The harness observation is U03 evidence; accepting or revising the provisional 1.5-second target remains an intent-exit owner decision and is not represented as a production SLO.

## Transaction and failure boundaries

- Evidence and timezone reads happen before calculation completion and outside approval locks.
- Success result and success evidence commit atomically with the owned D&D receipt.
- Handled post-claim `404`, `422` or `503` uses one owner-fenced `releaseAndAppendOwnedFailure` transaction. If ownership is lost, that transaction writes no attempt row; the application classifies the winner and appends exactly the final externally returned disposition. U04 completes breadth/race proof.
- Restart must preserve exact receipts, terms and source evidence in existing Compose volumes.

## Review History - Iteration 1 (superseded)

**Verdict: NOT-READY**

1. **BLOCKER - the calculation algorithm returns the wrong winner under combined semantic/dependency failure.** It resolves the port timezone before rejecting end-before-start, and U01 similarly calls the timezone provider before validating the fixed pair/qualifiers. The approved precedence is exact evidence/rate -> semantic `422` -> dependency `503`; an unavailable timezone must not mask an invalid pair, qualifier or instant order. Perform every timezone-independent movement check first, then resolve `ZoneId`, convert dates and calculate.
2. **BLOCKER - historical evidence validation does not prove that the requested rule was advertised in the immutable Standard result.** Steps 3-6 compare booking/basis/version/date and stored request applicability, but do not require the echoed `dndRuleType` and fixed movement bounds to match one stored `applicableDndRuleTypes` item. This permits an exact terms lookup for a rule absent from the booking-time trigger snapshot. Add this exact structured membership comparison and return `404 NO_RATE` when it is absent or mismatched.
3. **BLOCKER - post-claim failure evidence is finalized before owner-release winner classification.** The design records a `404`/`422`/`503` disposition and then releases; a lost owner fence requires winner classification, which may change the final response to replay/conflict/in-progress. Append-only attempt evidence would then contradict the response. Specify an owner-fenced atomic release-plus-evidence operation, or classify the winner first on a lost fence and persist only the final disposition.
The pure calendar-day formula, zero-line behavior, historical no-reselection rule, version links and evidence-only UI ownership are coherent. Required sections/upstream coverage passed; linter/type-check path filtering is not applicable to these Markdown artifacts.

## Review

**Verdict: READY**

All iteration-1 blockers are resolved: timezone-independent movement semantics precede Reference Data; stored `applicableDndRuleTypes` membership and fixed bounds are exact and fail as `404 NO_RATE`; handled failure uses owner-fenced atomic release-plus-final-evidence with lost-fence classification before the one final append. Exact Agreement/Tariff history, calculation, transaction and UI evidence boundaries are implementable without reopening U01/U02 ownership. Required-sections and upstream-coverage passed; linter/type-check remain not applicable.
