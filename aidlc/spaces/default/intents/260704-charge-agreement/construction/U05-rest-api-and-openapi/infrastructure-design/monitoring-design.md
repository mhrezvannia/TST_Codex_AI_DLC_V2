# Monitoring Design - U05

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics

Track request count, latency, error category, correlation ID, and active-lookup no-match counts.

## Alerts

Local readiness fails on non-200 health, contract endpoint failure, or lifecycle smoke failure.
