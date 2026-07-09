# Shared Infrastructure - container-movement-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because CMM shares booking events, status events, reference data, identity, Kafka, Schema Registry, Enterprise Web, and observability infrastructure.

## Shared Resource Inventory

| Shared resource | Shared by | Boundary |
|---|---|---|
| Booking events | Booking producer and CMM consumer. | Booking owns booking lifecycle; CMM owns journey/status interpretation. |
| CMM status events | CMM producer and Booking consumer. | CMM derives status; Booking decides lifecycle/D&D relevance. |
| Reference Data APIs | CMM validation. | Reference Data remains source of truth. |
| Identity/capability services | CMM APIs and service consumers. | Backend authorization remains mandatory. |
| Kafka/Schema Registry | Booking/CMM events and contract checks. | Schemas and message-pacts gate readiness. |
| Enterprise Web | Journey, movement, status, and exception views. | UI does not own CMM business rules. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Booking | CMM consumes booking context but does not mutate booking lifecycle. |
| Charge/D&D | CMM does not calculate pricing, D&D, free time, or chargeable days. |
| Database | CMM owns `container_movement`; no Booking/Charge SQL access. |
| Events | At-least-once semantics require dedupe and ordering evidence. |
| UI | Enterprise Web calls CMM APIs and cannot bypass service rules. |

## Shared Flow

```text
[booking.confirmed]
      |
      v
[CMM Service] --> [container_movement DB]
      |
      v
[containermovement.status]
```

Text fallback: CMM consumes booking confirmation context, persists movement facts and status snapshots, and publishes movement status events for Booking and UI consumers.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares event/runtime resources while preserving bounded status and capture behavior. |
| `security-design.md` | Enforces service identity, audit, event security, and database isolation. |
| `scalability-design.md` | Scales journey, movement, status, duplicate/out-of-order, and UI workloads. |
| `reliability-design.md` | Preserves dedupe, ordering, outbox publication, and boundary checks. |
| `logical-components.md` | Maps shared resources to CMM components and integration seams. |
| `components.md` | Keeps CMM, Booking, Charge, Reference Data, Identity, and Enterprise Web boundaries distinct. |
| `services.md` | Supports CMM service topology and event contracts. |
| `business-logic-model.md` | Implements journey, movement, validation, status, and publication workflows. |
