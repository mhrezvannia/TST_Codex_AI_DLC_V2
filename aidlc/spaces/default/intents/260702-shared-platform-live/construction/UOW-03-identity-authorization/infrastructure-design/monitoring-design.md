# Monitoring Design - UOW-03 Identity Authorization

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Signals

- Authorization allow/deny counts by resource/action.
- Unknown subject deny count.
- Role assignment change count.
- PostgreSQL connectivity.

## Logs

Log correlation id, resource, action, result, reason code. Do not log tokens.

