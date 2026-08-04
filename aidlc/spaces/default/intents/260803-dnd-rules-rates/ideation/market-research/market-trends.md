# Market Trends — W3-01 D&D Rules & Rates

**Upstream:** [W3-01 intent statement](../intent-capture/intent-statement.md)

## Findings

### Interoperable operational events are a practical integration baseline

DCSA's Track & Trace materials define common processes, data and API standards for cross-carrier shipment tracking. Its documentation specifically frames consistent event definitions and interoperable APIs as the means to exchange data across platforms; the implementation guide directs adopters to the information model, event structures, and OpenAPI definitions. [DCSA documentation](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace), [DCSA implementation guide](https://developer.dcsa.org/implementing-track-and-trace)

**Implication:** W3-01 should model event-to-calculation inputs with explicit semantic mapping, not embed arbitrary provider-specific labels in rate logic. DCSA conformance is not in W3-01 scope, but names and qualifiers should not block a future standards adapter.

### Transparent, explainable charge calculation is operationally expected

Carrier self-service already exposes the practical elements users ask for: free days, estimated D&D charges, shipment context and timely access. [Maersk D&D calculator](https://www.maersk.com/news/articles/2020/09/21/launch-easier-online-dnd-calculator) Carrier tariff material also illustrates the complexity W3-01 must represent: combined versus separate treatment, day ranges, equipment distinctions, and location-specific rules. [Maersk Italy import terms](https://www.maersk.com/local-information/europe/italy/import)

**Implication:** progressive bands, equipment and movement qualifiers, port-local calendar days, and a result explanation are product requirements, not implementation details. The first vertical must explicitly return zero-amount cases and reason codes as well as non-zero charges.

### D&D billing is a continuing regulatory and evidence concern

The FMC's final rule took effect in 2024 and requires compliant invoices; the Commission's 2025 update says the appellate decision set aside only the billed-party section, while remaining provisions stayed in force. [FMC implementation notice](https://www.fmc.gov/articles/final-rule-on-demurrage-detention-cleared-to-take-full-effect-may-28/), [FMC 2025 update](https://www.fmc.gov/articles/u-s-court-of-appeals-issues-decision-in-case-on-demurrage-and-detention-billing-practices/)

**Implication:** W3-01 is not an invoice release, but it must retain enough evaluation lineage to support a later invoice, dispute, waiver, or audit flow. The scope boundary remains intact: W3-02 owns Booking-side triggering and invoice consumption.

## Priorities for the vertical slice

1. Preserve W2-03 Rate/RateVersion and Agreement/AgreementVersion selection as the commercial source of truth.
2. Add only the D&D rule/rate data and evaluation provider needed for a deterministic response.
3. Make every response explainable: selected terms, input times, local calendar handling, chargeable days, rate bands, currency and amount.
4. Verify the provider through signed API fixtures and live Compose acceptance; do not claim legal compliance solely from calculation output.

## Out of scope

- Forecasting, optimisation, marketplace distribution, and an external product-market-size claim.
- Replacing approved W2-03 pricing contracts or making Booking depend directly on Charge persistence.
- Treating the FMC material as legal advice or declaring a complete invoice/compliance workflow delivered by W3-01.

