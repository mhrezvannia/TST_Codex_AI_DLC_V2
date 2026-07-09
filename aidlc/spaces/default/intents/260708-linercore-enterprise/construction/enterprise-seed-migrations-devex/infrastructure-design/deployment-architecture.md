# Deployment Architecture - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys developer and CI command infrastructure for logical databases/users, service-owned migrations, deterministic seed fixtures, scoped reset, and validation reports.

## Runtime Topology

```text
[Developer/CI Command]
        |
        v
[Command Surface Registry]
        |
        +--> [DatabaseOwnerProvisioner] --> [PostgreSQL logical DBs/users]
        +--> [MigrationOrchestrator] ----> [Service-owned migrations]
        +--> [DeterministicSeedLoader] --> [Synthetic fixtures]
        +--> [SeedValidationReporter] --> [Counts / hashes / evidence]
        +--> [ScopedResetCoordinator] --> [Preview + reset report]
```

Text fallback: a developer or CI command provisions database owners, runs service migrations, loads deterministic synthetic seed data, validates evidence, and performs scoped resets with a preview.

## Deployment Controls

| Concern | Design |
|---|---|
| Database ownership | Separate logical database and least-privilege user per service. |
| Migration order | Dependency-aware orchestration while migrations remain service-owned. |
| Seed data | Deterministic non-production fixtures, counts, hashes, owner metadata, and validation status. |
| Reset | Explicit scope preview; rejects arbitrary host paths and external volumes. |
| No fake completion | Seed fixtures support validation but cannot replace implemented business behavior. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports full/targeted migration and seed, reset, report, and command response budgets. |
| `security-design.md` | Enforces secrets, database users, least privilege, synthetic data, reset scope, and boundaries. |
| `scalability-design.md` | Supports logical databases/users, seed records, migration families, and reset profiles. |
| `reliability-design.md` | Implements idempotent/versioned migration, deterministic seed, scoped reset, failure reporting, repair, and evidence. |
| `logical-components.md` | Maps to DatabaseOwnerProvisioner, MigrationOrchestrator, DeterministicSeedLoader, SeedValidationReporter, ScopedResetCoordinator, SecretAndFixtureScanner, CommandSurfaceRegistry, and MigrationRepairGuide. |
| `components.md` | Supports Seed And Migration Platform and Local Runtime Platform responsibilities. |
| `services.md` | Provides per-service database ownership for identity, reference data, pricing, booking, CMM, Keycloak, and tools. |
| `business-logic-model.md` | Implements setup, migrations, seed, reset, and developer command workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps migrations service-owned while centralizing orchestration and evidence.
- Least-privilege database users and scoped reset prevent shared-schema or destructive-command drift.
- Seed fixtures are explicitly evidence data, not substitutes for implemented business behavior.
