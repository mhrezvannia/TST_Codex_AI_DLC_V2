# Scalability Requirements - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Seed and migration design must cover the complete first-release service set without collapsing database boundaries.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Logical databases/users | identity, reference_data, pricing, booking, container_movement, Keycloak, and tools. |
| Seeded business records | At least 10,000 across users, roles, references, agreements, tariffs, D&D rules, bookings, journeys, and movements. |
| Migration families | One service-owned migration path per backend service. |
| Reset profiles | Targeted service reset and full enterprise reset. |

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines migration, seed, reset, and devex workflows. |
| `business-rules.md` | Defines ownership and no-cross-SQL rules. |
| `requirements.md` | Supplies FR-RUN-004 and FR-RUN-007. |
| `technology-stack.md` | Supplies PostgreSQL and Docker Compose context. |
| `nfr-requirements-questions.md` | Q3 sets seed/migration scale. |
