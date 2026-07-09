# NFR Design Questions - shared-platform-identity-security

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define authorization latency targets, mandatory backend enforcement, capability catalog scale, audit durability, token validation, service identity handling, and the brownfield Keycloak/Identity Service stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Protected actions fail closed on invalid tokens, missing capabilities, ambiguous subjects, invalid service JWTs, and unsafe local bypass. |
| Scalability | First release supports at least 10 protected modules, 100 capabilities, 25 roles/service identities, 10,000 audit records, and 50 concurrent permission lookups. |
| Performance | Permission lookup p95 <= 100 ms cached/read-optimized; policy evaluation p95 <= 250 ms; shell context p95 <= 500 ms. |
| Security | Keycloak auth, JWT/RS256 validation, capability-level checks, denied-path tests, durable audit, and no full-token audit storage. |
| Logical boundaries | Identity Service owns subjects, capabilities, decisions, service identity hooks, and audit; domain services own business state. |

## Ambiguity Analysis

No blocking ambiguity was found. Cache TTL values, exact claim names, database indexes, and library wiring are implementation choices for Code Generation and Build and Test, constrained by these design artifacts.
