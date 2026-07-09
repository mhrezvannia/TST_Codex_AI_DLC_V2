# NFR Design Questions - enterprise-seed-migrations-devex

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define migration/seed budgets, no-secret and synthetic-data controls, database ownership, scale baseline, idempotent/versioned migrations, scoped reset, repair guidance, and repository command surface.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Versioned/idempotent migrations, deterministic seed, scoped reset, actionable failure reporting, repair guidance, and structured evidence. |
| Scalability | Identity, reference_data, pricing, booking, container_movement, Keycloak, and tools logical databases/users; at least 10,000 seeded business records. |
| Performance | Full migration plus seed <= 10 minutes, targeted migration plus seed <= 2 minutes, reset <= 5 minutes, report <= 60 seconds. |
| Security | No committed secrets, least-privilege users, synthetic data, explicit reset scope, and no cross-service SQL/shared domain schema. |
| Logical boundaries | This unit owns orchestration and deterministic fixtures, not service-owned schema semantics or real business implementation. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact repository script names and migration tool invocations are implementation details constrained by these designs.
