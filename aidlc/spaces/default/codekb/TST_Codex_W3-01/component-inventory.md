# Component Inventory

## Runtime components

| Component | Responsibility | Dependencies / ownership |
|---|---|---|
| `charge-agreement-service/domain-core` | rates, agreements and pricing-domain value objects | owns commercial rules and invariants |
| `charge-agreement-service/application-service` | resolve authority, price, audit/telemetry and use-case orchestration | domain ports; reference/identity ports |
| `charge-agreement-service/dataaccess` | PostgreSQL repositories and migration-backed persistence | `linercore_pricing` only |
| `charge-agreement-service/messaging` | Charge events/outbox integration | Kafka/Schema Registry |
| `charge-agreement-service/container` | Spring configuration, identity filters and REST controllers | application service, Compose runtime |
| `apps/charge-agreements` | Next.js operational UI, BFF policies and protected proxy routes | Charge, Reference Data and authenticated session |
| `booking-service` | booking lifecycle and pricing consumer | Charge provider, reference data, identity, Kafka |
| `booking ... DndPricingPort` | consumer abstraction and result observation | future Charge D&D provider; not authoritative |
| `container-movement-service` | movement events/status projection | owns movement facts, no D&D ruleset |
| `reference-data-service` | controlled reference values | queried by Charge and other domains |
| `identity-service` | authorization and audit support | validates user/service authority |
| `platform-messaging` | shared Kafka/schema tooling | service messaging modules |

## External and operational components

PostgreSQL 15, Keycloak 24, Kafka 7.7.1, Schema Registry 7.7.1, Nginx 1.27, and optional OpenTelemetry/Prometheus/Grafana/Jaeger/Elastic compose profiles form the local platform. The UI uses `packages/ui` and LinerCore design-system governance; W3-01 may add only its page override rather than a parallel shell.

