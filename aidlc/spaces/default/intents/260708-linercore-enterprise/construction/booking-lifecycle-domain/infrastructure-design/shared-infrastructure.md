# Shared Infrastructure - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because Booking uses shared identity, reference data, Charge APIs, CMM events, Kafka, Schema Registry, observability, and Enterprise Web surfaces.

## Shared Resource Inventory

| Shared resource | Shared by | Boundary |
|---|---|---|
| Booking API | Enterprise Web and operations. | Booking owns lifecycle and exceptions. |
| Charge pricing/D&D APIs | Booking and Charge. | Charge calculates; Booking stores snapshots and orchestration state. |
| Kafka/Schema Registry | Booking, CMM, Contract Platform. | Booking produces/consumes approved events only. |
| Reference Data APIs | Booking validation and UI. | Reference Data remains source of truth. |
| Identity/capability services | Booking APIs and Enterprise Web. | Backend authorization remains mandatory. |
| Observability evidence | Booking, operations, quality gates. | Read-only evidence, no manual green status. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Pricing | Booking requests and stores Charge outcomes; it does not calculate price. |
| Movement | Booking consumes CMM status; it does not derive movement status. |
| Database | Booking owns `booking`; no Charge/CMM/reference SQL joins. |
| Events | At-least-once semantics require dedupe and revision checks. |
| UI | Enterprise Web calls Booking APIs and cannot bypass service rules. |

## Shared Flow

```text
[Booking Command]
      |
      v
[Booking Service] --> [Charge APIs]
      |
      +--> [booking DB + outbox]
      |
      +--> [Kafka booking.confirmed]
      |
      +<-- [Kafka containermovement.status]
```

Text fallback: Booking receives commands, calls Charge where needed, persists booking-owned state and outbox events, publishes booking confirmation, and consumes CMM status events.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares integration resources while preserving bounded command/query behavior. |
| `security-design.md` | Enforces service identity, capability checks, audit, and database isolation. |
| `scalability-design.md` | Scales booking/revision/event/exception and UI workloads. |
| `reliability-design.md` | Preserves idempotency, outbox, dedupe, stale revision checks, and exception handling. |
| `logical-components.md` | Maps shared resources to Booking components and integration seams. |
| `components.md` | Keeps Booking, Charge, CMM, Reference Data, Identity, and Enterprise Web boundaries distinct. |
| `services.md` | Supports Booking service topology and integration contracts. |
| `business-logic-model.md` | Implements booking lifecycle, pricing orchestration, confirmation, amendment, and exception workflows. |
