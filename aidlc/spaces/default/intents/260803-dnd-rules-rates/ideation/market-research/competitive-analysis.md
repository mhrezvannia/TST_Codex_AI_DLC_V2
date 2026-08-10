# Competitive Analysis — W3-01 D&D Rules & Rates

**Upstream:** [W3-01 intent statement](../intent-capture/intent-statement.md)

## Decision context

W3-01 is a provider-side Charge vertical. It must preserve W2-03's approved, versioned pricing contracts while making D&D terms, calendar treatment, progressive bands, and evaluation results attributable to the agreement/rate version that supplied them. The comparison therefore evaluates whether a product can be the authoritative source of an exact charge, rather than merely estimate a customer's exposure.

## Market reference points

| Reference | Observable capability | Relevance to W3-01 | Gap if adopted as the authority |
| --- | --- | --- | --- |
| Carrier self-service — Maersk | Shows free days and D&D charges from shipment context; offers a freetime extension path. [Maersk](https://www.maersk.com/news/articles/2020/09/21/launch-easier-online-dnd-calculator) | Validates that a self-service estimate/explanation is table stakes for a carrier experience. | It is a carrier-specific customer interface, not a reusable authority for LinerCore's approved Rate/Agreement contracts or its provider API. |
| Focused D&D SaaS — CocoonDEM | Positions stored contractual rates, shipment data, centralised calculation, and alerts as a D&D-management product. [CocoonDEM FAQ](https://www.demurrage-charges.com/frequently-asked-questions-faqs/) | Confirms that rate normalisation, free time, tiering and exception visibility are real product needs. | Its stated audience is forwarders, importers and exporters; no evidence establishes compatibility with LinerCore's version lineage or bounded provider contract. |
| Rate-management SaaS — CargoSphere | Converts carrier contracts and amendments into structured rate data and distributes it through a network. [CargoSphere](https://cargosphere.com/) | Demonstrates value in making contract data actionable rather than leaving it in documents. | Broader rate-distribution scope would duplicate W2-03 authority and introduce integration/ownership risk. |
| Industry interoperability — DCSA Track & Trace | Publishes shared event vocabulary, data definitions and APIs for carrier/shipper tracking. [DCSA documentation](https://dcsa.org/standards/track-and-trace/standard-documentation-track-and-trace) | Supports DCSA-aligned event inputs and clear semantic mapping for calculation triggers. | It standardises event exchange; it does not prescribe a carrier's commercial D&D rule engine or agreement-linked rate selection. |

## Table stakes and differentiation

### Table stakes

- Separate demurrage, detention and combined D&D treatment; free-time and progressive-band calculations must be explainable.
- Customer-facing visibility of inputs, free days, time window, applicable rate bands, and resulting charge or zero result.
- Event-driven inputs using an interoperable vocabulary where available; DCSA identifies unaligned/missing operational data as a source of manual work and poor decisions. [DCSA Track & Trace](https://dcsa.org/standards/track-and-trace)
- A clear invoice/evidence path for jurisdictions in scope. For U.S. ocean shipping, the FMC confirms invoice-content and timing obligations remain in force, while a 2025 court decision affected only the billed-party provision. [FMC, Nov. 2025](https://www.fmc.gov/articles/u-s-court-of-appeals-issues-decision-in-case-on-demurrage-and-detention-billing-practices/)

### W3-01 differentiator

The defensible differentiator is not a generic calculator. It is a deterministic provider-side evaluation whose result carries the selected agreement/version and rate/version, qualifiers, port-local calendar treatment, and band-by-band explanation. That makes the result reproducible by Charge and consumable through the approved OpenAPI contract, while W3-02 can later use the same authority without a direct coupling to Charge internals.

## Competitive conclusion

Extend the Charge-owned pricing authority. Carrier calculators and focused SaaS establish the expected experience, but none displaces the need to preserve W2-03's source-of-truth, version lineage, and provider boundary. A future partner assessment is reasonable only for non-core capabilities such as maintained holiday data or external event feeds, evaluated behind an adapter; it must not replace calculation authority or redefine the W2-03 contracts.

