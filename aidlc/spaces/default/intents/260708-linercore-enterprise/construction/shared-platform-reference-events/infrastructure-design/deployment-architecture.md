# Deployment Architecture - shared-platform-reference-events

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`shared-platform-reference-events` deploys Reference Data lifecycle APIs, validation APIs, transactional outbox, Kafka event publication, Schema Registry compatibility, history, audit, and outbox health.

## Deployment Model

| Environment | Deployment shape |
|---|---|
| Local `core` | PostgreSQL, Kafka, Schema Registry, Keycloak/JWT support, shared network. |
| Local `app` | Reference Data Service container, nginx routes, outbox publisher process/thread, health endpoint. |
| Local host IDE | Reference Data Service can run on host while `core` stays in Docker; Kafka/Schema Registry remain local dependencies. |
| CI | API, mutation, outbox, schema compatibility, event fixture, and security tests. |
| Operation path | Later stages can map the same state/outbox/event boundaries to production deployment and monitoring. |

## Runtime Topology

```text
[Authorized Caller]
        |
        v
[Reference Data Service]
        |
        +--> [reference_data PostgreSQL]
        |          |
        |          +--> [Reference Tables]
        |          +--> [History / Audit Context]
        |          +--> [Transactional Outbox]
        |
        +--> [Outbox Publisher] --> [Kafka] --> [Schema Registry]
```

Text fallback: authorized callers use Reference Data APIs. Mutations commit reference state and outbox rows atomically. A publisher claims outbox rows, checks schema compatibility, and publishes events to Kafka.

## Compute And Runtime Controls

| Concern | Design |
|---|---|
| API service | Stateless Spring Boot container; database owns durable state. |
| Publisher | Runs independently from command latency using claim/lease batches. |
| Schema compatibility | Blocks required event readiness when Schema Registry checks fail or are unavailable. |
| Validation API | Serves Charge, Booking, CMM, UI, and operations through approved API/service identity. |
| Consumer caching | Allowed only with reference version, set id, freshness marker, and source-of-truth constraints. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements lookup, validation, mutation, history, outbox enqueue, and publisher throughput targets. |
| `security-design.md` | Enforces authenticated/capability-gated APIs, service identity, audit, event identity, and no direct DB joins. |
| `scalability-design.md` | Supports reference sets, records, history, changed events, and consumer-module growth. |
| `reliability-design.md` | Uses transactional outbox, at-least-once publish, compatibility blocks, retry visibility, and no-lost-change behavior. |
| `logical-components.md` | Maps deployment to ReferenceCommandApi, ReferenceValidationApi, ReferenceRepository, ReferenceOutboxWriter, ReferenceEventPublisher, SchemaCompatibilityAdapter, ReferenceAuditWriter, ReferenceHealthReporter, and ServiceAccessGuard. |
| `components.md` | Preserves Reference Data Service ownership for reference records and changed events. |
| `services.md` | Uses Reference Data Service, PostgreSQL, Kafka, Schema Registry, Avro, OpenAPI, and Keycloak/JWT. |
| `business-logic-model.md` | Implements reference lifecycle, validation, event publication, outbox health, and exception workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design preserves Reference Data as source of truth and forbids consumer database joins.
- Transactional outbox deployment protects mutation latency while ensuring no committed reference change lacks event evidence.
- Kafka and Schema Registry are explicit infrastructure dependencies with fail-closed health behavior.
- Residual implementation risk is exact indexes, topic/subject naming, outbox lease tuning, and batch retry thresholds.
