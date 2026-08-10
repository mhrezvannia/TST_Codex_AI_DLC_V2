# Intent Backlog - W3-01 D&D Rules & Rates

**Inputs:** [Intent statement](../intent-capture/intent-statement.md), [feasibility assessment](../feasibility/feasibility-assessment.md), and [constraint register](../feasibility/constraint-register.md)

## Prioritized vertical backlog

| Priority | Capability | MoSCoW | Dependency | Acceptance signal |
| --- | --- | --- | --- | --- |
| 1 | Additive three-rule D&D model and deterministic flat-rate evaluator using port-local calendar-date boundaries. | Must | W2-03 versioned pricing authority | Reproducible cases include zero, boundary and qualifier paths. |
| 2 | Bounded Charge provider API with version-attributable explanation. | Must | 1 | Producer/consumer signed OpenAPI fixtures pass. |
| 3 | Charge operational rule/rate maintenance UI using LinerCore. | Must | 1 | Pricing Analyst can manage versioned rule/rate terms and audit evidence. |
| 4 | Live Compose acceptance and audit evidence. | Must | 1-3 | Compose path, `aidlc-audit`, and `erp-fidelity-audit` green. |
| 5 | Working-day/holiday calendar and external event adapters. | Could | 1 | Explicitly deferred to later approved intents. |

## Value stream

Agreement or Tariff/Rate version -> qualified D&D rule and flat rate -> deterministic port-local date evaluation -> version-attributable provider response -> signed fixtures -> live evidence. W3-02 later consumes the response for trigger/invoice work without crossing into Charge persistence.
