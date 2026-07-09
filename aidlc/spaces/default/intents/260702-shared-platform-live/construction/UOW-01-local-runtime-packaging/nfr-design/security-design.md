# Security Design - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Env checks report key presence only.
- Evidence output masks values matching secret/password/token/key patterns.
- Runtime profile explicitly marks local-only switches.
- No cloud credential checks are added for this local intent.

## Controls

- Secret masking unit tests.
- No env dump command in scripts.
- `AUTH_BYPASS` displayed as local-only risk when enabled.

