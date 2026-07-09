# Monitoring Design - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Signals

- Route latency by endpoint.
- Dependency failures by service.
- Authorization deny count.
- Validation/conflict/service-down response counts.

## Logs

Log route, status, dependency, and correlation id. Never log tokens or stack traces to UI.

