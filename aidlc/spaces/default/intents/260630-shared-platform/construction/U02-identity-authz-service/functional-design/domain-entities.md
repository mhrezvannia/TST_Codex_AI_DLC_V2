# Domain Entities - U02 Identity Authorization Service

## Source Trace

These U02 domain entities derive from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## AuthenticatedSubject

Purpose: Session-safe representation of a Keycloak-authenticated internal carrier user.

Attributes:

| Attribute | Description |
|---|---|
| `subjectId` | Stable internal subject identifier derived from approved token claims. |
| `username` | Human-readable login or username where safe. |
| `displayName` | Display name for support/session views. |
| `email` | Internal email, classified according to data sensitivity. |
| `issuer` | Expected Keycloak issuer. |
| `tenantOrCarrierCode` | Optional internal carrier scope where configured. |
| `claimVersion` | Version/hash of claims used for traceability. |

Rules:

- Contains no raw token material.
- Created by adapter translation, not by the domain core parsing JWTs.

## Role

Purpose: Named platform responsibility grouping used to derive permissions.

Attributes:

| Attribute | Description |
|---|---|
| `roleId` | Stable role identifier. |
| `code` | One of the MVP role codes. |
| `name` | Display label. |
| `description` | Role purpose. |
| `assignable` | Whether security administrators may assign the role. |
| `status` | Active or retired. |

MVP role codes:

- `pricing`
- `sales`
- `booking-desk`
- `equipment-control`
- `customer-service`
- `finance-read`
- `reference-admin`
- `platform-operator`
- `security-admin`

## Permission

Purpose: Atomic authorization capability.

Attributes:

| Attribute | Description |
|---|---|
| `permissionId` | Stable permission identifier. |
| `resource` | Protected resource such as `reference-data`, `identity-roles`, or `identity-audit`. |
| `action` | Operation such as `read`, `create`, `update`, `deactivate`, `reactivate`, `assign`, `revoke`. |
| `scope` | Optional narrowing value such as service, reference set, or platform area. |
| `classification` | Sensitivity label for access/audit handling. |

## RolePermission

Purpose: Catalog relationship linking a role to one or more permissions.

Attributes:

| Attribute | Description |
|---|---|
| `roleId` | Role identifier. |
| `permissionId` | Permission identifier. |
| `effectiveFrom` | Start timestamp. |
| `effectiveTo` | Optional end timestamp. |
| `policyVersion` | Version of the catalog mapping. |

## RoleAssignment

Purpose: Assignment of a platform role to an authenticated subject.

Attributes:

| Attribute | Description |
|---|---|
| `assignmentId` | Stable assignment identifier. |
| `subjectId` | Target user. |
| `roleId` | Assigned role. |
| `status` | Active, revoked, or expired. |
| `assignedBy` | Actor subject id. |
| `assignedAt` | Assignment timestamp. |
| `revokedBy` | Actor subject id for revocation. |
| `revokedAt` | Revocation timestamp. |
| `reason` | Optional business/support reason. |
| `version` | Optimistic concurrency version. |

Lifecycle:

```text
requested -> active -> revoked
requested -> rejected
active -> expired
```

## AuthorizationRequest

Purpose: Command object representing one authorization decision.

Attributes:

| Attribute | Description |
|---|---|
| `requestId` | Request identifier for idempotent tracing. |
| `correlationId` | Platform correlation id. |
| `subjectTokenReference` | Token/reference passed to adapter layer. |
| `resource` | Requested protected resource. |
| `action` | Requested operation. |
| `scope` | Optional resource scope. |
| `context` | Safe caller context such as service/app name and request path. |

## AuthorizationDecision

Purpose: Result of evaluating an authorization request.

Attributes:

| Attribute | Description |
|---|---|
| `decisionId` | Stable decision identifier. |
| `subjectId` | Evaluated subject if resolvable. |
| `result` | `ALLOW` or `DENY`. |
| `reasonCode` | Machine-readable reason. |
| `resource` | Evaluated resource. |
| `action` | Evaluated action. |
| `scope` | Evaluated scope. |
| `evaluatedAt` | Decision timestamp. |
| `policyVersion` | Permission catalog version. |
| `correlationId` | Platform correlation id. |

## EffectivePermissionsView

Purpose: Session-safe projection for BFFs and support troubleshooting.

Attributes:

| Attribute | Description |
|---|---|
| `subject` | Safe subject summary. |
| `roles` | Active role summaries. |
| `permissions` | Active permission summaries safe for the caller. |
| `policyVersion` | Catalog version. |
| `generatedAt` | Projection timestamp. |

## AuthorizationAuditRecord

Purpose: Append-only evidence of role changes and sensitive/protected authorization outcomes.

Attributes:

| Attribute | Description |
|---|---|
| `auditId` | Stable audit identifier. |
| `eventType` | Role assigned, role revoked, decision denied, sensitive decision evaluated. |
| `actorSubjectId` | Actor where known. |
| `targetSubjectId` | Target user where relevant. |
| `resource` | Protected resource where relevant. |
| `action` | Operation. |
| `beforeValue` | Previous value snapshot or hash. |
| `afterValue` | New value snapshot or hash. |
| `reason` | Optional supplied reason. |
| `result` | Success, deny, conflict, validation failure, dependency unavailable. |
| `occurredAt` | Event timestamp. |
| `correlationId` | Platform correlation id. |

## Entity Interaction Pattern

```text
AuthenticatedSubject
  has RoleAssignment[]
RoleAssignment
  references Role
Role
  grants RolePermission[]
RolePermission
  references Permission
AuthorizationRequest
  evaluates AuthenticatedSubject + Permission catalog
  produces AuthorizationDecision
RoleAssignment changes and protected decisions
  append AuthorizationAuditRecord
```

## Persistence Ownership

`identity-service` stores role catalog, permission catalog, assignments, and audit records in its owned PostgreSQL schema. Keycloak remains the authentication provider and token issuer, not the source of platform authorization truth.

## Excluded Entities

No U02 entity represents shipper/BCO identity, customer self-service identity, Charge runtime policy state, Booking runtime policy state, or Container Movement runtime policy state.
