# CI/CD Pipeline - shared-platform-identity-security

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Stages

| Stage | Gate |
|---|---|
| Build and unit tests | Identity security code compiles and core auth/authorization unit tests pass. |
| SAST and dependency scan | Critical/high exploitable findings block merge. |
| Secret scan | Tokens, passwords, and unsafe committed config block merge. |
| Keycloak import validation | Realm/client/user/role/callback import is deterministic. |
| JWT validation tests | Issuer, audience, signature, expiry, and required claims tested. |
| Denied-path tests | Protected backend actions deny unauthorized subjects and write audit. |
| Service JWT tests | Service-to-service identity checks pass/fail correctly. |
| Permission cache tests | Capability/role version changes invalidate affected effective permissions. |
| Audit durability tests | Required audit records persist and are queryable. |

## Security Gates

| Gate | Blocking rule |
|---|---|
| Backend enforcement | Route hiding alone cannot satisfy authorization. |
| Local bypass | Bypass must be explicit local-only and visible in readiness output. |
| Token handling | Full tokens and secrets must not appear in logs/audit. |
| Least privilege | Over-broad role/service grants require explicit failure or approved exception. |
| Audit evidence | Missing denied or sensitive allowed audit evidence blocks readiness. |

## Rollback And Recovery

Identity changes roll back through normal git revert and rerun of auth, denied-path, service JWT, cache invalidation, and audit tests. Keycloak import changes must remain versioned so prior local runtime state can be reset and recreated deterministically.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests permission lookup, policy evaluation, token validation, audit write, and shell context budgets. |
| `security-design.md` | Enforces Keycloak, JWT, backend authorization, denied paths, audit, service identity, and bypass controls. |
| `scalability-design.md` | Validates capabilities, roles/service identities, audit records, and concurrent lookups. |
| `reliability-design.md` | Proves fail-closed token, capability, subject, service JWT, bypass, and audit behavior. |
| `logical-components.md` | Maps CI checks to Identity Security components. |
| `components.md` | Preserves Identity Service ownership. |
| `services.md` | Integrates identity-service, Keycloak, PostgreSQL, service JWTs, and Kafka identity hooks. |
| `business-logic-model.md` | Covers authentication, authorization, capability catalog, audit, and service-to-service workflows. |
