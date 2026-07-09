# Monitoring Design - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| Pricing seam latency | Budget breach by p95 or timeout count. |
| Circuit state | Open or half-open beyond threshold. |
| Retry count | Transient failures exceed baseline. |
| Pact status | Consumer/provider verification fails. |
| Snapshot persistence | Charge success without Booking snapshot blocks readiness. |
| Exception classification | Unknown failure type appears. |
| Denied-path evidence | Auth failure missing audit or evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors preparation, call, snapshot, and fallback budgets. |
| `security-design.md` | Monitors service auth, user context, idempotency, and correlation. |
| `scalability-design.md` | Groups by request, fallback, Pact, and snapshot dimensions. |
| `reliability-design.md` | Alerts on timeout, retry, circuit, snapshot, contract, and failure states. |
| `logical-components.md` | Monitoring maps to ChargePricingClient, PricingCircuitBreaker, BookingPricingSnapshotWriter, PricingExceptionClassifier, PricingPactVerifier, and PricingEvidenceReporter. |
| `components.md` | Feeds Observability Platform and Enterprise Web. |
| `services.md` | Covers Booking and Charge services. |
| `business-logic-model.md` | Observes pricing request/response and snapshot workflow. |
