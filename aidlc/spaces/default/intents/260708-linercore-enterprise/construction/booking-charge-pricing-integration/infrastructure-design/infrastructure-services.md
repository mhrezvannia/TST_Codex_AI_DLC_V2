# Infrastructure Services - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| Booking Service | Consumer client, request preparation, orchestration state, exception classification, pricing snapshot. |
| Charge Service | Provider endpoint, pricing calculation, pricingRef, provider audit. |
| PostgreSQL `booking` | Snapshot, request state, exceptions, idempotency evidence. |
| PostgreSQL `pricing` | Pricing basis, result, commercial audit. |
| Keycloak/JWT | Service identity and user/capability context. |
| Contract Platform | OpenAPI/Pact evidence for the seam. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides latency and snapshot persistence controls. |
| `security-design.md` | Applies service JWT, correlation, denied paths, and boundary controls. |
| `scalability-design.md` | Supports request/snapshot/exception/Pact volume. |
| `reliability-design.md` | Supports timeout, retry, circuit, idempotency, and snapshot failure handling. |
| `logical-components.md` | Allocates seam responsibilities to Booking and Charge infrastructure. |
| `components.md` | Keeps Booking and Charge boundaries distinct. |
| `services.md` | Uses approved HTTP pricing seam. |
| `business-logic-model.md` | Supports Booking-to-Charge pricing workflow. |
