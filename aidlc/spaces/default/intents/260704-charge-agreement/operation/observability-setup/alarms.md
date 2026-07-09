# Alarms - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Alarm Rules

| Alarm | Severity | Condition | Action |
| --- | --- | --- | --- |
| Backend unavailable | P2 local | Backend health or module-info does not return 2xx within 2 seconds | Stop validation, inspect service logs, keep deployment unpromoted |
| Frontend unavailable | P2 local | Frontend health does not return 2xx within 2 seconds | Stop validation, inspect Next.js logs |
| Proxy route unavailable | P3 local | `/charge-agreements/` does not route through proxy within 3 seconds | Check proxy route and app port |
| Sensitive metadata exposure | P1 local | Module-info returns customer, rate, credential, token, or secret-like fields | Block release and remove field |

## Notification Routing

No paging or SNS routing is configured for U01. Alarms are readiness failures recorded in local smoke evidence. Future production deployment must add notification targets, ownership, and escalation policy before live customer traffic.

## Status

The alarms are defined but inactive because local servers are currently stopped.

