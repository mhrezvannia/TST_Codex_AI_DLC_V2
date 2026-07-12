# Intent Statement — W3-01 D&D Rules & Rates

## Intent

Charge owns a real, authoritative **D&D ruleset**: rule types defined as start/end DCSA move-code pairs, with free time and daily rates by port/trade — maintainable in the Charge UI and evaluable by the pricing engine. **Driver: Charge team.**

## Context Pack (read before starting)

1. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md` (`pricing.dnd-request`/`-result`; the confirmed DCSA move codes DISC/GTOT/GTIN as bounding pairs)
2. `docs/program-vision-document.md` §4 Charge profile (D&D rule type + rate ownership; CMM explicitly holds **no** ruleset)
3. W2-03 outputs (tariff/agreement model to hang rates on)

## Vertical Slice Definition

One rule evaluated end-to-end: define a rule type (e.g. demurrage = DISC→GTOT) + a rate (free days + daily rate for a port) → evaluation service computes chargeable days from a supplied movement-event pair → itemised D&D result returned by the (internal) engine — proven live via the Charge UI/API before Booking wires in (W3-02).

- **Thinnest viable form:** the three MVP rule types from the contract (demurrage DISC→GTOT, detention GTOT→GTIN, combined), one port, USD, calendar-day counting.
- **Deferred:** working-day calendars/holidays, tiered rates, per-customer overrides beyond the agreement link.

## In Scope / Out of Scope

- **In:** rule-type + rate aggregates, persistence, APIs, Charge UI maintenance screens, evaluation engine (move pair + timestamps → chargeable days → lines), agreement linkage.
- **Out:** the Booking trigger and invoice (W3-02); any CMM coupling (forbidden by the context map).

## Actors & Journey

Pricing analyst defines rule types + rates on an agreement; the engine evaluates a movement pair; W3-02's Booking flow becomes the live consumer.

## Cross-Module Seams (must be real)

None cross yet — this intent prepares the provider side of `pricing.dnd-request`. The contract fixtures update with dual sign-off; W3-02 verifies live.

## Standards Alignment

Bounding moves expressed as **DCSA move codes** (enum per the bilateral contract: DISC, GTOT, GTIN); ISO 4217; charge-codes from reference data.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) create rule types + rates in the running Charge UI; (2) POST a movement pair to the D&D evaluation API → itemised result with correct chargeable days (boundary cases: within free time → zero; spanning free time → correct remainder); (3) rate change re-evaluates correctly; (4) fixtures for `pricing.dnd-request/-result` regenerated from the real engine and signed off by Booking.

## Dependencies

W2-03 (agreement/rate substrate).

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) rule-type aggregate + UI end-to-end; (U02) rates + agreement link; (U03) evaluation engine + API + contract fixtures.

## Open Questions

1. Day-counting basis for MVP?
   - A. Calendar days, port-local dates (recommended thinnest)
   - B. Calendar days, UTC
   - C. Working-day calendar now
   - X. Other
   - `[Answer]:` A — calendar days, port-local dates; working-day calendars deferred.
