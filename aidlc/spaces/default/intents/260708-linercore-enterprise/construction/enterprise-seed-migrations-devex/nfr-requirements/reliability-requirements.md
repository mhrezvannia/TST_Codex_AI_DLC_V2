# Reliability Requirements - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means migrations and seed can be rerun, reset, diagnosed, and repaired without hidden manual state.

## Reliability Controls

| Control | Requirement |
|---|---|
| Migrations | Idempotent or versioned migrations with explicit applied state. |
| Seed | Deterministic fixtures with stable identifiers. |
| Reset | Repeatable reset scoped to selected local volumes/databases. |
| Failure reporting | Failed migration/seed names script, service, database, and remediation. |
| Repair | Rollback/repair guidance exists for failed local migration. |
| Evidence | Command output is machine-readable or structured enough for CI/local gates. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines migration, seed, reset, and command evidence workflows. |
| `business-rules.md` | Defines validation and completion guardrails. |
| `requirements.md` | Supplies FR-RUN-006, FR-RUN-007, and no-fake-completion constraints. |
| `technology-stack.md` | Supplies PostgreSQL and Docker Compose context. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |
