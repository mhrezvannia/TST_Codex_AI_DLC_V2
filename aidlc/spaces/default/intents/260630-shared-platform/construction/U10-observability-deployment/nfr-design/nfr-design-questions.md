# NFR Design Questions - U10 Observability Deployment

## Scope

This file records design questions resolved during NFR Design for `U10-observability-deployment`.

## Resolved Questions

### Q1. How is correlation propagated across the platform?

The first trusted platform boundary accepts a valid approved correlation id or generates one. The same id is propagated through BFF calls, service calls, audit/change history, outbox rows, Kafka event envelopes, JSON logs, trace spans, status APIs, and safe UI error/status states.

### Q2. Where should correlation ids appear?

Correlation ids belong in logs, traces, status envelopes, audit records, outbox rows, and event envelopes. They are not Prometheus metric labels because of high-cardinality risk.

### Q3. What makes deployment ready?

Every deployable service and BFF app exposes liveness/readiness. Readiness checks required dependencies, not just process availability. Smoke checks exercise auth, reference BFF/API access, persistence, outbox/event evidence, and correlation evidence before promotion is considered.

### Q4. How is observability kept safe?

Logs mask secrets, tokens, credentials, restricted payloads, and unsafe PII. Dashboards and status surfaces show safe reason codes, event ids, correlation ids, statuses, and bounded labels only. Browser code never receives observability stack credentials.

### Q5. What deployment stack is assumed?

The MVP target is on-prem/local Docker Compose profiles, Nginx routing, Vault references for non-local secrets, deterministic image registry naming, ELK-compatible logs, Prometheus/Grafana metrics, and OpenTelemetry to Jaeger. AWS/public-cloud managed observability and Kubernetes-only descriptors are out of scope.

## Open Questions

No blocking questions remain for this stage. Final retention sizing, DR/SLO targets, and production promotion automation policy remain outside U10 NFR Design.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
