# Component Dependencies - LinerCore Enterprise

## Source Context

This dependency design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. It turns the service/component design into dependency, data-flow, and shared-resource rules.

## Dependency Matrix

| Component | Depends on | Pattern | Notes |
|---|---|---|---|
| Enterprise Web App | Identity, Reference Data, Charge, Booking, CMM, Operations APIs | HTTP through proxy/BFF | UI only, no business ownership |
| Identity Service | Keycloak, identity DB | HTTP/JWT/JDBC | Provides authorization decisions |
| Reference Data Service | reference_data DB, Kafka, Schema Registry | HTTP/JDBC/Kafka | Publishes reference changes |
| Charge Service | pricing DB, Identity authz, Reference Data API/cache | HTTP/JDBC | Owns agreement/pricing/D&D |
| Booking Service | booking DB, Identity authz, Reference Data API/cache, Charge APIs, Kafka/SR | HTTP/JDBC/Kafka | Owns booking lifecycle and D&D trigger |
| Container Movement Service | container_movement DB, Identity authz, Reference Data API/cache, Kafka/SR | HTTP/JDBC/Kafka | Owns movement truth/status |
| Contract Platform | Contract catalog, schemas, service endpoints | Files/HTTP/Kafka | Validates integration readiness |
| Local Runtime Platform | Docker, PostgreSQL, Kafka, SR, Keycloak, services, UI | Compose | Local full runtime |
| Observability Platform | Services, OTel, Prometheus, logs/traces | OTLP/metrics/logs | Cross-cutting evidence |

## Allowed Communication

| Source | Target | Allowed? | Mechanism |
|---|---|---|---|
| Booking | Charge | Yes | Synchronous OpenAPI HTTP for pricing and D&D |
| Booking | CMM | Yes | Async `booking.confirmed` event |
| CMM | Booking | Yes | Async `containermovement.status` event |
| Charge | Booking | Yes | HTTP response to request only |
| Reference Data | Any service | Yes | API/event, not database |
| Identity | Any service | Yes | Authz API/token validation |
| Any service | Another service DB | No | Forbidden |
| CMM | Charge | No for D&D relevance | CMM does not trigger or calculate D&D |
| Enterprise Web | Service DB | No | Must use APIs |

## Data Flow Diagrams

### Booking Confirmation

```text
Enterprise Web+
      |
      v
+Booking Service+ --HTTP pricing.request--> +Charge Service+
      |                                      |
      |<--HTTP pricing.result----------------+
      |
      +--outbox booking.confirmed--> Kafka/SR --> +Container Movement Service+
```

Text fallback: Booking owns the confirmation workflow, synchronously asks Charge for pricing, then publishes `booking.confirmed` for CMM.

### Movement Status

```text
+Container Movement Service+ --containermovement.status--> Kafka/SR --> +Booking Service+
          |                                                       |
          v                                                       v
   movement DB                                          booking lifecycle DB
```

Text fallback: CMM owns journey and movement state, publishes status, and Booking updates lifecycle from the event.

### D&D Trigger

```text
+Booking Service+ --pricing.dnd-request--> +Charge Service+
      |                                      |
      |<--pricing.dnd-result-----------------+
      v
booking D&D charge snapshot
```

Text fallback: Booking decides whether movement status is D&D relevant and stores the returned charge; Charge owns calculation.

## Data Ownership

| Database | Owner | Contains | Other services may query? |
|---|---|---|---|
| `identity` | Identity Service | users, roles, capabilities, auth audit | No |
| `reference_data` | Reference Data Service | reference sets, records, history, reference outbox | No |
| `pricing` | Charge Service | agreements, tariffs, charge terms, pricing audit, D&D rules/results | No |
| `booking` | Booking Service | bookings, booking revisions, pricing snapshots, D&D charge snapshots, exceptions | No |
| `container_movement` | Container Movement Service | journeys, expected movements, movement events, status history | No |
| `keycloak` | Keycloak | realm/users/sessions | No direct app queries |
| tool DBs | Infrastructure tools | observability/tooling state | No domain use |

## Shared Resources

| Resource | Shared by | Rule |
|---|---|---|
| Kafka | Event producers/consumers | Topics ACL-protected by service |
| Schema Registry | Event schemas | BACKWARD compatibility required |
| PostgreSQL container | Local runtime only | Separate logical DBs/users |
| Reverse proxy | UI/services | Route only, no business logic |
| Observability stack | All services | CorrelationId required |
| Shared TS packages | Frontends | Technical primitives only |

## Dependency Risk Controls

- No cross-module SQL joins.
- No shared domain tables.
- No UI-owned business decisions.
- No Charge mutation of Booking lifecycle.
- No CMM D&D relevance decisions.
- No Booking pricing or D&D rate calculation.
- No executable-contract readiness claim from markdown-only documents.
- No container-start-only readiness claim without health, seed, contract, and E2E evidence.

## Walking Skeleton Dependency Path

The first Construction walking skeleton should validate:

1. Identity authenticates a booking user and grants booking/pricing/view capabilities.
2. Reference Data supplies required customer, port, equipment, commodity, and capability values.
3. Booking creates draft and calls Charge pricing.
4. Charge returns itemised pricing from approved agreement or tariff fallback.
5. Booking confirms and publishes `booking.confirmed`.
6. CMM consumes event and creates journey/expected movements.
7. Enterprise Web shows the booking and CMM journey status.
8. Local runtime health and correlation evidence are visible.

## Traceability

| Source | Dependency coverage |
|---|---|
| `requirements.md` | Enforces service/data ownership, integrations, local runtime, and no-fake-completion |
| `stories.md` | Supports walking skeleton and all US-SP/US-CHG/US-BKG/US-CMM/US-UI/US-RUN dependencies |
| `architecture.md` | Extends existing topology and missing target flow |
| `component-inventory.md` | Distinguishes existing and missing components |
| `team-practices.md` | Implements separate module boundaries and local runtime practice |

