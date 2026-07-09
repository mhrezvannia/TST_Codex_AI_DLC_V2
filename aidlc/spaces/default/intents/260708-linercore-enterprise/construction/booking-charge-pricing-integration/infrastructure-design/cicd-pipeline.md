# CI/CD Pipeline - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Gates

| Gate | Blocking rule |
|---|---|
| OpenAPI validation | Booking pricing client and Charge provider contract are executable. |
| Pact verification | Booking consumer and Charge provider interactions pass. |
| Seam security tests | Service JWT, user context, idempotency, correlation, and denied paths pass. |
| Resilience tests | Timeout, retry, circuit, 4xx, 5xx, no-price, and manual-required paths are classified. |
| Snapshot tests | Charge success cannot pass without Booking snapshot persistence. |
| Boundary tests | Booking does not calculate pricing and Charge does not mutate Booking lifecycle. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests pricing call and snapshot budgets. |
| `security-design.md` | Enforces auth, idempotency, correlation, and boundary gates. |
| `scalability-design.md` | Validates request/snapshot/exception/Pact scale. |
| `reliability-design.md` | Proves timeout, retry, circuit, snapshot, and contract behavior. |
| `logical-components.md` | Maps CI checks to seam components. |
| `components.md` | Preserves Booking/Charge ownership. |
| `services.md` | Covers Booking-to-Charge HTTP seam. |
| `business-logic-model.md` | Covers request, Charge call, fallback, snapshot, and evidence. |
