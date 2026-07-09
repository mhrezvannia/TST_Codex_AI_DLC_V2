# NFR Design Questions - local-runtime-foundation

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define startup budgets, command budgets, secure local defaults, local capacity, readiness states, failure behavior, and the selected Docker Compose based technology stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Runtime commands fail honestly, preserve logs, and never mark container startup as application or evidence readiness. |
| Scalability | Profiles support identity, reference data, charge, booking, CMM, Enterprise Web, observability, PostgreSQL, Keycloak, Kafka, Schema Registry, and nginx. |
| Performance | `core` starts within 5 minutes, `app` within 10 minutes with images built, `full` within 15 minutes when dependent units exist. |
| Security | `.env.example` is secret-free, Keycloak bootstrap is deterministic, JWT/RS256 settings are visible, and bypass flags are local-only. |
| Logical boundaries | Local Runtime owns Compose substrate and command surfaces, not business migrations, seed data, production cloud, or final observability semantics. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact script names, Compose service names, and port values remain implementation details for Code Generation and Infrastructure Design.
