# Logical Components - shared-platform-reference-events

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical component model defines where reference lifecycle, validation, outbox, event, schema, security, and health NFR patterns apply.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| ReferenceCommandApi | Handles create, update, retire, and administration commands. | Command validation and authorization. |
| ReferenceValidationApi | Serves module validation requests for Charge, Booking, CMM, UI, and operations. | Consumer validation. |
| ReferenceRepository | Persists reference sets, records, versions, and history. | Reference state. |
| ReferenceHistoryQuery | Provides paginated and filtered lifecycle/history access. | History read path. |
| ReferenceOutboxWriter | Appends outbox rows atomically with reference mutations. | No-lost-change guarantee. |
| ReferenceEventPublisher | Claims outbox rows and publishes Kafka events. | Event delivery. |
| SchemaCompatibilityAdapter | Validates Avro schemas and Schema Registry compatibility. | Event schema readiness. |
| ReferenceAuditWriter | Persists mutation, denied access, and sensitive lifecycle audit. | Audit evidence. |
| ReferenceHealthReporter | Reports API, outbox, publisher, Kafka, Schema Registry, and lag health. | Honest readiness. |
| ServiceAccessGuard | Validates caller identity/capability for APIs and event operations. | Security boundary. |

## Boundary Model

Reference Events owns reference set/record lifecycle, validation APIs, reference-data changed events, transactional outbox, Schema Registry compatibility evidence, Kafka publisher reliability, history, and outbox health.

It does not own pricing, booking, CMM, D&D, UI workflows, cross-service SQL joins, or external master-data integration.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Command validation failure | Mutation rejected. | Audit validation reason; no state change. |
| Authorization failure | Protected action denied. | Audit denial; no state change. |
| Database write failure | Mutation not committed. | No outbox row without state and no state without outbox. |
| Schema Registry failure | Publish/compatibility blocked. | Preserve outbox and expose health failure. |
| Kafka failure | Publisher retries and exposes lag. | API mutations remain decoupled after outbox commit. |
| Consumer validation misuse | Typed validation error. | No internal data leakage or direct DB access. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Fast lookup and validation | ReferenceValidationApi and ReferenceRepository. |
| Transactional outbox | ReferenceOutboxWriter and ReferenceRepository. |
| At-least-once publish | ReferenceEventPublisher. |
| Schema compatibility | SchemaCompatibilityAdapter. |
| Security and service access | ServiceAccessGuard and ReferenceAuditWriter. |
| History pagination | ReferenceHistoryQuery. |
| Outbox health | ReferenceHealthReporter. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support lookup, validation, mutation, history, outbox enqueue, and publisher throughput targets. |
| `security-requirements.md` | Components enforce authentication, authorization, service identity, audit, event security, and database boundary rules. |
| `scalability-requirements.md` | Components support reference set, record, history, changed-event, and consumer-module scale. |
| `reliability-requirements.md` | Components implement atomic outbox, at-least-once publish, compatibility blocks, retry visibility, and no-lost-change behavior. |
| `tech-stack-decisions.md` | Components map to Reference Data Service, Java/Spring, PostgreSQL, OpenAPI, Avro, Kafka, Schema Registry, and Keycloak/JWT. |
| `business-logic-model.md` | Components implement reference lifecycle, validation APIs, event publication, outbox health, and exception handling workflows. |
