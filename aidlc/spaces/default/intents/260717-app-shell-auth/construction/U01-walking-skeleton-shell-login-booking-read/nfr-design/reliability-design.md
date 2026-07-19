# Reliability Design - U01 Walking Skeleton

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U01 reliability means predictable redirect, fail-closed, timeout, error, and blocker behavior.

## Resilience Patterns

| Condition | Design | Requirement coverage |
| --- | --- | --- |
| No session | Redirect to existing auth/Keycloak before rendering protected content. | REL-01 |
| Expired/invalid session | Treat as unauthenticated or fail closed; do not render stale Booking data. | REL-01 |
| Missing actor | BFF returns fail-closed error with correlation id before booking-service call. | REL-02 |
| booking-service timeout/unavailable | Existing bounded timeout returns recoverable shell/Booking error with correlation id. | REL-03 |
| Runtime startup blocker | Record W2-01 blocker with dependency and observed failure; do not claim PASS from tests. | REL-04 |

## Retry and Fallback Policy

- No retry as `local-user`.
- No fake empty Booking list on backend failure.
- User reauthentication is the recovery path for missing/expired session.
- Manual retry is acceptable for transient Booking read failure after preserving correlation id and error state.

## Health and Evidence Design

U01 evidence distinguishes:

- Auth redirect/session absence.
- Authenticated shell render.
- Missing actor fail-closed branch.
- Booking read success.
- Booking timeout/unavailable.
- Compose/Nginx/Keycloak runtime blocker.

## Durability Boundary

U01 is read-only for Booking business data. Reliability design does not claim business-data backup, replication, zero data loss, or disaster recovery. Durable requirements are limited to evidence artifacts and preserving existing Booking data behavior.

## Operational Notes

Keep W1's live-proof waiver explicit as BLOCKED at `compose-start`; a W2-01 U01 runtime blocker must be recorded separately and honestly. U01 reliability work must also preserve W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries rather than modifying prior merged work to make the walking skeleton easier.
