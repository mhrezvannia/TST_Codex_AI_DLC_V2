# Intent Statement — W2-03 Charge Tariffs & Agreements

## Intent

Charge becomes a real pricing authority: **tariffs, surcharges, and local charges** exist as owned data, agreements version against them, and a booking quote is computed from them (not a hardcoded figure) — returned over the existing sync seam. **Driver: Charge team.**

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §4 Charge module profile (owned capabilities/data)
2. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md` (`pricing.request`/`pricing.result` shapes)
3. `docs/erp-business-ui-gap-analysis.md` Part 1.2 (tariff/surcharge = 0 in code)
4. `services/charge-agreement-service/` (existing agreement lifecycle — build on it)
5. W0-02 outputs: charge-code + currency reference sets
6. `design-system/linercore/MASTER.md` and `design-system/linercore/SESSION-PROMPT.md` (binding shared UI/UX contract)

## Vertical Slice Definition

One priced booking end-to-end: define a tariff (base ocean freight per trade-lane × equipment-type) + one surcharge + one local charge → attach to an approved agreement → Booking's live `pricing.request` returns an **itemised breakdown** computed from them → visible in the Charge UI and consumed by Booking.

- **Thinnest viable form:** one trade lane, one equipment type, flat per-container rates, one surcharge (e.g. BAF), one local charge (e.g. THC at POL), USD only.
- **Deferred:** D&D rules/rates (W3-01), multi-currency exchange application, complex tariff dimensions (weight bands, commodity classes).

## In Scope / Out of Scope

- **In:** tariff/surcharge/local-charge aggregates + persistence + APIs; agreement links rates; quote calculation engine (itemised lines with charge-codes); `pricing.result` carries the real breakdown per the bilateral contract; Charge UI sections to view/maintain them.
- **Out:** quotations as standalone documents; rebates; D&D.

## Actors & Journey

Pricing analyst defines tariff + surcharges → attaches to customer agreement → approves. Booking prices a matching booking → itemised quote returns; non-matching booking → correct no-rate/manual outcome.

## Cross-Module Seams (must be real)

`pricing.request`/`pricing.result` — the live sync seam W1-01 already exercises; this intent changes the *result content* (real breakdown), so the pact/fixtures update with **dual sign-off** (Charge produces, Booking consumes).

## Standards Alignment

Charge-codes from the Shared Platform reference set; ISO 4217 currency; field names per the bilateral contract (no renames).

## Definition of Done (observed, not "tests pass")

On live Compose: (1) create tariff+surcharge+local charge in the running Charge UI; (2) approve an agreement referencing them; (3) drive a booking through W1-01's flow → the stored pricing snapshot shows the **computed itemised breakdown** (lines match the defined rates); (4) change a rate, reprice → new quote reflects it; (5) booking outside the trade lane → `MANUAL_PRICING_REQUIRED` path observed; (6) both audits green.

## Dependencies

W0-02 (charge-code/currency sets). Consumes W1-01's live flow for the DoD (closed by then per wave plan).

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) tariff aggregate→API→UI end-to-end; (U02) surcharge + local charge; (U03) agreement↔rates linkage + versioning; (U04) quote engine wired into `pricing.result` + Booking-visible breakdown.

## Open Questions

1. Rate matching dimensions for MVP tariffs?
   - A. trade-lane × equipment-type (recommended thinnest)
   - B. + commodity class
   - C. + weight bands
   - X. Other
   - `[Answer]:` A — trade-lane × equipment-type (thinnest); commodity/weight dimensions deferred.
