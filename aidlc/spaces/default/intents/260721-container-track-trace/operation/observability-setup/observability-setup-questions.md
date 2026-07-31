# W2-04 Observability Setup Decisions

## Upstream Context

These answers implement `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`
without inventing AWS services or production commitments.

## Decisions

### 1. What golden signals are tracked?

**Answer:** Latency, traffic, errors, and saturation for CMM/Booking, plus
journey intake, capture outcome, outbox age/status, Kafka publication, Booking
receipt/disposition, projection freshness, dependency health, authorization
outcome, API/UI convergence, manager guard, and evidence integrity.

### 2. What SLIs and SLOs are defined?

**Answer:** Blocking acceptance SLIs use p95 <= 2 seconds, max <= 5 seconds,
30-second propagation/recovery, exact conflict/authorization/consumer
correctness, manager isolation, and evidence integrity. No production SLO,
SLA, availability percentage, or error budget is defined.

### 3. What dashboards are needed?

**Answer:** Release readiness, CMM journey/capture, Booking
consumer/projection, and authorization/degradation dashboards. The existing
Shared Platform overview is retained but insufficient for W2-04.

### 4. What log aggregation and retention apply?

**Answer:** Structured redacted JSON with correlation across CMM, Kafka, and
Booking is required. Elasticsearch/Kibana were stopped and no shipper was
found. Acceptance evidence follows the intent audit policy; no production
retention duration is invented.

### 5. What tracing is needed?

**Answer:** W3C trace context plus trusted correlation across Booking consume,
CMM transaction, Identity/Reference Data calls, outbox relay, Kafka,
Booking receipt/projection, and UI read. Collector descriptors exist, but
application OTLP export and live traces are not activated.

### 6. Are alarms and anomaly detection active?

**Answer — no:** Deterministic acceptance alarms are defined but have no live
metric source or approved routing. Adaptive anomalies remain disabled until a
qualified baseline exists.

### 7. What is the current setup verdict?

**Answer — DESIGNED, NOT ACTIVATED / HOLD:** Compose config validates and
descriptors exist, but all observability containers were stopped; only Charge
Agreement exposed Prometheus metrics; Booking/CMM logs were unstructured in the
sample; and no application trace exporter was found.

### 8. What does approval mean?

**Answer:** Approval accepts the designs, evidence gaps, and activation
conditions. It does not claim dashboards, alerts, logs, traces, SLOs, or
anomaly detection are live, and it does not authorize deployment.

## Activation Gate

Activation requires current-image metrics/logs/traces, a running isolated
observability profile, validated dashboards/queries, redaction proof, complete
acceptance evidence, and an approved owner/routing policy. W1 remains
`BLOCKED_WAIVED`.

