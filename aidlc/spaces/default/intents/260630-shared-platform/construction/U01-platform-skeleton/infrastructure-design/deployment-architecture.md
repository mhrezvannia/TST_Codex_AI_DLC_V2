# Deployment Architecture - U01 Platform Skeleton

## Compute Model

U01 defines a containerized local/on-prem baseline using Docker Compose. The core profile contains container slots for `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, PostgreSQL, Keycloak 24, Kafka, Confluent Schema Registry, and Nginx. Optional observability containers are placed behind a separate profile.

This skeleton does not define AWS, public-cloud managed services, Kubernetes-only descriptors, or final production sizing.

## Network Topology

Compose defines an internal application network for service-to-service traffic and a front-door route through Nginx for browser-facing paths. Browser traffic reaches `apps/auth` and `apps/reference-data` through Nginx/BFF routes; browser code does not call backend services directly.

Service DNS names are stable placeholders for later units:

| Boundary | Internal name |
|---|---|
| Authorization | `identity-service` |
| Reference APIs | `reference-data-service` |
| Identity provider | `keycloak` |
| Event broker | `kafka` |
| Event schema registry | `schema-registry` |
| Edge routing | `nginx` |

## Storage Strategy

The skeleton reserves PostgreSQL storage for each backend service's owned data. `identity-service` owns authorization and audit persistence. `reference-data-service` owns canonical reference data, audit/change history, outbox rows, and status projections. Kafka and Schema Registry own integration state, not domain ownership.

Named volumes are allowed for local repeatability. Production backup, replication, retention, and DR policy are deferred.

## Environment Layout

U01 defines environment descriptors for local and placeholders for staging/production conventions:

| Environment | Purpose |
|---|---|
| Local | Developer/CI reproducibility with Compose and development-only values. |
| Staging | Later promotion target with Vault references, registry tags, health/smoke evidence. |
| Production | Placeholder only; no production promotion policy in U01. |

## Infrastructure as Code Approach

The root infrastructure folder should contain Docker Compose, Nginx, local env examples, registry naming conventions, and placeholders for later environment descriptors. The design avoids hand-editing service-specific deployment details into application code.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
