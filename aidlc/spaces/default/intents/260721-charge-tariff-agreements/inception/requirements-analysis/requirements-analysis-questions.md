# Requirements Analysis Questions — W2-03 Charge Tariffs & Agreements

These questions cover only unresolved details after reading `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, `team-practices.md`, and the bilateral Booking↔Charge contract.

## Q1. Pricing business date

Which date determines effective agreement and rate versions for booking-time pricing and repricing?

- A. Use `dates.requestedDepartureDate` from the frozen `pricing.request`; reject it when missing/invalid and never substitute wall-clock time (recommended)
- B. Use Charge server current date/time
- C. Let the Pricing Analyst select a date during each Booking pricing action
- X. Other (please specify)
- `[Answer]:` A — Requested departure (Recommended)

## Q2. Pricing-basis precedence

How should Charge resolve agreement versus tariff authority?

- A. Prefer one applicable approved customer-agreement version; if none exists, fall back to one applicable approved tariff version; return `NO_RATE` only when neither resolves (recommended, contract-aligned)
- B. Require a customer agreement for every automatic price and never use tariff fallback
- C. Prefer a public/general tariff even when an applicable customer agreement exists
- X. Other (please specify)
- `[Answer]:` A — Agreement then tariff (Recommended)

## Q3. Approved-version overlap and ambiguity

How should overlapping approved versions be handled?

- A. Reject approval that would create overlapping active agreement or standalone-rate authorities for the same matching key/date; if legacy/concurrent data is still ambiguous at runtime, create a manual case and return manual-pricing semantics (recommended)
- B. Select whichever matching version was approved most recently
- C. Sum every overlapping matching version
- X. Other (please specify)
- `[Answer]:` A — Reject and manual (Recommended)

## Q4. USD precision and rounding

Which money rule should govern rates, lines, and totals in this thin slice?

- A. Accept non-negative USD values at two decimal places, calculate each line as unit rate × positive integer equipment quantity, round each line HALF_UP to two decimals, and total the rounded lines (recommended)
- B. Retain arbitrary decimal precision and round only the UI total
- C. Truncate rather than round fractional cents
- X. Other (please specify)
- `[Answer]:` A — Two decimals HALF_UP (Recommended)

## Q5. Repricing trigger and history

When should Booking request a new price?

- A. A pricing-affecting amendment advances the amendment sequence and enables an explicit Booking reprice action; the new idempotent request stores a new snapshot while every prior snapshot remains immutable, and non-pricing changes do not trigger repricing (recommended, contract-aligned)
- B. Automatically overwrite the current snapshot whenever any Booking field changes
- C. Reprice only when a Pricing Analyst changes a rate, regardless of Booking revision
- X. Other (please specify)
- `[Answer]:` A — Pricing amendment (Recommended)

## Q6. Manual-case depth

How much manual-pricing workflow belongs in W2-03?

- A. Persist and expose an OPEN Charge manual case with reason/request/correlation/Booking evidence and show Booking `MANUAL_PRICING_REQUIRED`; assignment, manual quote entry, resolution, and closure are deferred (recommended)
- B. Add full assignment, manual quote, approval, resolution, and closure workflow now
- C. Do not persist a Charge manual case; show only a transient Booking message
- X. Other (please specify)
- `[Answer]:` A — Evidence-only case (Recommended)

## Q7. Pricing latency requirement

How should the bilateral document's unconfirmed 800 ms booking-time p99 target be treated?

- A. Use p99 ≤ 800 ms as a provisional local acceptance target for warm known-rate and no-rate calls, record measured evidence, and keep production SLO approval explicitly open (recommended)
- B. Declare 800 ms as a proven production SLO without measurement
- C. Set no measurable latency target for W2-03
- X. Other (please specify)
- `[Answer]:` A — Provisional target (Recommended)

## Q8. Canonical API authority

Which pricing contract should W2-03 evolve?

- A. Treat `contracts/openapi/pricing.v1.yaml` and `POST /pricing-requests` as canonical; make only backward-compatible additive fields with Charge/Booking sign-off, and mark divergent legacy pricing paths non-authoritative without expanding D&D (recommended)
- B. Replace the canonical endpoint with legacy `/api/pricing/quote`
- C. Maintain two independently evolving pricing authorities
- X. Other (please specify)
- `[Answer]:` A — pricing.v1 canonical (Recommended)
