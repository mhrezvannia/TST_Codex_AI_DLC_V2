# Infrastructure Services - UOW-03 Identity Authorization

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Services

| Service | Use |
| --- | --- |
| PostgreSQL | Role assignments and audit. |
| Keycloak | Subject source. |
| identity-service | Authorization API. |

## Access

Only app/services call `/internal/identity`; browser does not.

