# Infrastructure Services - shared-platform-reference-events

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Infrastructure service | Purpose | Profile |
|---|---|---|
| Reference Data Service | Reference lifecycle, validation APIs, history, outbox publisher, health. | `app`, `full` |
| PostgreSQL `reference_data` | Reference records, versions, history, audit context, transactional outbox. | `core`, `full` |
| Kafka | Reference-data changed event transport. | `core`, `full` |
| Schema Registry | Avro subject registration and compatibility checks. | `core`, `full` |
| Keycloak/JWT support | User/service authentication and capabilities. | `core`, `full` |
| nginx | API route and host override routing. | `app`, `full` |
| CI artifacts | Outbox, schema, event, and readiness evidence. | CI |

## Storage And Indexes

| Data | Design |
|---|---|
| Reference records | Indexed by set, key/code, status, version, and effective date. |
| History | Paginated and filtered by set, record, action, actor, and time. |
| Audit context | Subject/service identity, action, decision, reason, correlation id, timestamp. |
| Outbox rows | Aggregate id, event type, schema version, dedupe key, correlation id, producer identity, payload hash, status, attempts, next retry, last error. |
| Health snapshots | Counts by pending, claimed, failed, blocked, published, event type, and age. |

## Network And Access Controls

| Path | Control |
|---|---|
| Admin mutation API | User JWT and capability authorization. |
| Validation API | Approved service identity or capability. |
| Publisher to Kafka | Producer identity, deterministic topic, schema version, dedupe key. |
| Schema compatibility | Local Schema Registry subject and compatibility checks. |
| Consumer access | API/event only; no shared DB joins. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides indexed lookup, validation, mutation, history, enqueue, and publisher capacity. |
| `security-design.md` | Implements access, event security, audit, data handling, and DB boundary controls. |
| `scalability-design.md` | Scales reference sets, records, history rows, events, and consumer modules. |
| `reliability-design.md` | Supports atomic outbox, claim/lease publish, retry, blocked states, and health visibility. |
| `logical-components.md` | Allocates services to Reference Data logical components. |
| `components.md` | Keeps Reference Data Service as owner of reference data and events. |
| `services.md` | Uses approved reference-data-service, PostgreSQL, Kafka, Schema Registry, Avro, OpenAPI, and Keycloak/JWT. |
| `business-logic-model.md` | Supports lifecycle, validation, publishing, outbox health, and exception workflows. |
