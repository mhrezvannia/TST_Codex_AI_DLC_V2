# Infrastructure Services - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| PostgreSQL | Logical databases and least-privilege users. |
| Docker Compose hooks | Run setup, migration, seed, validation, and reset inside local runtime. |
| Service migration tools | Service-owned migration paths for identity, reference data, pricing, booking, CMM, Keycloak, and tooling. |
| Fixture repository | Deterministic synthetic seed groups. |
| Command scripts/docs | Setup/start/stop/reset/logs/health/test/E2E command surface. |
| CI artifacts | Migration, seed, reset, validation, and secret-scan evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides command and migration/seed execution infrastructure. |
| `security-design.md` | Applies least privilege, secret scanning, synthetic data, and reset scope. |
| `scalability-design.md` | Supports multiple logical databases/users and fixture groups. |
| `reliability-design.md` | Supports idempotent migrations, deterministic seed, repair, and evidence. |
| `logical-components.md` | Allocates service responsibilities to seed/migration components. |
| `components.md` | Supports Seed And Migration Platform. |
| `services.md` | Uses approved database/service topology. |
| `business-logic-model.md` | Supports provisioning, migration, seed, reset, and command workflows. |
