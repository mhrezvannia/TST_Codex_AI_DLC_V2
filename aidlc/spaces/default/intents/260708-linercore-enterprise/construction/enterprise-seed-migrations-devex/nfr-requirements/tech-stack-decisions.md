# Tech Stack Decisions - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The selected posture uses existing local runtime infrastructure and service-owned migrations rather than a shared enterprise database.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Database | PostgreSQL logical databases/users | Matches local stack and service ownership boundaries. |
| Runtime hooks | Docker Compose commands/profiles | Integrates with local-runtime foundation. |
| Migration ownership | Service-owned migration tooling | Keeps schema ownership with each backend service. |
| Seed data | Deterministic repository fixtures | Supports repeatable local and CI evidence. |
| Command surface | Repository scripts/docs | Required for setup/start/stop/reset/logs/health/tests/E2E commands. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| One shared database/schema | Violates no-cross-service SQL and ownership. |
| Production data clone | Violates local-first synthetic data posture. |
| Seed fixtures as business implementation | Violates completion guardrail. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines database/user setup, migration, seed, reset, and devex workflows. |
| `business-rules.md` | Defines boundaries and evidence rules. |
| `requirements.md` | Supplies FR-RUN and seed/migration requirements. |
| `technology-stack.md` | Supplies PostgreSQL, Docker Compose, service stack, and scripts context. |
| `nfr-requirements-questions.md` | Q5 selects seed/migration stack posture. |
