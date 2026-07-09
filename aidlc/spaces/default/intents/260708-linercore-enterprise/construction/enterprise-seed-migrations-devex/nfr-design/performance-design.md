# Performance Design - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Performance targets make local and CI setup repeatable enough for enterprise validation.

## Runtime Budgets

| Operation | Target | Design control |
|---|---|---|
| Full migration plus deterministic seed | <= 10 minutes after containers are ready. | Run service-owned migrations in dependency-aware order and seed by deterministic fixture batches. |
| Targeted service migration plus seed | <= 2 minutes. | Scope to one logical database/service and skip unrelated fixtures. |
| Reset selected local volumes | <= 5 minutes excluding service-specific migrations/seeds. | Require explicit reset scope and delete only selected workspace-owned local volumes/databases. |
| Seed validation report | <= 60 seconds after seed execution. | Generate counts, hashes, owners, and validation status from structured seed output. |
| Command help/status | <= 5 seconds. | Precompute command metadata in docs/scripts and avoid starting runtime services. |

## Execution Model

The orchestrator command prepares PostgreSQL logical databases/users, runs each service-owned migration path, loads deterministic non-production fixtures, validates counts and ownership boundaries, and emits a structured report for local/CI gates.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements migration, targeted seed, reset, validation report, and command response budgets. |
| `security-requirements.md` | Keeps no-secret validation, least privilege, synthetic fixtures, reset scope, and no-cross-SQL controls in setup. |
| `scalability-requirements.md` | Covers all required logical databases/users, migration families, seed volume, and reset profiles. |
| `reliability-requirements.md` | Uses versioned/idempotent migrations, deterministic seed, repair guidance, and structured evidence. |
| `tech-stack-decisions.md` | Uses PostgreSQL logical databases/users, Docker Compose hooks, service-owned migration tooling, repository fixtures, and repository scripts/docs. |
| `business-logic-model.md` | Implements database/user setup, migration, seed, reset, and command documentation workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design maps every runtime target to a bounded command behavior and evidence artifact.
- Targeted service workflows avoid rerunning the whole enterprise setup for local iteration.
- Seed fixtures are clearly evidence data, not a substitute for domain behavior.
- Residual implementation risk is in exact script orchestration, migration tool wiring, and Windows timing validation.
