# Competitive Analysis - LinerCore Enterprise

## Source Context

This artifact consumes `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`. It also uses current market sources and the existing Graphify graph/report as requested.

Key source links:

- [DCSA digital shipping standards](https://dcsa.org/standards)
- [INTTRA ocean booking platform](https://www.inttra.com/)
- [CargoWise ocean visibility](https://www.cargowise.com/solutions/cargowise-forwarding/ocean/)
- [Descartes MacroPoint ocean visibility](https://macropoint.com/features/ocean-visibility/)
- [CargoSmart](https://www.cargosmart.com/)
- [Cargoo D&D and contract visibility](https://www.cargoo.com/demurrage-and-detention-in-ocean-freight-and-how-cargoo-delivers-360-control/)
- [BuyCo 2026 D&D software comparison](https://buyco.co/blog/productivity/best-detention-and-demurrage-management-software/)

## Competitive Categories

| Category | Examples | Strengths | Weaknesses vs. LinerCore target |
|----------|----------|-----------|---------------------------------|
| Ocean booking networks | INTTRA/e2open, CargoSmart | Carrier connectivity, schedules, bookings, documentation, tracking networks | Usually network/platform layer rather than carrier-owned pricing, agreement, D&D, and operational domain system |
| Freight/TMS suites | CargoWise, Descartes, SAP Business Network | Broad execution, shipment visibility, integrations, analytics, enterprise adoption | Often forwarder/shipper/LSP oriented; carrier-specific commercial rules and bounded-context ownership may require heavy customization |
| Ocean visibility APIs/tools | Descartes MacroPoint, Vizion, Gnosis Freight, Shipwell, CargoSmart APIs | Container milestones, alerts, ETA/status visibility, broad data feeds | Visibility does not replace owned Booking, Charge, D&D rules, audit, or domain workflow decisions |
| D&D management tools | BuyCo, Windward, Cargoo, GoComet, TradeTech, BlueCargo | Free-time monitoring, D&D exposure, alerts, invoice review, analytics | Many optimize shipper/forwarder avoidance workflows; LinerCore must calculate carrier-owned D&D charges and preserve auditability |
| Internal carrier platforms | Existing carrier line-of-business tools | Deep carrier fit and operational control | Often fragmented by function; LinerCore targets an integrated, contract-driven, observable replacement |

## Feature Comparison

| Capability | LinerCore enterprise target | Booking networks | TMS/freight suites | Visibility tools | D&D tools |
|------------|-----------------------------|------------------|--------------------|------------------|-----------|
| Carrier-owned agreement and tariff rules | Strong target | Weak to adequate | Adequate with customization | Absent | Weak |
| Booking lifecycle and amendment orchestration | Strong target | Strong for exchange workflows | Adequate to strong | Weak | Absent |
| D&D rule ownership and calculation | Strong target in Charge | Weak | Adequate with customization | Weak | Strong for monitoring/review, not necessarily carrier calculation |
| Container journey and movement status | Strong target in CMM | Adequate | Strong | Strong | Adequate as input |
| Contract-driven service boundaries | Strong target | Variable | Variable | API-oriented | Variable |
| Local on-prem Docker runtime | Strong target | Usually SaaS | Usually SaaS/enterprise deployment | Usually SaaS/API | Usually SaaS |
| Enterprise operation artifacts | Strong target | Vendor-managed | Vendor-managed or enterprise | Vendor-managed | Vendor-managed |
| Full UI across commercial, booking, movement, and exceptions | Strong target | Partial | Broad but generic | Visibility-specific | D&D-specific |

## Positioning

LinerCore should not position itself as a generic freight marketplace or shipper visibility product. Its strongest position is a carrier-owned enterprise operating platform that joins four areas competitors often split:

1. commercial agreement and pricing logic;
2. booking orchestration and confirmation;
3. movement reporting and lifecycle status;
4. D&D triggering, calculation, audit, and exception handling.

The differentiator is not that LinerCore has every external data feed on day one. The differentiator is that the carrier's internal commercial and operational truth is modeled once, protected by explicit module ownership, and exposed through tested APIs/events.

## SWOT

| | Helpful | Harmful |
|---|---------|---------|
| Internal | Existing Shared Platform MVP, partial Charge Agreement code, authoritative enterprise documents, explicit contracts, Graphify-backed code knowledge | Booking and CMM appear unimplemented or not yet proven; raw UI export is not fully semantically indexed; enterprise runtime and Operation remain gaps |
| External | DCSA standardization, demand for visibility and D&D cost control, carrier need to reduce fragmented re-keying | Mature SaaS/network vendors already cover pieces of booking, visibility, and D&D; integrations and data quality remain hard |

## Competitive Implications

- Build core pricing, agreement, booking, D&D, and CMM capabilities because they are the product's differentiated business model.
- Do not build a generic ocean carrier network from scratch; integrate with standards, APIs, EDI, or partner networks when external connectivity becomes required.
- Do not treat visibility tooling as a substitute for Booking/CMM ownership; use it as data input where it accelerates reliable status.
- Keep local/on-prem runtime as a deliberate enterprise differentiator for this project, since most market alternatives are SaaS-first.
