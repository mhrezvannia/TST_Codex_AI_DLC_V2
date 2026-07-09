# CI/CD Pipeline - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Gates

| Gate | Blocking rule |
|---|---|
| Migration validation | Service-owned migrations apply cleanly and in expected order. |
| Seed validation | Fixture counts/hashes and owner metadata match expected report. |
| Secret/fixture scan | Secrets or production data block readiness. |
| Least-privilege DB users | Services have owned database access only. |
| Reset safety | Reset requires explicit scope and preview. |
| No fake completion | Seed data cannot be used as proof of business implementation. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests migration/seed/reset/report budgets. |
| `security-design.md` | Enforces secret, fixture, privilege, and reset gates. |
| `scalability-design.md` | Validates database/user, fixture, migration, and reset scale. |
| `reliability-design.md` | Proves idempotent migration, deterministic seed, repair, and evidence. |
| `logical-components.md` | Maps CI checks to seed/migration components. |
| `components.md` | Supports Seed And Migration Platform. |
| `services.md` | Covers per-service database topology. |
| `business-logic-model.md` | Covers provisioning, migration, seed, reset, and command docs. |
