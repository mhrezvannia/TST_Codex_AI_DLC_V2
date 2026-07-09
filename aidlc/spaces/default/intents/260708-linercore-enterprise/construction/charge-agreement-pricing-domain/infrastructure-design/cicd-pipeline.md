# CI/CD Pipeline - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Stages

| Stage | Gate |
|---|---|
| Build/unit tests | Agreement lifecycle, pricing, D&D, idempotency, manual fallback, and audit tests pass. |
| SAST/dependency/secret scan | Critical/high exploitable findings and secrets block merge. |
| OpenAPI validation | Agreement, pricing, D&D, audit/manual APIs are executable. |
| Pact provider tests | Booking and Enterprise Web consumer expectations pass. |
| Integration tests | Pricing database, active lookup, stale-version checks, and audit persistence pass. |
| Boundary tests | Charge cannot mutate Booking/CMM lifecycle or query their databases. |
| Performance smoke | Lookup/calculation paths meet agreed local budgets where practical. |

## Blocking Rules

| Gate | Blocking rule |
|---|---|
| Ownership | Charge must not mutate Booking lifecycle or derive CMM status. |
| Determinism | Same pricing/D&D request and versioned data returns same result or same typed failure. |
| Idempotency | Duplicate request behavior is stable and request-hash mismatches reject. |
| Audit | Pricing basis, manual fallback, approver, reason, and rule basis are auditable. |
| Contracts | Booking-facing APIs must satisfy OpenAPI/Pact evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests lookup, pricing, D&D, lifecycle, and manual queue budgets. |
| `security-design.md` | Enforces auth, service access, audit, data protection, and boundaries. |
| `scalability-design.md` | Validates agreement, tariff, D&D rule, request, and manual exception scale. |
| `reliability-design.md` | Proves idempotency, determinism, stale-version, timeout-safe, and audit behavior. |
| `logical-components.md` | Maps CI checks to Charge components. |
| `components.md` | Preserves Charge ownership boundaries. |
| `services.md` | Covers Charge, Booking, Enterprise Web, OpenAPI/Pact, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Covers agreement, pricing, D&D, manual fallback, and audit workflows. |
