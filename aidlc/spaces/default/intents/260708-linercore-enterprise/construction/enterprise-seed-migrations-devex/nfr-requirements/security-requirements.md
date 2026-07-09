# Security Requirements - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Seed and migration tooling must make local data deterministic without introducing secrets, production data, or cross-service database ownership violations.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Secrets | No committed secrets in seed, migration, `.env.example`, or command docs. |
| Database users | Separate logical users/databases for service ownership. |
| Least privilege | Local service users receive only required grants. |
| Synthetic data | Seed data is deterministic and non-production. |
| Reset scope | Reset commands explicitly name affected local volumes/databases. |
| Boundary | No cross-service SQL joins or shared domain schema. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines database/user setup, seed, reset, and command workflows. |
| `business-rules.md` | Defines no-seed-as-business and no-cross-SQL boundaries. |
| `requirements.md` | Supplies FR-RUN-004 through FR-RUN-007 and NFR-SEC controls. |
| `technology-stack.md` | Supplies PostgreSQL and Docker Compose context. |
| `nfr-requirements-questions.md` | Q2 sets security controls. |
