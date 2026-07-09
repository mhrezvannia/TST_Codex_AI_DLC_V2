# Infrastructure Services - container-movement-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Infrastructure service | Purpose | Profile |
|---|---|---|
| CMM Service | Journeys, movement capture, validation, status derivation, history, events. | `app`, `full` |
| PostgreSQL `container_movement` | Journeys, movement facts, snapshots, dedupe, exceptions, audit, outbox. | `core`, `full` |
| Kafka | Booking event consumption and CMM status publication. | `core`, `full` |
| Schema Registry | Avro compatibility for CMM events. | `core`, `full` |
| Keycloak/JWT support | User/service authentication and capabilities. | `core`, `full` |
| nginx | CMM API and host override routes. | `app`, `full` |

## Storage And Indexes

| Data | Design |
|---|---|
| Journeys | Indexed by booking id, booking revision, journey id, status, and timestamps. |
| Movement facts | Immutable planned/estimated/actual facts with source, event id, time, location, and DCSA validation result. |
| Status snapshots | Materialized current status derived from movement facts. |
| Dedupe records | Event id, command id, key, hash, applied/ignored/exception state. |
| Outbox | Status event type, journey/status id, schema version, dedupe key, status, attempts, last error. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Uses indexed journey/status/history paths and materialized snapshots. |
| `security-design.md` | Applies protected APIs, service identities, audit, event security, and database isolation. |
| `scalability-design.md` | Sizes journeys, movements, snapshots, duplicates/out-of-order records, and user loads. |
| `reliability-design.md` | Persists dedupe, ordering, outbox, and boundary evidence. |
| `logical-components.md` | Allocates infrastructure services to CMM components. |
| `components.md` | Keeps CMM Service ownership explicit. |
| `services.md` | Integrates CMM with Booking events, PostgreSQL, Kafka, Schema Registry, OpenAPI, and Keycloak/JWT. |
| `business-logic-model.md` | Supports journey, movement, validation, status, and publication workflows. |
