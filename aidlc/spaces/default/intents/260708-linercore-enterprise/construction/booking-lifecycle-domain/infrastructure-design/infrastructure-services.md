# Infrastructure Services - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Infrastructure service | Purpose | Profile |
|---|---|---|
| Booking Service | Booking commands, queries, lifecycle, orchestration, exceptions, audit, outbox, consumers. | `app`, `full` |
| PostgreSQL `booking` | Booking-owned state, revisions, snapshots, idempotency, exceptions, audit, outbox, consumed events. | `core`, `full` |
| Charge Service APIs | Pricing and D&D calculation outcomes. | `app`, `full` |
| Kafka | `booking.confirmed` production and `containermovement.status` consumption. | `core`, `full` |
| Schema Registry | Avro compatibility for Booking/CMM events. | `core`, `full` |
| Keycloak/JWT | User/service authentication and capabilities. | `core`, `full` |
| nginx | Booking API and host override routes. | `app`, `full` |

## Storage And Indexes

| Data | Design |
|---|---|
| Booking aggregate | Indexed by booking id, customer, status, lifecycle, revision, and created/updated time. |
| Pricing snapshots | Immutable booking-owned snapshots linked to Charge result ids and request correlation. |
| Idempotency | Command key, request hash, response/status, expiration, and owner. |
| Exceptions | Type, owner, severity, state, source seam, remediation, assignment, and audit link. |
| Outbox | Event type, booking id, revision, schema version, dedupe key, status, attempts, and last error. |
| Consumed events | CMM event id, revision, dedupe key, applied/ignored/exception status. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Uses indexed command/query/exception paths and decoupled outbox publication. |
| `security-design.md` | Applies protected APIs, service identities, audit, and database isolation. |
| `scalability-design.md` | Sizes booking, revision, event, exception, and user workloads. |
| `reliability-design.md` | Persists idempotency, outbox, consumer dedupe, stale revision, and audit state. |
| `logical-components.md` | Allocates infrastructure services to Booking components. |
| `components.md` | Keeps Booking Service boundaries explicit. |
| `services.md` | Integrates Booking Service with Charge, CMM, PostgreSQL, Kafka, Schema Registry, and Keycloak/JWT. |
| `business-logic-model.md` | Supports booking lifecycle and exception workflows. |
