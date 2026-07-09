# Infrastructure Services - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Services

| Service | Role |
| --- | --- |
| PostgreSQL | Durable local identity/reference/outbox state. |
| Keycloak | Local OIDC provider. |
| Kafka | Reference-data event broker. |
| Schema Registry | Avro schema registration/check. |
| Nginx | Local gateway. |

## Ownership

UOW-01 owns startup profile and prerequisite checks, not business data.

