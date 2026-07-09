# Competitive Analysis - Charge & Customer Agreement

## Source Context

This analysis consumes `intent-statement.md`, which defines Charge & Customer Agreement as LinerCore's first business module after Shared Platform. The market category most relevant to this intent is freight rate management / rates-and-contracts tooling.

Sources consulted:

| Source | Relevant signal |
| --- | --- |
| CargoWise Rates and Contracts: https://www.cargowise.com/solutions/cargowise-forwarding/cargowise-rates-and-contracts/ | Searchable live rate database, buy/sell rate comparison, automated rate application to shipments. |
| Descartes Global Price Management: https://www.descartes.com/solutions/broker-and-forwarder-enterprise-systems/global-price-management | Freight rate management used to improve quote accuracy, reduce effort, and protect margins. |
| Freightos Rate, Book & Manage: https://www.freightos.com/enterprise/rate-book-manage/ | Real-time access to spot and contract rates across modes, with booking/management workflow. |
| Freightgate Contract Rate Management: https://freightgate.net/logistics/contract-rate-management/ | Ocean contracts, surcharges, accessorial fees, and multimodal agreements. |

## Competitor Capability Pattern

| Capability | Market pattern | Implication for LinerCore |
| --- | --- | --- |
| Contract/rate storage | Vendors centralize contracts, charges, surcharges, and accessorial terms. | LinerCore needs structured agreement and charge-term storage from the first slice. |
| Search and comparison | Vendors emphasize searching rates by route, carrier, origin/destination, commodity, and mode. | LinerCore should support agreement search and active-term lookup by customer, trade lane, commodity, and date. |
| Quote/booking integration | Market leaders connect rates to quoting, booking, and shipment workflows. | Charge Agreement should be built before Booking and expose a lookup contract for it. |
| Automation | Vendors reduce manual entry, cross-checking, and rate application work. | MVP should not overbuild automation, but must avoid view-only/manual-only screens. |
| Multi-modal/network depth | Larger products provide multimodal connectivity, carrier networks, public tariffs, and spot-rate access. | These are differentiators for vendors, but are not required for LinerCore's first internal module. |

## Strengths and Weaknesses of External Tools

| Solution type | Strengths | Weaknesses for this project |
| --- | --- | --- |
| Enterprise TMS/rate suites | Deep carrier/rate coverage, mature workflows, quote-to-book integration. | Heavyweight, likely broader than the local MVP, and may not match LinerCore's domain model or staged build path. |
| Freight marketplaces / connectivity products | Real-time spot/contract rate access, carrier connectivity, booking workflows. | Best for external network coverage; less useful for proving internal customer-agreement lifecycle and downstream Booking integration. |
| Contract-rate management products | Strong fit for agreement/rate governance and surcharge management. | Could be a later integration target, but buying now would not complete LinerCore's own commercial bounded context. |
| Spreadsheet/manual process | Fast to start, familiar to users. | Poor traceability, weak approval controls, hard to integrate with Booking, and high risk of inconsistent charge terms. |

## Differentiation Strategy

LinerCore should not attempt to out-feature full RMS products in the first module. Its near-term differentiation is internal workflow fit:

| Differentiator | Why it matters |
| --- | --- |
| Shared Platform integration | Uses existing customers, charge codes, currency, locations, commodities, trade lanes, identity, and local readiness conventions. |
| Booking-ready lookup | Exposes approved active agreement terms in a shape the next module can consume. |
| Explicit lifecycle | Makes draft/approved/suspended/expired agreement states first-class instead of storing rates as ungoverned data. |
| Small vertical slice | Delivers usable create/edit/approve/list/detail behavior quickly, then expands to advanced pricing later. |

## Competitive Conclusion

The competitive landscape validates the module need: agreement and rate management is a real table-stakes capability in logistics systems. The correct first step is to build LinerCore's internal customer-agreement and charge-term service, while leaving partner/buy seams open for later carrier connectivity, spot pricing, benchmark pricing, or public tariff integration.
