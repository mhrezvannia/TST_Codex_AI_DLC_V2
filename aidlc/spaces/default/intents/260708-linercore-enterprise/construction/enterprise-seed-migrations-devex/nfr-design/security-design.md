# Security Design - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Seed and migration tooling must make local data deterministic without introducing secrets, production data, or cross-service ownership violations.

## Security Controls

| Control | Design |
|---|---|
| Secrets | Validate seed, migration, `.env.example`, and command docs for committed secrets or production credentials. |
| Database users | Create separate logical users/databases for identity, reference_data, pricing, booking, container_movement, Keycloak, and tools. |
| Least privilege | Grant each local service user only its owned schema/database permissions. |
| Synthetic data | Fixtures use deterministic, non-production identifiers and no production personal data. |
| Reset scope | Reset commands name affected volumes/databases before execution. |
| Boundary | No cross-service SQL joins and no shared domain schema. |

## Data Handling

Seed fixture data exists to prove runtime, migration, contracts, and workflow evidence. It must not encode fake business outcomes that bypass service implementation. Any realistic identifiers are deterministic synthetic values.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements no-secrets, database users, least privilege, synthetic data, reset scope, and boundary controls. |
| `performance-requirements.md` | Keeps validation inside setup/report commands without exceeding budgets. |
| `scalability-requirements.md` | Scales controls across logical databases/users, seed records, migration families, and reset profiles. |
| `reliability-requirements.md` | Ensures rerun, reset, repair, and evidence paths do not require hidden manual state. |
| `tech-stack-decisions.md` | Uses PostgreSQL logical ownership, Docker Compose hooks, service-owned migrations, deterministic fixtures, and repository scripts/docs. |
| `business-logic-model.md` | Implements database/user setup, seed, reset, and command workflows. |
