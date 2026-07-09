# Infrastructure Services - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Services

| Service | Use |
| --- | --- |
| identity-service | Permission/effective-permission calls. |
| reference-data-service | Reference data list/detail/mutation/history/status. |
| Nginx | Browser gateway. |

## Access

Browser -> BFF only; BFF -> Java services.

