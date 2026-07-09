# Logical Components - UOW-03 Identity Authorization

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Components

| Component | Responsibility | Failure domain |
| --- | --- | --- |
| SubjectResolver | Resolves token reference to subject. | Keycloak/app adapter. |
| AuthorizationPolicyEvaluator | Evaluates roles/permissions. | Domain-core. |
| RoleAssignmentRepository | Loads/saves assignments. | PostgreSQL. |
| AuthorizationAuditRepository | Persists audit records. | PostgreSQL. |

## Shared Resources

- Identity PostgreSQL schema.
- Authorization catalog.

