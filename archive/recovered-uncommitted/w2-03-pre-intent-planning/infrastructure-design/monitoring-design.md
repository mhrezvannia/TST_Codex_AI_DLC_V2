# Monitoring Design - W2-03

## Upstream Coverage

This design consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Instrumentation

Expose Spring Actuator health and Prometheus metrics from Charge, including the Prometheus registry dependency and `health,info,prometheus` endpoint exposure. Instrument `pricing.request` with W3C trace context and propagate correlation ID through Booking, Charge, JDBC, and outbox spans. Emit structured JSON logs without monetary amounts, tokens, or raw bodies.

## Metrics and SLIs

| Signal | Labels/aggregation | Purpose |
| --- | --- | --- |
| Pricing rate, errors, duration | outcome, reason code; no party/booking high-cardinality labels | p99 and correctness health |
| Manual pricing count | no-rate, ambiguous, no-applicable-lines | Detect missing/misconfigured authority |
| Idempotency outcomes | new, replay, conflict, takeover, fenced-loser | Retry correctness |
| Quote line/category count | FREIGHT, SURCHARGE, LOCAL | Detect degenerate/hardcoded results |
| JDBC pool/statement latency | service instance and query family | Capacity and index health |
| Outbox backlog/oldest age | topic and status | Broker degradation |
| Rate/agreement approvals | success/failure, actor role | Monetary change control |

## Alerts

- Page on sustained pricing availability failure or p99 breach after the live baseline is established.
- Ticket on manual-pricing spikes, missing line categories, repeated ambiguous matches, or idempotency conflicts.
- Page when outbox oldest age breaches the agreed delivery window; do not page merely because one retry occurs.
- Alert on failed monetary migrations, local-bypass activation outside local/test, or audit-log write failure.
- Every alert includes a dashboard and runbook link.

## Dashboards and Evidence

Extend the shared Grafana dashboard with Charge pricing RED metrics, manual outcomes, line-category distribution, database pool/query signals, and outbox health. The W2-03 live evidence bundle records request/response snapshots, database authority versions, screenshots, trace/correlation IDs, metric excerpts, rate-change/reprice proof, no-rate proof, restart proof, and both audit outputs.

## Current Gap

Prometheus already targets `/actuator/prometheus` on Charge, but `application-local.yaml` exposes only `health,info`; the runtime must expose and verify the metrics endpoint before monitoring can pass.
