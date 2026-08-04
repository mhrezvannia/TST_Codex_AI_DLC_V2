# Constraint Register - W3-01 D&D Rules & Rates

**Inputs:** [Intent statement](../intent-capture/intent-statement.md), [competitive analysis](../market-research/competitive-analysis.md), [market trends](../market-research/market-trends.md), and [build-vs-buy assessment](../market-research/build-vs-buy.md)

## Hard constraints

| ID | Constraint | Owner | Verification |
| --- | --- | --- | --- |
| CON-01 | W2-03 Rate/RateVersion and Agreement/AgreementVersion contracts remain stable. | Charge | Existing pricing regression and OpenAPI compatibility fixtures pass. |
| CON-02 | D&D authority is Charge-owned; Booking has no direct dependency on Charge persistence. | Charge / Booking | Provider API is the only cross-context consumption path. |
| CON-03 | The calculation is deterministic and version-attributable. | Charge | Response identifies selected agreement/rate versions, inputs, calendar basis, bands and amount. |
| CON-04 | Calendar days are evaluated in the declared port-local context. | Charge | Tests cover timezone/DST, weekend, holiday, fallback and zero-result cases. |
| CON-05 | The W3-01 scope ends before Booking triggering and invoice issuance. | Product / Architecture | Scope and user stories retain W3-02 as owner of those outcomes. |
| CON-06 | Completion is observed in the live Compose stack. | Delivery / QA | Signed API fixtures, live acceptance, `aidlc-audit`, and `erp-fidelity-audit` are green. |

## Regulatory and data constraints

| ID | Constraint | Treatment | Status |
| --- | --- | --- | --- |
| REG-01 | D&D calculation may feed later U.S. billing/dispute evidence. | Retain reproducible terms, timing inputs and explanation; avoid a legal-compliance assertion. | Open, carried to NFRs. |
| REG-02 | Jurisdiction and holiday-calendar coverage is not yet fully specified. | Start with explicitly configured port calendars and documented fallback; decide supported jurisdictions in Requirements. | Open. |
| DATA-01 | Commercial agreement/rate content is internal operational data. | Reuse existing service authorization and audit boundary; do not add unreviewed external rate authority. | Satisfied by design direction. |

## Platform constraints

| ID | Constraint | Treatment | Status |
| --- | --- | --- | --- |
| PLAT-01 | Existing local Compose stack is the delivery baseline. | Reuse current service/app topology; no new AWS service is needed for W3-01. | Feasible. |
| PLAT-02 | Provider behavior must remain backward compatible. | Use additive OpenAPI/schema fields and contract fixtures. | Open, verify during implementation. |
| PLAT-03 | External calendar/event services are optional, not authoritative. | Defer them; future adapters require provenance, deterministic fallback and contract isolation. | Deferred. |

