# Monitoring Design - U02 Identity Authz Service

## Metrics and KPIs

U02 emits Prometheus-compatible metrics for authorization decision latency, effective-permission latency, allow/deny/fail-closed counts, invalid-token count, unknown-subject count, dependency-unavailable count, role assignment writes, audit writes, PostgreSQL latency, and Keycloak metadata/JWKS latency.

Metric labels are bounded by operation, result, reason code, dependency, and environment. Subject ids, token ids, and correlation ids are not metric labels.

## Logging Strategy

Structured JSON logs include service, operation, safe reason code, result, dependency, policy version where applicable, and correlation id. Logs exclude access tokens, refresh tokens, ID tokens, secret claims, client secrets, raw provider responses, and unauthorized role details.

Denied decisions, failed protected decisions, role assignment attempts, role changes, and dependency failures produce supportable log/audit evidence.

## Tracing Configuration

OpenTelemetry spans cover REST handler, Keycloak adapter call, PostgreSQL query/write, policy evaluation, audit append, and response mapping. Correlation id propagates from callers into logs, spans, and audit records.

## Alerts and Dashboards

Dashboards track p95 decision latency, fail-closed rate, dependency-unavailable rate, Keycloak/JWKS latency, PostgreSQL latency, assignment conflict/stale rates, audit append failures, and health/readiness. Alerts should focus on sustained fail-closed spikes, unavailable dependencies, and audit write failures.

## Incident Response

Operators can investigate by correlation id, safe reason code, policy version, operation, and dependency. Sensitive identity details require authorized audit queries, not raw logs.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
