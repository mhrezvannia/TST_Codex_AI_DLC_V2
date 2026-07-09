# Domain Entities - shared-platform-identity-security

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The unit hardens existing Identity domain concepts surfaced by Graphify, including roles, role assignments, permissions, authorization requests, policy evaluation, authenticated subjects, reason codes, and authorization audit records.

## Entity Overview

| Entity | Purpose |
|---|---|
| `AuthenticatedSubject` | Represents a user or service subject resolved from Keycloak/JWT/local dev mode. |
| `Role` | Named enterprise role. |
| `Capability` | Module/action permission capability. |
| `RoleAssignment` | Assignment of role to subject with scope and validity. |
| `AuthorizationRequest` | Requested subject/action/resource decision input. |
| `AuthorizationDecision` | Allow/deny result with reason code. |
| `AuthorizationAuditRecord` | Durable audit evidence for authorization decisions. |
| `ServiceClient` | Registered service identity used for service-to-service calls. |
| `KeycloakRealmMapping` | Local realm/client/role bootstrap metadata. |

## Entity Details

### AuthenticatedSubject

Attributes:

- `subjectId`
- `subjectType`: `user` or `service`
- `displayName`
- `tenantOrOrg`
- `issuer`
- `claims`
- `localDevMode`

### Role and Capability

`Role` attributes:

- `roleCode`
- `description`
- `moduleScope`
- `active`

`Capability` attributes:

- `capabilityCode`
- `module`
- `action`
- `resourceType`
- `description`

### AuthorizationRequest and Decision

`AuthorizationRequest` attributes:

- `subject`
- `module`
- `action`
- `resourceContext`
- `correlationId`

`AuthorizationDecision` attributes:

- `decision`: `allow` or `deny`
- `reasonCode`
- `effectiveCapabilities`
- `evaluatedAt`

### AuthorizationAuditRecord

Attributes:

- `auditId`
- `subjectId`
- `action`
- `resourceContext`
- `decision`
- `reasonCode`
- `correlationId`
- `timestamp`

## Relationships

```text
AuthenticatedSubject --> RoleAssignment --> Role --> Capability
          |                                      |
          v                                      v
AuthorizationRequest ------------------> AuthorizationDecision
          |                                      |
          v                                      v
                       AuthorizationAuditRecord
```

Text fallback: subjects receive roles through assignments; roles grant capabilities; authorization requests evaluate those capabilities and produce decisions with audit records.

## Traceability

| Source | Entity coverage |
|---|---|
| `unit-of-work.md` | U03 responsibilities drive subject, role, capability, service-client, and audit entities. |
| `unit-of-work-story-map.md` | US-SP-001 and US-SP-002 map to subject and capability entities; US-SP-005 maps to correlation/audit fields. |
| `requirements.md` | FR-SP-002, FR-SP-003, and NFR-SEC requirements constrain entities. |
| `components.md` | Identity Service owns users, subjects, roles, capabilities, and audit. |
| `component-methods.md` | Method expectations shape authorization request/decision entities. |
| `services.md` | `identity` storage and Keycloak integration guide persistence and integration. |

