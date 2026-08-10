# Requirements Analysis Questions - W3-01 D&D Rules & Rates

**Inputs:** [intent statement](../../ideation/intent-capture/intent-statement.md), [scope document](../../ideation/scope-definition/scope-document.md), [business overview](../../../codekb/TST_Codex_W3-01/business-overview.md), [architecture](../../../codekb/TST_Codex_W3-01/architecture.md), [code structure](../../../codekb/TST_Codex_W3-01/code-structure.md), and [team practices](../practices-discovery/team-practices.md)

## Q1. MVP rule types

Which rule-type set is authoritative for W3-01?

- A. The bilateral contract set: import demurrage DISC-laden to GTOT-laden, import detention GTOT-laden to GTIN-empty, and export detention GTOT-empty to GTIN-laden (recommended)
- B. Import demurrage, import detention, and one generic combined rule
- C. Import demurrage only
- D. Allow arbitrary DCSA move-code pairs in the MVP
- X. Other (please specify)

`[Answer]: Bilateral contract set (Recommended)`

## Q2. Rate structure and day counting

What charging model should the MVP implement?

- A. One non-negative free-time allowance plus one flat daily rate; charge calendar days by port-local dates, including weekends/holidays; defer tiers and working-day calendars (recommended)
- B. Progressive/tiered daily rates now
- C. Working-day and holiday calendars now
- D. UTC elapsed 24-hour periods
- X. Other (please specify)

`[Answer]: Flat, port-local days (Recommended)`

## Q3. Initial booking-time pricing-basis resolution

How should the initial booking-time pricing result select the basis that Booking later echoes for D&D?

- A. During initial booking-time pricing only, resolve an applicable approved agreement version first and fall back to an applicable approved tariff/rate version; preserve the exact discriminated basis/version lineage for later D&D echo and validation (recommended)
- B. Agreements only; no tariff fallback
- C. Tariffs only
- D. Let the caller choose any current rule without validating the supplied pricing reference
- X. Other (please specify)

`[Answer]: Initial booking-time agreement then tariff (Recommended); D&D evaluation itself follows Q7 and never re-selects the basis.`

## Q4. Version and reevaluation behavior

How should rule/rate changes affect evaluation?

- A. Approved versions are immutable; changes create successors; each evaluation records the exact rule/rate/agreement-or-tariff versions, and re-evaluation against a changed approved basis uses the newly effective version only when the request's basis/reference and effective date resolve to it (recommended)
- B. Edit approved rates in place and always use latest
- C. Copy rates into Booking
- D. Return an amount without source-version evidence
- X. Other (please specify)

`[Answer]: Immutable attribution (Recommended)`

## Q5. Provider failure and idempotency semantics

Which API behavior should the provider expose?

- A. Additive `POST /dnd-pricing-requests`; idempotency key is bookingId + equipmentId + closingMovementEventId; same key/fingerprint replays the immutable result, conflict is distinct, 4xx is not retried, and partial charges are forbidden (recommended)
- B. Reuse `/pricing-requests` without a distinct D&D operation
- C. Make evaluation non-idempotent
- D. Return partial charges when one line fails
- X. Other (please specify)

`[Answer]: Additive idempotent endpoint (Recommended)`

## Q6. Exact day-count formula

Which formula should determine elapsed and chargeable days?

- A. `elapsedDays = max(0, endPortLocalDate - startPortLocalDate)` in whole date boundaries; same local date is 0; `chargeableDays = max(0, elapsedDays - freeDays)` (recommended)
- B. Count both start and end dates inclusively
- C. Round elapsed hours up to 24-hour periods
- D. Use UTC date boundaries
- X. Other (please specify)

`[Answer]: Local date boundaries (Recommended)`

## Q7. Echoed pricing basis

What must Charge do with `pricingBasis`/`pricingRef` on a D&D request?

- A. Validate and price against the exact echoed agreement/tariff basis originally returned by Charge; never re-select a different basis during D&D evaluation (recommended)
- B. Ignore the echoed reference and independently choose agreement-first again
- C. Always switch to the currently latest agreement
- D. Accept any caller-supplied reference without validation
- X. Other (please specify)

`[Answer]: Validate exact echo (Recommended)`

## Q8. Rate applicability and overlap

How should a D&D rate be selected deterministically?

- A. Require the D&D request to echo the exact pricing-basis version, original pricing effective date, rule type, applicable port, trade lane and equipment type; derive POL/POD side from rule type, validate all fields against the immutable basis snapshot, and reject overlapping approved rate windows at activation (recommended)
- B. Match port only and choose the latest record
- C. Match trade lane only
- D. Allow multiple matches and sum them
- X. Other (please specify)

`[Answer]: Exact echoed applicability inputs and unique approved match (Recommended)`

## Q9. Exact error mapping

Which provider error mapping should be binding?

- A. 400 `PRICING_BAD_REQUEST` malformed; 401/403 identity/permission; 404 `NO_RATE` unknown/inapplicable echoed basis or no D&D rate; 409 `IDEMPOTENCY_CONFLICT`/`PRICING_IN_PROGRESS`; 422 `PRICING_VALIDATION` invalid pair/qualifier/order/semantics; 503 `PRICING_UNAVAILABLE`; every failure persists no charge result (recommended)
- B. Return 400 for every client failure
- C. Return 200 with an error line
- D. Leave statuses implementation-defined
- X. Other (please specify)

`[Answer]: Exact HTTP/code map (Recommended)`

## Q10. Provisional bilateral decisions

How should p99 and idempotency composition be treated while the bilateral contract remains draft?

- A. Adopt p99 ≤1.5 s as a provisional local acceptance target and the documented key composition as W3-01's fixture contract; require Charge/Booking dual sign-off before release, with measured p99 evidence (recommended)
- B. Treat both as final production commitments now
- C. Remove both from W3-01
- D. Defer the provider endpoint until the entire bilateral document is signed
- X. Other (please specify)

`[Answer]: Provisional plus signoff (Recommended)`

## Q11. Calculation preview UI

Should W3-01 include an operator calculation-preview panel?

- A. Remove it from mandatory scope; the Charge UI maintains rules/rates and shows version/audit evidence, while direct API/live acceptance proves evaluation (recommended)
- B. Keep a calculation-preview panel as a mandatory Pricing Analyst workflow
- C. Move the preview into Booking
- D. Replace maintenance UI with a calculator-only page
- X. Other (please specify)

`[Answer]: Remove mandatory preview (Recommended)`
