# Shared Infrastructure - shared-platform-identity-security

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because identity/security is shared by every backend service, Enterprise Web route, local runtime auth profile, and event identity hook.

## Shared Resource Inventory

| Shared resource | Shared by | Boundary |
|---|---|---|
| Keycloak realm/clients | Enterprise Web, Identity Service, backend services. | Identity owns auth integration; domain services own their protected actions. |
| Capability catalog | All modules and services. | Identity owns catalog; modules declare protected capabilities. |
| Effective permission summary | Enterprise Web and session consumers. | UI hints only; backend remains enforcement boundary. |
| Authorization audit | Security, operations, domain services, incident review. | Identity owns records; consumers query through approved APIs. |
| Service identity settings | Backend service-to-service calls and Kafka identity hooks. | Each service owns required capabilities for its endpoints/events. |
| Local bypass guard | Local runtime, Identity Service, Enterprise Web development flow. | Local-only and visible; never production-grade auth. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Backend authorization | Every protected backend action checks authorization independently of UI route visibility. |
| Database access | Identity owns `identity`; no service reads another service database for authorization shortcuts. |
| Audit data | Queryable through approved APIs; full tokens/secrets are never stored. |
| Capability changes | Versioned and invalidate affected permission summaries. |
| Kafka identity | Producer/consumer identity hooks are explicit even if local broker enforcement is relaxed. |

## Shared Flow

```text
[User or Service Subject]
        |
        v
[JWT / Subject Resolver]
        |
        v
[Capability + Role Evaluation]
        |
        v
[Allow or Deny + Audit]
```

Text fallback: a user or service subject is validated, mapped to roles/capabilities, evaluated against the requested action/resource, and audited before the caller proceeds.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares permission lookup and audit paths without making every UI route call expensive policy internals. |
| `security-design.md` | Enforces backend authorization, least privilege, service JWT validation, local bypass controls, and audit. |
| `scalability-design.md` | Scales shared capability, role/service identity, audit, and permission summary surfaces. |
| `reliability-design.md` | Preserves fail-closed behavior and cache invalidation across shared consumers. |
| `logical-components.md` | Maps shared resources to capability, permission, policy, audit, service identity, and bypass components. |
| `components.md` | Keeps Identity Service as owner and Enterprise Web as permission-summary consumer. |
| `services.md` | Supports identity-service, protected backend services, Enterprise Web, and Kafka identity hooks. |
| `business-logic-model.md` | Implements shared authentication, authorization, capability, audit, and service-validation workflows. |
