# Infrastructure Design Questions - U02 Identity Authz Service

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U02-identity-authz-service`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Deploy `identity-service` as a stateless Java 21 / Spring Boot 3.3 container behind internal Nginx/service routing. Scale HTTP decision/read instances horizontally; keep role assignment and audit durability in owned PostgreSQL.

### Q2. Compute/storage/networking

[Answer]: Provide an internal service endpoint for BFFs and backend services, an owned PostgreSQL schema/database, Keycloak/JWKS connectivity, Vault-referenced secrets for non-local environments, and no direct browser or cross-service database access.

### Q3. Monitoring approach

[Answer]: Emit metrics for authorization decision latency, allow/deny/fail-closed counts, Keycloak metadata/JWKS latency, PostgreSQL latency, role assignment writes, audit writes, and dependency failures. Logs/traces carry correlation id and safe reason codes.

### Q4. CI/CD pipeline

[Answer]: Run Java/Maven compile, tests, coverage, domain-core purity checks, OpenAPI validation, container build, dependency/config checks, and smoke for one allow/deny/fail-closed decision path.

### Q5. Secrets management

[Answer]: Local development may use local-only credentials. Non-local DB credentials, Keycloak client secrets, signing/JWKS config, and operational credentials are Vault references. Logs and evidence never print tokens or secrets.

### Q6. Scaling policy

[Answer]: Horizontal scale is safe for decision APIs. Role assignment writes rely on optimistic versioning in PostgreSQL. Cache only provider metadata and bounded policy projections that preserve policyVersion correctness.

## Ambiguity Analysis

No blocking ambiguity remains. Final production sizing, retention windows, and HA topology are deferred to environment/performance validation stages.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
