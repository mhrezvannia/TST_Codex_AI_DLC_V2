# Deployment Architecture - U09 Local Seed Compose

## Compute Model

U09 deploys a local/CI Docker Compose topology. The core profile runs PostgreSQL, Keycloak 24, Kafka, Confluent Schema Registry, `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, Nginx, seed loader, and smoke runner. Optional observability services run in a separate profile.

## Network Topology

Compose networks connect services by stable local names. Nginx is the browser-facing edge for app/BFF routes. Smoke checks use APIs/BFF paths rather than direct database reads.

## Storage Strategy

Named local volumes may preserve PostgreSQL, Keycloak, Kafka, and Schema Registry state during development. Seed loader idempotency handles repeat runs and should not require wiping volumes.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Development-only values and deterministic seed packs. |
| CI | Bounded health waits, seed validation, idempotency, smoke subsets. |
| Non-local | Descriptor placeholders only with Vault references. |

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
