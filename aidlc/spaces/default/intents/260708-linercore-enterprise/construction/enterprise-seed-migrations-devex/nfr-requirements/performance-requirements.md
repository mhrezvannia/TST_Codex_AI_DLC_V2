# Performance Requirements - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Performance targets make local and CI setup repeatable enough for enterprise validation.

## Runtime Targets

| Operation | Target |
|---|---|
| Full migration plus deterministic seed | Complete within 10 minutes after containers are ready. |
| Targeted service migration plus seed | Complete within 2 minutes. |
| Reset selected local volumes | Complete within 5 minutes excluding service-specific migrations/seeds. |
| Seed validation report | Generate within 60 seconds after seed execution. |
| Command help/status | Return within 5 seconds. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines database/user setup, migration, seed, reset, and command documentation workflows. |
| `business-rules.md` | Defines validation, evidence, ownership, and boundary rules. |
| `requirements.md` | Supplies FR-RUN-004, FR-RUN-006, FR-RUN-007, and local runtime requirements. |
| `technology-stack.md` | Supplies Docker Compose and PostgreSQL context. |
| `nfr-requirements-questions.md` | Q1 sets migration and seed budgets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable across full migration/seed, targeted service seed, reset, validation report, and command response targets.
- Security requirements enforce no committed secrets, separate logical users/databases, least privilege, synthetic seed data, explicit reset scope, and no cross-service SQL.
- Reliability requirements require idempotent/versioned migrations, deterministic seed, scoped reset, actionable failure reporting, and structured evidence.
- Technology decisions preserve service-owned migrations and PostgreSQL logical ownership rather than a shared database.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- Infrastructure Design must wire exact Compose hooks, migration commands, database users, and reset scopes.
- Build and Test must prove repeatability across clean setup, rerun, partial failure, and reset scenarios.
