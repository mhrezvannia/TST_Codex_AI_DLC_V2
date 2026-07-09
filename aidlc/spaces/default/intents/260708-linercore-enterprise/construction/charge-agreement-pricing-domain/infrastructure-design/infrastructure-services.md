# Infrastructure Services - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Infrastructure service | Purpose | Profile |
|---|---|---|
| Charge Service | Agreements, tariffs, pricing, D&D rules/calculation, manual fallback, audit. | `app`, `full` |
| PostgreSQL `pricing` | Charge-owned commercial state, idempotency, manual queue, and audit. | `core`, `full` |
| Keycloak/JWT support | User/service authentication and capabilities. | `core`, `full` |
| nginx | Agreement/pricing/D&D API and host override routes. | `app`, `full` |
| Contract test tooling | OpenAPI/Pact validation for Booking/Enterprise Web consumers. | CI/local |

## Storage And Indexes

| Data | Design |
|---|---|
| Agreements/tariffs | Indexed by customer, validity, status, version, trade lane, commodity, and charge code. |
| Pricing results | Immutable result records with request hash, pricing basis, lines, and audit link. |
| D&D rules/results | Free time, rates, chargeable days, rule basis, conflict/manual states, and result lines. |
| Idempotency | Request key, request hash, status, result reference, expiry, and caller. |
| Manual fallback | Reason, owner, approver, resolution, timestamp, and commercial audit. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides lookup, calculation, lifecycle, manual, and throughput infrastructure. |
| `security-design.md` | Applies auth, service identity, audit, data protection, and boundary guards. |
| `scalability-design.md` | Sizes agreements, tariffs, D&D rules, pricing requests, and manual queues. |
| `reliability-design.md` | Persists deterministic results, idempotency, audit, stale-version checks, and typed failures. |
| `logical-components.md` | Allocates infrastructure services to Charge components. |
| `components.md` | Keeps Charge Service ownership explicit. |
| `services.md` | Integrates Charge Service with Booking and Enterprise Web through approved APIs. |
| `business-logic-model.md` | Supports agreement, pricing, D&D, manual fallback, and audit workflows. |
