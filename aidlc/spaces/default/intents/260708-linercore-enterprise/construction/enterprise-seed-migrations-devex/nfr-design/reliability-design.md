# Reliability Design - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means migrations and seed can be rerun, reset, diagnosed, and repaired without hidden manual state.

## Reliability Patterns

| Control | Design |
|---|---|
| Migrations | Versioned or idempotent migrations with explicit applied state per service-owned path. |
| Seed | Deterministic fixtures with stable identifiers and validation hashes/counts. |
| Reset | Repeatable reset scoped to selected local volumes/databases. |
| Failure reporting | Failed migration/seed names script, service, database, step, and remediation. |
| Repair | Rollback or repair guidance exists for failed local migration. |
| Evidence | Command output is JSON or structured enough for CI/local gates. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Database unavailable | Fail setup with service/database owner and Docker/profile remediation. |
| Migration failure | Stop dependent seed, report migration path/version/error/remediation. |
| Seed validation mismatch | Report fixture group, expected/actual counts or hash, and repair command. |
| Reset scope unsafe | Reject command before destructive action. |
| Cross-service SQL attempt | Fail validation and block readiness. |

## Rerun Model

Rerunning setup after a successful run is safe and reports already-applied migrations and already-seeded deterministic records. Rerunning after failure resumes from explicit applied state or requires documented repair/reset.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements idempotent/versioned migrations, deterministic seed, scoped reset, failure reporting, repair, and structured evidence. |
| `performance-requirements.md` | Keeps rerun and report behavior bounded by setup budgets. |
| `security-requirements.md` | Preserves secret-free, least-privilege, synthetic-data, reset-scope, and no-cross-SQL controls. |
| `scalability-requirements.md` | Supports full first-release database/user, seed, migration, and reset topology. |
| `tech-stack-decisions.md` | Uses PostgreSQL, Docker Compose hooks, service-owned migration tooling, deterministic fixtures, and scripts/docs. |
| `business-logic-model.md` | Implements migration, seed, reset, and command evidence workflows. |
