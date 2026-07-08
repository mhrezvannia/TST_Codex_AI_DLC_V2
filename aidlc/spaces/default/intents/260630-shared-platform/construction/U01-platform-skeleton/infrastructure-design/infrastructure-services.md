# Infrastructure Services - U01 Platform Skeleton

## Core Services

U01 declares the shared local/on-prem services that later units specialize:

| Service | Role | Ownership boundary |
|---|---|---|
| PostgreSQL | Service-owned relational persistence | Separate logical DB/schema per backend service. |
| Keycloak 24 | Authentication provider | Authentication only; no custom password store. |
| Kafka | Reference-change transport | Integration infrastructure, not domain data owner. |
| Confluent Schema Registry | Avro schema governance | Event schema compatibility and lookup. |
| Nginx | Edge routing | Browser entrypoint for apps/BFF routes. |
| Vault references | Non-local secret indirection | Secret references only, not literal values. |

## Database Design

The skeleton reserves PostgreSQL 15+ service containers and connection configuration conventions. It does not create final schemas. Later U02 and U03 units define identity/reference persistence. Domain modules must not bypass service-owned data access boundaries.

## Messaging Infrastructure

Kafka and Schema Registry are shared platform infrastructure for typed reference-change events. U01 defines baseline service names, health checks, and connection placeholders; U04 defines outbox publication behavior and schema compatibility details.

## Service Discovery

Compose service names provide local service discovery. Nginx provides browser-facing route discovery for apps and BFFs. There is no public-cloud service discovery or Kubernetes-only assumption in U01.

## Caching and Search

No shared cache, CDN, or search service is introduced in U01. Later units may add bounded caches only when justified by measured performance and consistency requirements.

## External Integrations

External integrations are limited to local/on-prem platform dependencies. Downstream Charge, Booking, and Container Movement modules are contract-only future consumers and are not deployed by U01.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
