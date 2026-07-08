# Monitoring Design - U08 Quality Gates

## Metrics and KPIs

U08 tracks gate duration by id/scope/command/runner/status, queue time, execution time, skip reasons, retry count, flaky indicators, failed required gates, missing evidence, and unknown compatibility outcomes.

## Logging Strategy

Gate logs include command, scope, summary, artifact path, and redacted output. Logs avoid secrets, tokens, Vault values, production credentials, and sensitive seed data.

## Tracing Configuration

CI job grouping provides trace-like phases for classifier, runners, evidence collection, and aggregation. Runtime OpenTelemetry is not required for U08 itself.

## Alerts and Dashboards

PR status and CI summaries surface required/advisory results, failed gates, skipped gates, and evidence links. Runner capacity dashboards are useful but implementation-specific.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
