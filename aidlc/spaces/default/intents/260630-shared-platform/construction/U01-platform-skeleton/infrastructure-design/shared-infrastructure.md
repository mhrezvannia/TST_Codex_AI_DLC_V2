# Shared Infrastructure - U01 Platform Skeleton

## Shared Resource Model

U01 defines shared infrastructure conventions used by multiple units. Shared resources are platform services, not shared domain ownership.

| Shared resource | Consumers | Ownership rule |
|---|---|---|
| Nginx | `apps/auth`, `apps/reference-data` | Routes browser/BFF traffic only. |
| Kafka | `reference-data-service`, future consumers | Event transport, not domain store. |
| Schema Registry | U04/U07/U08 | Event schema governance. |
| Keycloak | `apps/auth`, `identity-service` | Authentication provider. |
| Observability stack | All deployables | Telemetry collection only. |
| Vault references | Services/apps/pipelines | Secret indirection for non-local envs. |

## Shared Networking

Compose networks separate browser-facing edge traffic from internal service traffic. Nginx is the only browser-facing route to apps/BFFs. Backend services communicate through internal service names.

## Shared Databases

The platform may use one PostgreSQL container locally, but logical ownership remains per service. No component reads or writes another service's schema. Production physical database topology is deferred.

## Shared Messaging

Kafka topics and Schema Registry subjects are shared infrastructure resources with service-owned producers and contract-governed consumers. U01 only reserves the baseline; U04 and U07 specialize event publication and contracts.

## Access Boundaries

Shared infrastructure access is through configured service credentials, Vault references, and service APIs. Browser code receives no direct database, broker, service, Vault, or observability credentials.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
