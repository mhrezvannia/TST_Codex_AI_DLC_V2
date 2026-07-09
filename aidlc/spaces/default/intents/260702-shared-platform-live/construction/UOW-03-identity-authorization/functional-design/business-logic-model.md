# Business Logic Model - UOW-03 Identity Authorization

## Context

This Functional Design consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Authorization Workflow

1. Caller sends token reference, resource, action, scope, caller, and correlation id.
2. Subject resolver maps token reference to authenticated subject.
3. Role assignment repository loads active assignments.
4. Authorization catalog maps roles to permissions.
5. Policy evaluator returns allow or deny with reason and policy version.
6. Denials and role-assignment changes append audit records.

## Effective Permissions Workflow

1. Resolve subject.
2. Load active assignments.
3. Expand role grants into distinct permissions.
4. Return subject, roles, permissions, policy version, evaluated timestamp.

