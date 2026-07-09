# Shared Infrastructure - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

| Resource | Shared by | Boundary |
|---|---|---|
| Pricing OpenAPI/Pact | Booking and Charge. | Booking consumes; Charge provides. |
| Identity/service JWT | Booking and Charge. | Both validate service/user context. |
| Booking database | Booking. | Stores snapshots and exceptions only. |
| Pricing database | Charge. | Stores pricing basis and audit only. |
| Observability evidence | Booking, Charge, Quality, Operations. | Read-only seam evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares runtime seam while preserving latency and snapshot budgets. |
| `security-design.md` | Enforces service identity and database isolation. |
| `scalability-design.md` | Supports request/snapshot/contract evidence scale. |
| `reliability-design.md` | Preserves typed failure and circuit states. |
| `logical-components.md` | Maps shared resources to seam components. |
| `components.md` | Keeps Booking and Charge boundaries distinct. |
| `services.md` | Supports the approved pricing integration. |
| `business-logic-model.md` | Implements pricing request/response handoff. |
