# Business Rules - UOW-03 Identity Authorization

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Rules

1. Unknown subject denies authorization.
2. Only active role assignments grant permissions.
3. Role assignment changes require authorization for `identity-roles:assign`.
4. Stale role assignment version denies the change.
5. Authorization denial must include reason code, policy version, evaluated time, and correlation id.
6. Authorization audit is appended for denials and role assignment changes.

## Validation

- `reference-data:write` allows create/update/deactivate.
- Lack of write permission denies mutation.
- Effective permissions are deterministic for seeded local users.

