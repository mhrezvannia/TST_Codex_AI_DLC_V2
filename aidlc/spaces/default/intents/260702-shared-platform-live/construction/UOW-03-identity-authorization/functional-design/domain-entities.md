# Domain Entities - UOW-03 Identity Authorization

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Entities

| Entity | Attributes | Lifecycle |
| --- | --- | --- |
| AuthenticatedSubject | subjectId, displayName, tokenReference | resolved -> authorized |
| Role | roleId, code, displayName | cataloged |
| Permission | permissionId, resource, action, scope | cataloged |
| RoleAssignment | assignmentId, subjectId, roleId, status, version, reason | assigned -> active -> replaced/revoked |
| AuthorizationDecision | result, reasonCode, policyVersion, correlationId, evaluatedAt | evaluated -> returned/audited |
| AuthorizationAuditRecord | auditId, eventType, subjectId, resource, action, result, reason, correlationId | appended -> persisted |

## Relationships

- Subject has many active role assignments.
- Role grants many permissions.
- Authorization decision may create an audit record.

