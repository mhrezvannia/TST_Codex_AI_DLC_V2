# Monitoring Design - shared-platform-reference-events

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And KPIs

| Metric | Target or signal |
|---|---|
| Reference lookup | p95 <= 150 ms. |
| Reference usage validation | p95 <= 150 ms. |
| Create/update/retire record | p95 <= 300 ms excluding downstream publish. |
| History query | p95 <= 500 ms. |
| Outbox enqueue | p95 <= 100 ms inside committed mutation. |
| Validation API throughput | 1,000 validations/minute. |
| Mutation throughput | 100 mutations/minute. |
| Publisher throughput | 1,000 events/minute. |
| Outbox lag | Alert by age and failed/blocked count. |

## Logs And Evidence

Structured logs include correlation id, reference set, record key, operation, actor/service identity, authorization decision, outbox id, event type, schema version, publisher status, and remediation. Logs must not contain secrets or production personal data.

## Alert Definitions

| Alert | Severity | Trigger |
|---|---|---|
| Outbox lag over threshold | P1/P2 by age and event type | Pending/failed/blocked rows exceed limits. |
| Schema Registry unavailable | P1 readiness blocker | Required compatibility check cannot run. |
| Kafka publish failure | P1/P2 | Publisher retries fail or lag grows. |
| Unauthorized mutation attempt | Security event | Denied command or invalid service identity. |
| Consumer validation error spike | P2 | Validation failures rise for Charge, Booking, CMM, UI, or operations. |
| Reference API latency breach | P2 | Lookup, validation, mutation, or history p95 exceeds budget. |

## Dashboard Specification

Dashboards show API latency, mutation rate, validation rate, outbox status, event publish status, Schema Registry compatibility, denied access counts, audit health, and consumer module validation errors. All panels are read-only evidence.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors lookup, validation, mutation, history, outbox, and publisher targets. |
| `security-design.md` | Monitors authorization failures, service access, audit, event identity, and data handling. |
| `scalability-design.md` | Groups views by reference set, record, consumer module, event type, and outbox state. |
| `reliability-design.md` | Alerts on outbox lag, registry failure, Kafka failure, and blocked publish states. |
| `logical-components.md` | Monitoring maps to ReferenceHealthReporter, ReferenceEventPublisher, SchemaCompatibilityAdapter, ReferenceAuditWriter, and ServiceAccessGuard. |
| `components.md` | Feeds Observability Platform and operations readiness. |
| `services.md` | Covers Reference Data Service, Kafka, Schema Registry, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Observes lifecycle, validation, event publication, outbox health, and exception workflows. |
