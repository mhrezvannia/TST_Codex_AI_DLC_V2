# Market Trends — W2-03 Charge Tariffs & Agreements

This report validates the bounded internal capability defined in [`intent-statement.md`](../intent-capture/intent-statement.md). It does not estimate a SaaS market or propose an external go-to-market motion.

## Executive Finding

Current primary sources support five operational table stakes for transportation pricing: standards-based API exchange, explicit rate validity, released or approved agreement determination, separate additional-charge categories, and recalculation with attributable source data. W2-03 is aligned with those table stakes in its thinnest form. The research does not justify expanding the intent into optimization, public rate distribution, D&D, multi-currency conversion, or a suite replacement.

## Signals and W2-03 Implications

| Signal | Primary-source evidence | Implication for W2-03 |
|---|---|---|
| OpenAPI and conformance are central to container-shipping interoperability | DCSA Booking 2.0 describes standardized consumer/provider communication, OpenAPI specifications, and implementation conformance resources | Preserve the existing bilateral `pricing.request` / `pricing.result` field names, media type, examples, and consumer/provider verification; additive evolution only |
| Rate validity and agreement release/approval determine usable charges | SAP Transportation Management requires valid freight agreements with calculation-sheet items, rates, scales, and released validity periods | Model effective rate versions and immutable approved agreement versions; do not edit approved commercial history in place |
| Recalculation is expected when pricing-relevant source data changes | SAP documents automatic charge recalculation when the relevant freight document is updated | Make repricing explicit and attributable; persist a new Booking snapshot rather than mutating the prior quote |
| Base costs and additional charges are distinct rate-management concepts | Oracle Rate Manager distinguishes base costs, accessorials, special services, surcharges, effective/expiration dates, geography, equipment, and other constraints | Keep tariff, surcharge, and local charge as distinct categories with their own owned data and matching evidence instead of flattening everything into an opaque total |
| Missing or inapplicable rates need an explicit operational path | SAP's container-shipping charge calculation allows manual rating where no service rate is found; Oracle validity rules exclude expired accessorials | Use the contract-true no-rate result and Booking `MANUAL_PRICING_REQUIRED`; never substitute a guessed amount |
| Stable location and currency codes reduce data-exchange ambiguity | UNECE Recommendation 16 defines UN/LOCODE for unambiguous trade/transport locations; ISO 4217 defines standard currency codes and minor-unit relationships | Use canonical port/location references and ISO 4217 USD consistently across rates, calculation, JSON, snapshots, and UI formatting |

## Trend Assessment

### Adopt now

- **Contract-first API interoperability:** DCSA's Booking 2.0 material treats standardized definitions and OpenAPI exchange as a conformance concern, not optional documentation. W2-03 should keep provider and consumer tests synchronized with the live seam.
- **Versioned commercial provenance:** Effective and released agreement/rate data is established practice in mature transportation systems. Rate, agreement, and Booking snapshot versions must remain distinguishable.
- **Itemised charge evidence:** Mature rate managers model base and additional charges separately. The Booking operator should see charge code, category, rate basis, amount, currency, total, and pricing reference.
- **Exception-first operations:** No-rate is not a numeric price. It requires an actionable manual queue/status and visible operator evidence.

### Preserve as future seams

- **Bulk rate ingestion and external agreement integration:** Oracle supports integrated rate entry and SAP publishes a freight-agreement integration API. LinerCore should keep its Charge-owned API boundary clear enough for a later approved importer or partner adapter.
- **Broader rating dimensions:** Weight, volume, distance, commodity, scales, and special services are common in mature suites, but adding them now would violate the approved trade-lane × equipment-type slice.
- **Multi-currency and settlement depth:** Mature suites include document/local currency and settlement features. W2-03 uses USD attribution only; exchange application and invoicing remain later intents.

### Hold for later intents

- Autonomous yield optimization, dynamic pricing, public marketplace distribution, rebates, and rate-shopping across multiple carriers.
- D&D rule/rate calculation, multi-leg pricing, reefer/DG rate dimensions, commodity bands, and weight scales.
- Procurement or migration to a full transportation-management suite.

## Standards Watch

- DCSA advises adopters to use the latest Booking release and provides conformance guidance. W2-03's internal pricing seam is not itself a DCSA public API, but its Booking vocabulary and implementation discipline should not conflict with the program's DCSA-aligned model.
- UN/LOCODE is maintained and published as an evolving code list. Charge should consume the Shared Platform reference identity rather than copy code-list contents into tariff records.
- ISO 4217 remains the currency-code authority. The code and minor-unit relationship should be treated as reference data; W2-03 must not create a module-local currency master.

## Sources

- [DCSA Booking 2.0 standard documentation](https://dcsa.org/standards/booking/documentation-booking-2)
- [DCSA Booking 2.0 introduction](https://dcsa.org/standards/booking/documentation-booking-2/booking-2-introduction)
- [DCSA implementation guidance](https://developer.dcsa.org/implementing-booking)
- [Oracle Transportation Management Rate Record](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/rate_manager/create_rate_record.htm)
- [Oracle Transportation Management Accessorials](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/rate_manager/accessorials.htm)
- [SAP Transportation Management Charge Calculation Overview](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/f27f08ac51b94c83b32790ee4c5c2776.html)
- [SAP freight-agreement integration API](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/e2fd938fbf554ac8b719c9207de81d5a.html)
- [UNECE Recommendation 16 / UN/LOCODE](https://unlocode.unece.org/recommendation16/)
- [ISO 4217 currency codes](https://www.iso.org/iso-4217-currency-codes.html)

## Confidence and Limits

- **High confidence:** the cited product and standards capabilities are directly stated by their official publishers.
- **Moderate confidence:** their relevance to W2-03 is an architectural/product inference based on the approved intent, not a claim that LinerCore must imitate a particular suite.
- **Not assessed:** vendor pricing, implementation cost, carrier-specific procurement constraints, market share, or total addressable market. No reliable project inputs were supplied, and those questions are not needed to approve this thin slice.
