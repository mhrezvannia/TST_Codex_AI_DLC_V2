# Deployment Architecture - shared-platform-identity-security

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`shared-platform-identity-security` deploys the identity enforcement foundation: Keycloak bootstrap, Identity Service authorization APIs, capability catalog, effective permissions, service identity validation, and durable authorization audit.

## Deployment Model

| Environment | Deployment shape |
|---|---|
| Local `core` | PostgreSQL, Keycloak, Keycloak database, shared network, deterministic realm/client/user bootstrap inputs. |
| Local `app` | Identity Service container, nginx routes, service JWT/JWKS settings, Enterprise Web auth integration. |
| Local host IDE | Identity Service may run on the host while `core` remains in Docker; route ownership must be explicit. |
| CI | Unit/integration/denied-path/service-JWT/audit tests plus security scans. |
| Production path | Later Operation stages can map the same boundaries to managed identity, compute, database, and audit storage, but production approval remains manual. |

## Runtime Topology

```text
[Enterprise Web / Service Caller]
        |
        v
[nginx / Service Route]
        |
        +--> [Keycloak]
        +--> [Identity Service]
                  |
                  +--> [identity PostgreSQL]
                  +--> [JWKS / Issuer Metadata Cache]
                  +--> [Authorization Audit]
```

Text fallback: users authenticate through Keycloak. Identity Service validates subjects, evaluates roles/capabilities, writes authorization audit, and provides safe permission summaries. Protected services still enforce backend authorization.

## Compute And Runtime Controls

| Concern | Design |
|---|---|
| Token validation | Validate issuer, audience, RS256 signature, expiry, and required claims locally using TTL-bound JWKS metadata. |
| Permission lookup | Use read-optimized effective permission path keyed by subject, capability version, role assignment version, tenant/realm, and auth mode. |
| Authorization evaluation | Evaluate subject, module, action, resource context, and correlation id without cross-domain database reads. |
| Audit writes | Persist compact denied and sensitive allowed decisions through indexed append path. |
| Local bypass | Explicit local-only mode, visible health output, and fail-closed outside local profile. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements permission lookup, policy evaluation, token validation, audit write, and shell context budgets. |
| `security-design.md` | Enforces Keycloak, JWT validation, backend authorization, service identity, denied paths, audit, and local bypass constraints. |
| `scalability-design.md` | Supports protected modules, capability catalog, role/service identities, audit records, and concurrent lookups. |
| `reliability-design.md` | Fails closed for invalid tokens, missing capabilities, ambiguous subjects, service JWT failures, bypass misuse, and audit issues. |
| `logical-components.md` | Maps deployment responsibilities to KeycloakRealmBootstrapper, JwtValidationAdapter, SubjectResolver, CapabilityCatalog, EffectivePermissionService, AuthorizationPolicyEvaluator, AuthorizationAuditWriter, and ServiceIdentityValidator. |
| `components.md` | Preserves Identity Service ownership for users, subjects, roles, capabilities, and audit. |
| `services.md` | Uses `identity-service`, Keycloak, PostgreSQL, JWT/RS256, service validation, and Kafka ACL hooks. |
| `business-logic-model.md` | Implements authentication, authorization, capability catalog, audit, and service-to-service validation workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps backend authorization as the enforcement boundary and treats UI permissions as hints only.
- Keycloak, JWT/JWKS validation, capability versioning, audit durability, and local bypass controls are deployed as explicit infrastructure concerns.
- Storage and indexes align with first-release capability and audit scale without cross-service database access.
- Residual implementation risk is exact cache TTLs, indexes, Keycloak import assets, and denied-path test coverage.
