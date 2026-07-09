# Monitoring Design - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| Booking outbox lag | Confirmation events pending too long. |
| Kafka publish failure | Publisher failed/blocked rows exceed threshold. |
| Consumer lag | CMM consumer falls behind. |
| Duplicate/replayed event | Dedupe counts spike. |
| Stale revision | Reconciliation stale-rule exceptions rise. |
| Schema/message-pact failure | Integration readiness blocked. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors commit, publish, delivery, consume/reconcile, and end-to-end budgets. |
| `security-design.md` | Monitors producer/consumer identity and event metadata. |
| `scalability-design.md` | Groups by event, revision, replay, journey, and pact dimensions. |
| `reliability-design.md` | Alerts on outbox, compatibility, dedupe, retry, and reconciliation failures. |
| `logical-components.md` | Monitoring maps to publisher, consumer, dedupe, reconciliation, evidence, and security components. |
| `components.md` | Feeds observability/readiness views. |
| `services.md` | Covers Booking, CMM, Kafka, Schema Registry. |
| `business-logic-model.md` | Observes confirmation-to-journey workflow. |
