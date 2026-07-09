# Market Trends - LinerCore Enterprise

## Source Context

This artifact consumes `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`. It summarizes market signals relevant to container carrier commercial, booking, movement, D&D, and enterprise operation workflows.

Key source links:

- [DCSA digital shipping standards](https://dcsa.org/standards)
- [DCSA overview](https://dcsa.org/)
- [DCSA 2026 roadmap mention](https://www.linkedin.com/pulse/march-updates-dcsa-newsletter-digital-container-shipping-associa-ryx6e)
- [INTTRA/e2open ocean booking](https://www.inttra.com/)
- [Descartes MacroPoint D&D/visibility article](https://macropoint.com/news/demurrage-detention/)
- [BuyCo 2026 D&D software comparison](https://buyco.co/blog/productivity/best-detention-and-demurrage-management-software/)

## Relevant Trends

### Standardized digital interoperability

DCSA continues to anchor industry standardization around interoperable digital shipping processes and APIs. This supports LinerCore's decision to model events, OpenAPI/AsyncAPI surfaces, and DCSA-aligned movement validation instead of embedding proprietary point-to-point semantics throughout the domain.

### Booking and tracking platforms are mature, but fragmented

INTTRA/e2open, CargoSmart, CargoWise, Descartes, and other vendors show that booking, schedules, tracking, and shipment visibility are table-stakes categories. The market has solutions for pieces of the journey, but LinerCore's target is tighter carrier-owned integration across pricing, booking, movement, and D&D.

### D&D has become a managed operational discipline

Market material around D&D tools emphasizes free-time monitoring, exposure forecasting, alerts, evidence, invoice review, and analytics. That validates LinerCore's need for D&D rules, trigger logic, chargeable-day calculation, audit evidence, and exception workflows as first-class capabilities rather than afterthoughts.

### Visibility alone is not enough

Modern visibility platforms provide tracking, alerts, and predictive signals, but they do not own the carrier's booking lifecycle, commercial terms, or D&D charging authority. LinerCore should use visibility-style capabilities where useful, but the internal system of record still needs explicit ownership boundaries.

### Enterprise users expect operational resilience

The enterprise target requires structured logs, metrics, traces, dashboards, SLOs, alerts, contract testing, CI/CD, rollback, backup, incident readiness, and local runtime. These are table stakes for production-grade enterprise operation, not optional polish.

## Table Stakes vs Differentiators

| Area | Table stakes | Differentiator for LinerCore |
|------|--------------|------------------------------|
| Booking | Creation, amendment, confirmation, status, references | Pricing orchestration, revalidation, D&D triggers, revision reconciliation |
| Pricing and agreements | Rate lookup, charge terms, validity | Carrier-owned agreement/tariff determination, audit, manual fallback, pricingRef |
| D&D | Free-time tracking and charge visibility | Charge-owned import demurrage, import detention, export detention calculation with Booking-owned triggers |
| CMM | Movement capture and track-and-trace | Journey creation from booking, DCSA validation, late/out-of-order handling, status events without D&D decisions |
| Integration | APIs and event feeds | Contract-first OpenAPI, Avro, AsyncAPI, Pact, message-pact, correlation, ordering, idempotency |
| Operation | Monitoring and deployment | Complete local Windows runtime plus enterprise Operation lifecycle artifacts |

## Market Risks

- Vendor platforms can cover slices faster than internal development, especially visibility and booking exchange.
- DCSA alignment reduces semantic chaos but does not eliminate messy operational data, late events, or carrier-specific workflow decisions.
- D&D calculations require exact legal/commercial treatment; incorrect charge logic can create billing disputes.
- On-prem/local runtime provides control but increases responsibility for infrastructure, observability, secrets, backups, and operations.

## Product Direction

The market supports LinerCore as a build-first core domain initiative with selective buy/partner decisions around commodity or network-heavy capabilities. The most defensible path is to build the carrier-owned source-of-truth workflows while maintaining integration seams for external feeds, finance, visibility enrichment, and industry-standard APIs.
