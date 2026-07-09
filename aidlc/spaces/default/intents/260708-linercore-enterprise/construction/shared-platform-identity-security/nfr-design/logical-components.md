# Logical Components - shared-platform-identity-security

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define where authentication, authorization, audit, capability scale, and service identity NFR patterns apply.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| KeycloakRealmBootstrapper | Imports deterministic realm, clients, roles, users, and callback URLs. | Local auth bootstrap. |
| JwtValidationAdapter | Validates issuer, audience, RS256 signature, expiry, and required claims. | Token trust. |
| SubjectResolver | Maps validated claims to `AuthenticatedSubject`; denies ambiguous subjects. | Subject identity. |
| CapabilityCatalog | Stores stable module-scoped capability identifiers and versions. | Capability governance. |
| RoleCapabilityMapper | Maps user roles and service identities to capabilities. | Least-privilege grants. |
| EffectivePermissionService | Produces safe permission summaries for UI and session use. | Permission lookup and cache invalidation. |
| AuthorizationPolicyEvaluator | Evaluates subject, module, action, resource, and capability grants. | Protected action decisions. |
| AuthorizationAuditWriter | Persists denied and sensitive allowed decisions with correlation context. | Audit durability. |
| ServiceIdentityValidator | Validates service-to-service JWT/RS256 subjects and permissions. | Service impersonation protection. |
| KafkaAclPolicyHook | Defines producer/consumer identity hooks for protected event seams. | Event identity governance. |
| LocalBypassGuard | Allows bypass only in explicit local mode and reports it visibly. | Local-only escape hatch. |

## Boundary Model

Identity Security owns:

- Authenticated subject resolution.
- Role/capability policy and effective permissions.
- Authorization decisions and denied-path behavior.
- Authorization audit.
- Keycloak local integration.
- Service-to-service JWT/RS256 validation and Kafka identity hooks.

It does not own domain records, domain authorization side effects, service databases outside `identity`, route hiding as enforcement, or cross-service SQL access.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Keycloak bootstrap failure | Auth-enabled local readiness blocked. | Preserve import logs and realm/client context. |
| JWT validation failure | Protected call rejected. | Do not attempt domain action. |
| Capability catalog mismatch | Authorization tests fail. | Versioned capability catalog and denied-path tests. |
| Permission cache stale | Potential incorrect allow/deny. | Role/capability version keys and bounded TTL. |
| Audit persistence failure | Sensitive action blocked or readiness failed. | Criticality-based audit failure policy. |
| Local bypass misuse | Startup/readiness blocked outside local mode. | Explicit local-mode guard. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Fast permission lookup | EffectivePermissionService, CapabilityCatalog, RoleCapabilityMapper. |
| Backend authorization | AuthorizationPolicyEvaluator and ServiceIdentityValidator. |
| Token validation | JwtValidationAdapter and SubjectResolver. |
| Audit durability | AuthorizationAuditWriter. |
| Capability scale | CapabilityCatalog and RoleCapabilityMapper. |
| Revocation safety | EffectivePermissionService cache versioning and TTL. |
| Local bypass safety | LocalBypassGuard. |
| Kafka identity hooks | KafkaAclPolicyHook. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support permission lookup, policy evaluation, token validation, audit write, and shell context budgets. |
| `security-requirements.md` | Components enforce Keycloak auth, JWT validation, capabilities, denied paths, audit, service identity, Kafka hooks, and local bypass constraints. |
| `scalability-requirements.md` | Components support protected modules, capabilities, roles/service identities, audit volume, and concurrent permission lookups. |
| `reliability-requirements.md` | Components fail closed for invalid tokens, missing capabilities, ambiguous subjects, invalid service JWTs, bypass misuse, and audit failure. |
| `tech-stack-decisions.md` | Components map to Keycloak, Identity Service, Java/Spring, PostgreSQL, JWT/RS256, frontend auth packages, and Kafka ACL hooks. |
| `business-logic-model.md` | Components implement authentication, authorization, capability catalog, audit, and service-to-service workflows. |
