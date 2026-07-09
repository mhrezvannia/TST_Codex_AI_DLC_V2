# Shared Infrastructure - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

| Resource | Shared by | Boundary |
|---|---|---|
| PostgreSQL instance | All backend services and Keycloak. | Separate logical databases/users; no cross-service SQL joins. |
| Migration command surface | All service modules. | Migrations remain service-owned. |
| Seed fixture groups | Local runtime, tests, E2E flows. | Synthetic evidence only. |
| Reset command | Local Runtime and developers. | Explicit scoped reset only. |
| Validation reports | CI, Quality, Operations. | Read-only evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares setup infrastructure while preserving command budgets. |
| `security-design.md` | Enforces least privilege, synthetic fixtures, and safe reset. |
| `scalability-design.md` | Supports all first-release service databases and fixture groups. |
| `reliability-design.md` | Preserves idempotent migration, deterministic seed, repair, and evidence. |
| `logical-components.md` | Maps shared resources to seed/migration components. |
| `components.md` | Supports Local Runtime and Seed/Migration platforms. |
| `services.md` | Provides database/user setup for enterprise service topology. |
| `business-logic-model.md` | Implements shared setup, migration, seed, reset, and command flows. |
