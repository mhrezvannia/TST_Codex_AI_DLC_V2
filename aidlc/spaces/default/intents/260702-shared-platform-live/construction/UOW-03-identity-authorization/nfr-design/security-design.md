# Security Design - UOW-03 Identity Authorization

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Resolve subject before permissions.
- Deny unknown subjects.
- Require active assignments.
- Append audit for denials and role changes.
- Include policy version and correlation id in every decision.

## Controls

- Unit tests for unknown subject deny.
- Tests for stale role assignment denial.
- Audit repository tests for denial and role assignment events.

