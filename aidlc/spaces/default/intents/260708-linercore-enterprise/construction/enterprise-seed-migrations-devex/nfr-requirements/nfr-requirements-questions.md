# NFR Requirements Questions - enterprise-seed-migrations-devex

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Migration And Seed Performance

What runtime budget should migrations and seed support?

A. Full migration plus deterministic seed should complete within 10 minutes locally after containers are ready; targeted service migration/seed should complete within 2 minutes. Recommended.
B. Full migration/seed may take 30 minutes.
C. No target.
D. Manual setup only.
E. Defer performance.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. No committed secrets, separate logical database users, least-privilege local grants, synthetic seed data, explicit reset scope, and no cross-service SQL joins. Recommended.
B. Shared admin user for all services.
C. Production-like data copied locally.
D. Secrets committed for convenience.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release seed/migration scale should be supported?

A. Databases/users for identity, reference data, pricing, booking, CMM, Keycloak, and tools; at least 10,000 seeded business records across modules. Recommended.
B. Shared Platform only.
C. Demo seed only.
D. No target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. Idempotent migrations, deterministic seed, repeatable reset, rollback/repair guidance for failed migration, and auditable command output. Recommended.
B. Best-effort SQL scripts.
C. Manual DB edits.
D. Ignore failed seed rows.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. PostgreSQL logical databases/users, service-owned migration tools, Docker Compose hooks, repository scripts, and deterministic fixture files. Recommended.
B. One shared database/schema for all services.
C. Spreadsheet seed.
D. Production data clone.
E. Defer stack.
X. Other (please specify)

[Answer]: A
