# Shared Infrastructure - dnd-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

| Resource | Shared by | Boundary |
|---|---|---|
| D&D OpenAPI/Pact | Booking and Charge. | Booking consumes; Charge provides calculation. |
| Movement status evidence | Booking and CMM. | CMM provides status; Booking decides D&D relevance. |
| Booking database | Booking. | Stores trigger/snapshot/manual state only. |
| Pricing database | Charge. | Stores D&D rules/result/audit only. |
| Observability evidence | Booking, Charge, Quality, Operations. | Read-only seam evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares runtime seam while preserving trigger/call/snapshot budgets. |
| `security-design.md` | Enforces service identity and database isolation. |
| `scalability-design.md` | Supports request/result/fallback/contract evidence scale. |
| `reliability-design.md` | Preserves typed failure and circuit states. |
| `logical-components.md` | Maps shared resources to D&D seam components. |
| `components.md` | Keeps Booking, Charge, and CMM boundaries distinct. |
| `services.md` | Supports the approved D&D integration. |
| `business-logic-model.md` | Implements D&D request/result handoff. |
