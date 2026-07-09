# Monitoring Design - UOW-02 Auth Session and Keycloak

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Signals

- `/api/auth/session` success/unauthenticated/error states.
- Keycloak reachability.
- Callback failure count by reason.
- Local bypass active count in local evidence.

## Logs

Log correlation id and auth mode, never tokens.

