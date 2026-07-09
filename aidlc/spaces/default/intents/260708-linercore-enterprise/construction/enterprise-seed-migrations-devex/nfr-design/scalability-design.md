# Scalability Design - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Seed and migration design must cover the complete first-release service set without collapsing database boundaries.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Logical databases/users | `identity`, `reference_data`, `pricing`, `booking`, `container_movement`, Keycloak, and tools. |
| Seeded business records | At least 10,000 across users, roles, references, agreements, tariffs, D&D rules, bookings, journeys, and movements. |
| Migration families | One service-owned migration path per backend service. |
| Reset profiles | Targeted service reset and full enterprise reset. |

## Fixture Partitioning

Fixtures are grouped by service owner and scenario:

- Identity users, roles, capabilities, and service identities.
- Reference data sets and records.
- Agreements, tariffs, pricing terms, and D&D rules.
- Bookings, revisions, exceptions, and pricing snapshots.
- Journeys, expected movements, movement facts, and status snapshots.
- Contract/runtime evidence fixtures where needed.

## Growth Controls

| Trigger | Design response |
|---|---|
| Seed exceeds 10,000 records | Batch by service owner and scenario; validate counts by group. |
| Full setup exceeds 10 minutes | Add targeted setup mode, parallel independent seed groups, or reduce unnecessary fixture coupling. |
| Reset scope grows | Require named profiles and volume/database preview. |
| New backend service | Add its own database/user, migration family, seed group, and reset scope. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements logical databases/users, seeded records, migration families, and reset profile scale. |
| `performance-requirements.md` | Uses targeted modes and grouped fixtures to preserve runtime budgets. |
| `security-requirements.md` | Keeps service ownership and no-cross-SQL controls as the topology grows. |
| `reliability-requirements.md` | Keeps setup, rerun, reset, repair, and evidence deterministic at scale. |
| `tech-stack-decisions.md` | Uses PostgreSQL logical databases/users, Docker Compose, service-owned migrations, repository fixtures, and scripts/docs. |
| `business-logic-model.md` | Implements migration, seed, reset, and devex workflows. |
