# Reliability Requirements - U01 Walking Skeleton

## Source Context

These reliability requirements consume U01 `business-logic-model.md`, U01 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U01 must behave predictably when session, auth, Booking BFF, or booking-service dependencies fail.

## Availability and Degradation

| ID | Requirement | Verification |
| --- | --- | --- |
| REL-01 | No-session and expired-session requests redirect or fail closed without rendering protected Booking content. | Route tests and live proof. |
| REL-02 | Booking BFF missing-actor failures return a clear fail-closed state with correlation id. | Unit/integration tests. |
| REL-03 | booking-service timeout/unavailable returns recoverable shell/Booking error state with correlation id; it must not render fake empty success. | Error-path test and manual/live evidence. |
| REL-04 | U01 evidence records Docker/Compose blockers honestly when Nginx, Keycloak, shell/auth, Booking BFF, or booking-service cannot start. | Blocker record under evidence package. |

## Recovery Expectations

- Retry is acceptable for transient Booking read failure only after preserving correlation/error context.
- User reauthentication is the recovery path for missing/expired session.
- Local/test bypass cannot be recovery for protected shell paths unless explicitly profile-gated and logged.

## Durability

U01 is read-only for Booking data and introduces no new persistent business state. Durability requirements are limited to retaining AIDLC/evidence artifacts and preserving existing Booking data behavior. Do not claim zero data loss or production disaster recovery from U01 proof.

## Observability

Every U01 failure path should expose or log a correlation id. Evidence must distinguish:

- Auth redirect or session absence.
- Missing actor fail-closed.
- booking-service timeout/unavailable.
- Runtime/Compose dependency blocker.
