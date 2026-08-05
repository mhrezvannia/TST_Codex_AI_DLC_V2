# Infrastructure Services - W2-03

## Upstream Coverage

This design consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | W2-03 use | Ownership boundary |
| --- | --- | --- |
| PostgreSQL 15 | Rate/agreement versions, bindings, idempotency claims, quote snapshots, outbox | Charge owns `linercore_pricing`; no cross-service SQL |
| Kafka 7.7.1 | Approved agreement/rate facts through outbox relay | Shared Platform transport |
| Schema Registry 7.7.1 | Registered event contracts | Shared Platform transport |
| Keycloak 24 + identity-service | User/service authentication and authorization | Shared Platform identity |
| reference-data-service | Stable charge-code, currency, location, trade-lane, equipment-type, and customer IDs | Shared Platform reference ownership |
| Nginx 1.27 | Browser ingress and correlation propagation | Shared ingress |
| Prometheus/Grafana/OTel/Jaeger | Metrics, dashboards, traces | Shared observability |

## Database Design

Use additive Flyway migrations rather than `spring.sql.init.mode=always` for new W2-03 tables and backfills. Define composite indexes for effective rate matching and unique constraints for idempotency and non-overlapping authority. Configure a bounded Hikari pool and connection/statement timeouts from measured concurrency. Persist PostgreSQL data in a named volume and capture migration, restart, backup, and restore evidence.

## Messaging and Service Discovery

Use Compose DNS names (`charge-agreement-service`, `booking-service`, `kafka`, `schema-registry`) internally. The outbox relay owns retries and broker backpressure. Contract subject/topic changes are append-only and dual-reviewed. Broker unavailability must not cause the synchronous quote transaction to roll back after its snapshot commits.

## Cache Decision

No rate or quote cache is introduced. Immutable version queries and database indexes are the first performance mechanism. Reference-label caching may exist in the BFF with bounded TTL, but it cannot become pricing authority.

## Secrets and Configuration

Local example credentials stay in the local profile only. CI and staging inject database passwords, service tokens, session secrets, and signing configuration from protected runner/environment secrets. Configuration validation fails startup when non-local profiles retain local defaults.
