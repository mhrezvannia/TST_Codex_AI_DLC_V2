# Monitoring Design - dnd-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| D&D trigger duplicates | Duplicate boundaries exceed baseline. |
| D&D seam latency | Budget breach or timeout spike. |
| Circuit state | Open/half-open beyond threshold. |
| No-rule/conflict/manual-required | Manual queue pressure exceeds threshold. |
| Pact status | Consumer/provider verification fails. |
| Snapshot persistence | Charge D&D success without Booking snapshot blocks readiness. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors trigger, request, call, snapshot, and end-to-end budgets. |
| `security-design.md` | Monitors service auth, context, idempotency, correlation, and audit. |
| `scalability-design.md` | Groups by request/result/fallback/Pact/snapshot dimensions. |
| `reliability-design.md` | Alerts on timeout, retry, circuit, idempotency, snapshot, and contract failures. |
| `logical-components.md` | Monitoring maps to D&D trigger, client, circuit, snapshot, fallback, pact, and evidence components. |
| `components.md` | Feeds observability/readiness views. |
| `services.md` | Covers Booking, Charge, and CMM evidence source. |
| `business-logic-model.md` | Observes D&D trigger and handoff workflow. |
