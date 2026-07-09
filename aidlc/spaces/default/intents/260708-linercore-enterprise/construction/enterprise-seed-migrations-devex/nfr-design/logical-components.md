# Logical Components - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define setup, migration, seed, reset, validation, and developer command boundaries.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| DatabaseOwnerProvisioner | Creates/validates logical databases and least-privilege users. | Database ownership. |
| MigrationOrchestrator | Runs service-owned migration paths in dependency-aware order. | Migration execution. |
| DeterministicSeedLoader | Loads non-production fixtures by service/scenario group. | Seed data. |
| SeedValidationReporter | Emits counts, hashes, owners, and validation status. | Evidence reporting. |
| ScopedResetCoordinator | Performs targeted or full local reset with preview. | Destructive local operation. |
| SecretAndFixtureScanner | Validates no secrets or production data in fixtures/docs/examples. | Data protection. |
| CommandSurfaceRegistry | Documents setup/start/stop/reset/logs/health/test/E2E commands. | Developer ergonomics. |
| MigrationRepairGuide | Maps failures to repair/rollback/reset steps. | Recovery. |

## Boundary Model

This unit owns logical database/user setup, migration orchestration, deterministic seed fixtures, reset flows, validation reports, and developer command documentation.

It does not replace real business implementation with seed data, create shared domain schemas, or allow cross-service SQL joins.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Database provisioning failure | Affected service setup blocked. | Owner-specific error and remediation. |
| Migration failure | Dependent seed blocked. | Applied-state report and repair guide. |
| Seed mismatch | Evidence failed. | Fixture group counts/hashes. |
| Secret scan failure | Readiness blocked. | Redaction/removal guidance. |
| Unsafe reset | Command rejected. | Explicit scope and preview. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Migration/seed timing | MigrationOrchestrator and DeterministicSeedLoader. |
| Least privilege | DatabaseOwnerProvisioner. |
| Synthetic/no-secret data | SecretAndFixtureScanner and DeterministicSeedLoader. |
| Scoped reset | ScopedResetCoordinator. |
| Structured evidence | SeedValidationReporter. |
| Repair/rerun | MigrationRepairGuide and MigrationOrchestrator. |
| Command help/status | CommandSurfaceRegistry. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support full/targeted migration and seed, reset, validation report, and command response budgets. |
| `security-requirements.md` | Components enforce secrets, database users, least privilege, synthetic data, reset scope, and boundary controls. |
| `scalability-requirements.md` | Components support logical databases/users, seed records, migration families, and reset profiles. |
| `reliability-requirements.md` | Components implement idempotent/versioned migration, deterministic seed, scoped reset, failure reporting, repair, and evidence. |
| `tech-stack-decisions.md` | Components map to PostgreSQL logical databases/users, Docker Compose hooks, service-owned migrations, deterministic repository fixtures, and scripts/docs. |
| `business-logic-model.md` | Components implement database/user setup, migrations, seed, reset, and developer command workflows. |
