# Infrastructure Design Questions - shared-platform-identity-security

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the Keycloak, Identity Service, PostgreSQL, JWT/RS256, capability, audit, local bypass, and Kafka identity-hook posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Identity Service remains a Spring Boot container in local `app`/`full` profiles, backed by Keycloak and PostgreSQL in `core`. |
| Compute | Stateless Identity Service instances with local horizontal scaling possible after persistence/indexes are stable. |
| Storage | `identity` logical database/user, Keycloak database, indexed capability/role/audit tables, and bounded permission cache. |
| Networking | nginx and service routes expose authenticated APIs; backend services validate JWTs and call authorization paths as needed. |
| Monitoring | Auth, authorization, denied-path, service JWT, audit-write, cache invalidation, and Keycloak bootstrap evidence. |
| Security | Least-privilege capabilities, backend enforcement, service JWT validation, no route-hiding as authorization, redacted logs, and local-only bypass guard. |
| Scaling | At least 10 protected modules, 100 capabilities, 25 role/service identities, 10,000 audit records, and 50 concurrent permission lookups. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact table/index names, cache TTLs, Keycloak import files, service account names, and route names are implementation details constrained by this design.
