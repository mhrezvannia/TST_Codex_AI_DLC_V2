# Monitoring Design - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Metrics and Logs

- Prerequisite status count by ready/blocked/warning/failed.
- Compose service health states.
- Evidence file path and timestamp.
- Startup duration by service group.

## Alerts

Local alerts are console/readiness failures, not production paging.

