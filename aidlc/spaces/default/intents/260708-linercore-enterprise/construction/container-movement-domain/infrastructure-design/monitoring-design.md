# Monitoring Design - container-movement-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And KPIs

| Metric | Signal |
|---|---|
| Journey create/reconcile latency | Booking event and command handling health. |
| Journey/status query latency | Snapshot/index health. |
| Movement capture latency | Validation and persistence health. |
| DCSA validation failures | Data quality and source integration issues. |
| Duplicate/out-of-order events | Idempotency and ordering pressure. |
| Status outbox lag | Publication health and Kafka/Schema Registry status. |
| Boundary violation attempts | Ownership/security regression signal. |
| Audit write health | Required evidence availability. |

## Alert Definitions

| Alert | Severity | Trigger |
|---|---|---|
| Booking event consumer blocked | P1/P2 | Required booking events cannot be consumed or reconciled. |
| Status publication lag | P1/P2 | `containermovement.status` outbox rows exceed age/count threshold. |
| DCSA validation spike | P2 | Movement capture rejects exceed baseline. |
| Ordering conflict spike | P2 | Out-of-order or stale movement exceptions rise. |
| Schema compatibility failure | P1 readiness blocker | CMM event schema fails compatibility. |
| Boundary violation | P1 | CMM attempts Booking lifecycle mutation or pricing/D&D calculation. |

## Dashboard Specification

Dashboards show journey counts, movement capture results, current status snapshots, validation failures, duplicate/out-of-order events, status outbox, consumer offsets, schema compatibility, exception queues, and audit health.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors journey/status, movement capture, expected movement, status derivation, history, and throughput targets. |
| `security-design.md` | Monitors auth, authorization, event security, audit, and boundary controls. |
| `scalability-design.md` | Groups by journey, movement, snapshot, duplicate/out-of-order, and user dimensions. |
| `reliability-design.md` | Alerts on dedupe, ordering, publication, and boundary failure modes. |
| `logical-components.md` | Monitoring maps to JourneyQueryApi, MovementCaptureApi, DcsaValidationAdapter, MovementOrderingPolicy, StatusDerivationEngine, StatusOutboxPublisher, and MovementAuditWriter. |
| `components.md` | Feeds Observability Platform and Enterprise Web operations views. |
| `services.md` | Covers CMM, Booking events, Kafka, Schema Registry, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Observes journey, movement, validation, status, and publication workflows. |
