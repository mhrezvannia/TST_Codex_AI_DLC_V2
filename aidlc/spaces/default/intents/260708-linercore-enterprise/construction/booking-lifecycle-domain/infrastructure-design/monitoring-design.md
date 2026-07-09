# Monitoring Design - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And KPIs

| Metric | Signal |
|---|---|
| Draft/create/update/confirm latency | p95 command budgets from performance design. |
| Query/search latency | Indexed read-path health and pagination. |
| Charge pricing/D&D seam status | success, pending, timeout, conflict, manual-required, failed. |
| Booking outbox lag | pending/failed/blocked age and count. |
| CMM status consumer health | consumed, deduplicated, stale, conflicting, exception counts. |
| Exception queue age | open/assigned/resolved by type, owner, severity. |
| Idempotency collisions | duplicate, request-hash mismatch, replay counts. |
| Audit write health | missing or failed sensitive audit records. |

## Alert Definitions

| Alert | Severity | Trigger |
|---|---|---|
| Confirm path blocked | P1/P2 | Confirmation cannot complete due to internal Booking blocker. |
| Charge seam degraded | P2 | Pricing/D&D timeouts or circuit-open states exceed threshold. |
| Outbox lag | P1/P2 | Booking lifecycle events remain unpublished beyond threshold. |
| CMM event conflict spike | P2 | Movement-status events produce stale/conflict exceptions. |
| Exception queue aging | P2/P3 | Assigned/unassigned exceptions exceed owner SLA. |
| Denied-path regression | P1 | Protected action bypasses authorization or lacks audit. |

## Dashboard Specification

Dashboards show booking lifecycle counts, command/query latency, pricing orchestration states, D&D trigger states, outbox status, CMM consumer status, exception queues, idempotency outcomes, and audit health. Views are read-only operational evidence.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors command/query, confirmation, exception, audit, and integration budgets. |
| `security-design.md` | Monitors auth, authorization, service seams, denied paths, and audit. |
| `scalability-design.md` | Groups data by booking, revision, exception, event, and user dimensions. |
| `reliability-design.md` | Alerts on idempotency, outbox, dedupe, stale revision, exception, and audit failure modes. |
| `logical-components.md` | Monitoring maps to BookingStateMachine, PricingOrchestrationState, ExceptionQueueManager, BookingOutboxWriter, MovementStatusConsumer, and BookingAuditWriter. |
| `components.md` | Feeds Observability Platform and Enterprise Web operations views. |
| `services.md` | Covers Booking, Charge, CMM, Kafka, Schema Registry, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Observes create, validate, pricing, snapshot, confirm, amend, reconfirm, and exception workflows. |
