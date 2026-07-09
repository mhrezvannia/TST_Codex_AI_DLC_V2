# Security Requirements - UOW-07 Outbox Publication Status

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Controls

- Event payloads include reference-data fields and correlation id, not auth tokens or secrets.
- Retry/publish endpoints require internal/admin access in later hardening; local B01 may protect through network/profile constraints.
- Broker metadata is safe to expose in local readiness/status views.
- Schema subjects must match approved Avro contracts.

## Threats

| Threat | Requirement |
| --- | --- |
| Sensitive data over-publication | Limit payload to contract fields. |
| False published status | Status updates only after publisher success. |

