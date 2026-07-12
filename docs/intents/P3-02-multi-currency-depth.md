# Intent Statement — P3-02 Multi-Currency Depth

> **Phase 3.** Answers provisional (recommended defaults) — reconfirm at Phase 3 start.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §4 (Currency/Exchange owned by Shared Platform; Charge applies currency/exchange)
2. W2-03 outputs (pricing/tariffs — currently USD-only), W3-02 (invoicing to extend)
3. `services/charge-agreement-service` (pricing engine), reference-data currency set

## Intent

Pricing and invoicing work in **multiple currencies with exchange-rate conversion**: agreements and tariffs can be denominated in different currencies, quotes and invoices apply the correct rate, and the conversion is auditable. Phase 1/2 were USD-only. **Driver: Charge team (Booking invoicing contributes).**

## Vertical Slice Definition

One non-USD booking end-to-end: seed an exchange-rate reference → price a booking against a EUR agreement → the quote applies the stored rate → invoice shows original + converted amounts with the rate used → auditable.

- **Layers cut:** currency/exchange reference → pricing engine (FX) → pricing snapshot (rate stored) → invoice conversion → UI.
- **Thinnest viable form:** two currencies (USD/EUR), one rate, rate applied at pricing time.
- **Deferred:** rate feeds/automation, triangulation, revaluation, hedging.

## In Scope / Out of Scope

- **In:** exchange-rate reference data, currency on tariffs/agreements, FX in the quote engine, rate captured on the pricing snapshot (so it's reproducible), invoice showing original + converted, ISO 4217 throughout.
- **Out:** live FX feed, accounting revaluation (external finance), rounding-policy edge cases beyond a defined standard.

## Actors & Journey

A pricing analyst sets a EUR tariff; a booking prices in EUR and invoices with the converted amount; finance sees both amounts and the rate applied.

## Cross-Module Seams (must be real)

`pricing.result` carries currency + rate; `invoice.booking`/`invoice.dnd` carry original + converted amounts + rate; currency/exchange comes from the Shared Platform reference set (live).

## Standards Alignment

**ISO 4217** currencies; rate captured at a defined moment (pricing time) and stored for reproducibility; no floating conversions at read time.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) seed a USD↔EUR rate; (2) price a booking against a EUR agreement → quote in EUR with the rate applied; (3) the pricing snapshot stores the rate (re-open → same numbers); (4) invoice shows original + converted + rate; (5) a USD booking is unchanged (regression); (6) both audits green.

## Dependencies

W2-03 (pricing/tariffs), W3-02 (invoicing), W0-02 (currency reference). Independent of other Phase-3 intents.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) currency on tariff/agreement + FX in quote; (U02) rate captured on snapshot (reproducible); (U03) invoice conversion + display + regression.

## Open Questions

1. Which rate applies?
   - A. Rate at **pricing time**, stored on the snapshot (recommended — reproducible, matches when the commercial commitment is made)
   - B. Rate at invoice time
   - C. Configurable per agreement
   - X. Other
   - `[Answer]:` A *(provisional)*
