# Security Design - U01 Platform Skeleton

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`security-requirements.md` requires BFF-only access, Keycloak/Vault placeholders, hexagonal boundary controls, no public cloud, no direct database coupling, and logging/audit conventions. `tech-stack-decisions.md` fixes Keycloak 24, Docker Compose, Nginx, Vault references, Java/Spring, Next.js, Yarn, and prohibited dependencies.

## Security Architecture

| Boundary | Design |
|---|---|
| Browser to app | Browser traffic reaches frontend apps through Nginx and App Router/BFF routes. |
| App to backend | BFF route handlers call backend services; browser-visible code never calls services directly. |
| Backend domain | `domain-core` has no Spring, JPA, Kafka, Jackson, Lombok, frontend, or adapter imports. |
| Secrets | Local-only placeholders for development; staging/production descriptors use Vault references. |
| Identity | Keycloak 24 is the authentication provider; `identity-service` owns authorization later. |
| Contracts | OpenAPI/Avro paths expose integration contracts, not database tables. |

## Defense-in-Depth Patterns

- Standard error envelope includes code, message, correlation id, timestamp, and optional safe details.
- Structured logs include correlation id but must not contain tokens or restricted payloads.
- CI script seams allow U08 to enforce domain-core purity, dependency rules, lockfile rules, and prohibited package checks.
- Runtime descriptors avoid AWS/public-cloud and Kubernetes assumptions for this MVP.

## Compliance Controls

U01 reserves the controls needed by later units for Confidential/Restricted Party/Customer and authorization data: TLS-ready routing, Vault references, audit/log conventions, service-owned datastore boundaries, and no direct consumer database access.

## Non-Goals

U01 does not implement final role policy, audit query behavior, production IAM, or full STRIDE details.

