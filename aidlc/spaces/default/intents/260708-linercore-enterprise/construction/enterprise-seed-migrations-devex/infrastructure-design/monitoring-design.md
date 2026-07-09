# Monitoring Design - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| Database owner provisioning | Missing database/user or privilege mismatch. |
| Migration status | Failed, skipped, out-of-order, or drifted migration. |
| Seed validation | Count/hash mismatch or owner mismatch. |
| Secret/fixture scan | Secret or production data in fixtures/docs/examples. |
| Reset safety | Unsafe scope or unpreviewed destructive action. |
| Command evidence | Missing setup/seed/migration/reset report. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors migration/seed/reset/report command budgets. |
| `security-design.md` | Monitors secret scans, least privilege, synthetic data, reset scope, and boundaries. |
| `scalability-design.md` | Groups by database, migration family, fixture group, and reset profile. |
| `reliability-design.md` | Alerts on migration drift, seed mismatch, unsafe reset, and repair states. |
| `logical-components.md` | Monitoring maps to provisioner, orchestrator, loader, reporter, reset coordinator, scanner, registry, and repair guide. |
| `components.md` | Feeds Local Runtime and Observability evidence. |
| `services.md` | Covers all service database owners. |
| `business-logic-model.md` | Observes setup, migration, seed, reset, and command workflows. |
