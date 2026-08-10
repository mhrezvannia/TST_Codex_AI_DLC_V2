# Observability Setup Questions - W2-01

## Questions And Answers

### Q1. What golden signals should W2-01 track?

[Answer]: Latency, traffic, errors, and saturation for Nginx, `apps-shell`, `apps-auth`, `apps-booking`, `booking-service`, and `identity-service`; plus blocker/final-decision signals from the W2 evidence package.

Rationale: `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services` all require route timing, correlation ids, fail-closed outcomes, real-subject evidence, and explicit BLOCKED handling.

### Q2. What SLOs/SLIs are defined?

[Answer]: Local proof SLOs are 100% successful execution of the four W2-01 live scenarios and zero hardcoded-auth detector hits. Future production targets start at 99.9% shell route availability over 30 days, 95% of shell/Booking routes under 3 seconds locally, and 0 leaked secret/cookie evidence events.

### Q3. What dashboard layout does the team need?

[Answer]: One W2-01 App Shell dashboard with rows for edge routing, auth/session, Booking actor propagation, identity authorization, evidence-package status, and runtime blocker/audit status.

### Q4. What log retention and aggregation rules apply?

[Answer]: Local proof logs are retained as artifacts under `artifacts/w2-01-live/app-shell-auth/` and quality-gate outputs. Future production should use centralized structured logs with correlation id, actor subject hash/reference, route, status, and no raw `lc_session`, token, secret, or password values.

### Q5. What tracing instrumentation is needed?

[Answer]: Trace the browser edge request from Nginx to shell, Booking BFF, booking-service, and identity-service authorization, carrying W3C trace/correlation ids through the full path.

## Open Follow-Ups

- Local/on-prem proof uses Prometheus/Grafana, Elasticsearch/Kibana, and Jaeger/OTel; CloudWatch/X-Ray remain deferred because public-cloud deployment is outside W2-01.
- Add Prometheus-compatible application metrics, OTLP instrumentation, and structured log shipping before claiming application observability.
- Supply production retention, notification destinations, and named on-call ownership before production promotion.

## Runtime Evidence

Official Elastic 8.16.1 containers are healthy, as are Prometheus, Grafana, Jaeger, and OTel Collector. All seven current Prometheus application targets are down, and no W2 spans or Elastic log indices are claimed.
