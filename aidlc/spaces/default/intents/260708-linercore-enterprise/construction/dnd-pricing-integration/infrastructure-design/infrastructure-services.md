# Infrastructure Services - dnd-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| Booking Service | D&D trigger, request orchestration, snapshot/manual state, trigger evidence. |
| Charge Service | D&D rules, free time, rates, chargeable days, result, audit. |
| CMM Service | Movement status/facts source only. |
| PostgreSQL `booking` | D&D trigger state, snapshot, manual state, idempotency. |
| PostgreSQL `pricing` | D&D rules/result and commercial audit. |
| Contract Platform | OpenAPI/Pact evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides trigger, request, call, and snapshot infrastructure. |
| `security-design.md` | Applies service JWT, context, idempotency, correlation, and boundaries. |
| `scalability-design.md` | Supports request/result/fallback/Pact scale. |
| `reliability-design.md` | Supports timeout, retry, circuit, idempotency, snapshot, and contract behavior. |
| `logical-components.md` | Allocates D&D seam responsibilities. |
| `components.md` | Keeps Booking, Charge, and CMM boundaries distinct. |
| `services.md` | Uses approved D&D HTTP seam. |
| `business-logic-model.md` | Supports D&D trigger and pricing handoff workflow. |
