# CI/CD Pipeline - dnd-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Gates

| Gate | Blocking rule |
|---|---|
| OpenAPI validation | D&D request/result contract is executable. |
| Pact verification | Booking consumer and Charge provider D&D interactions pass. |
| Trigger tests | Duplicate and stale boundary triggers are deterministic. |
| Resilience tests | Timeout, retry, circuit, no-rule, conflict, and manual-required paths are classified. |
| Snapshot tests | Charge success/manual state cannot pass without Booking evidence. |
| Boundary tests | Booking does not calculate D&D; CMM does not decide D&D relevance. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests trigger, call, and snapshot budgets. |
| `security-design.md` | Enforces service auth, idempotency, correlation, and boundary gates. |
| `scalability-design.md` | Validates request/result/fallback/Pact scale. |
| `reliability-design.md` | Proves timeout, retry, circuit, idempotency, snapshot, and contract behavior. |
| `logical-components.md` | Maps CI checks to D&D seam components. |
| `components.md` | Preserves Booking/Charge/CMM ownership. |
| `services.md` | Covers Booking-to-Charge D&D HTTP seam. |
| `business-logic-model.md` | Covers D&D trigger, request/result, manual fallback, and audit evidence. |
