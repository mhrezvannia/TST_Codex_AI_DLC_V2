# Reliability Design - U02 Booking Create Allow

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U02 reliability means create either commits under an authorized real subject and retrieves detail, or fails closed without mutation.

## Resilience Patterns

| Condition | Design | Requirement coverage |
| --- | --- | --- |
| No or invalid session | Redirect or fail closed before `/booking/new` render/submit; no stale create authority. | SEC-05, REL-01 |
| Missing actor | BFF rejects before booking-service create and preserves correlation id. | SEC-05, REL-01 |
| identity-service deny/error/timeout | booking-service prevents mutation and returns controlled denied/error state. | SEC-02, SEC-03, REL-01 |
| Duplicate submit | Preserve existing idempotency semantics in BFF/backend. | SEC-07, REL-03 |
| Create success but detail missing | Treat U02 acceptance as failed; do not fake detail from form state. | REL-02, REL-05 |
| Runtime startup blocker | Record W2-01 blocker with dependency and observed failure; do not claim PASS from tests. | REL-05 |

## Retry and Fallback Policy

- No retry as `local-user` or another subject.
- No fake success page or synthetic detail when backend detail retrieval fails.
- User-correctable validation errors remain in the create form using existing W1 behavior.
- Manual retry is acceptable for transient service failure after preserving correlation id and denied/error state.

## Health and Evidence Design

U02 evidence distinguishes:

- Protected `/booking/new` route and authenticated submit.
- Actor subject and correlation id propagated to BFF/backend.
- identity-service allow decision before mutation.
- Created Booking id/reference.
- `/booking/[id]` detail retrieval success.
- Authorization deny/error/timeout, validation failure, missing actor, and runtime blockers.

## Durability Boundary

U02 uses existing booking-service persistence. Reliability design does not claim backup, replication, zero data loss, or disaster recovery beyond existing local persistence behavior; the required durability proof is that the created Booking remains retrievable at `/booking/[id]` during the live scenario.

## Operational Notes

Keep W1's live-proof waiver explicit as BLOCKED at `compose-start`; U02 must not convert W1 waiver evidence into a real PASS. U02 reliability work must also preserve W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries rather than modifying prior merged work to make the allow path easier.

