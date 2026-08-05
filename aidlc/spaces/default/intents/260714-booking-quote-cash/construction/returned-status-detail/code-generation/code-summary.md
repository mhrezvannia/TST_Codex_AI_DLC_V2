# Code Summary - returned-status-detail

## Produced

| Area | Files / changes |
|---|---|
| Contracts | `contracts/avro/containermovement.status.avsc`, service Avro resources, examples, Pact fixtures, AsyncAPI topic docs |
| CMM publisher | `MovementStatusEventMapper`, `KafkaContainerMovementEventPublisher`, CMM messaging/local config |
| Booking consumer | `ContainerMovementStatusRecordMapper`, `KafkaContainerMovementStatusListener`, Booking Kafka consumer configuration |
| Booking projection | `MovementStatusProjectionRepository` port, projection/receipt value types, `JdbcMovementStatusProjectionRepository`, schema migration and baseline SQL |
| Booking API/UI | Booking detail now returns local `movementStatuses`; `JourneyStatusPanel` polls local Booking detail and renders pending/projection states |
| Sync HTTP removal | Removed CMM-to-Booking movement-status callback and obsolete Booking-to-CMM movement client wiring |
| Tests | Java mapper/application/serde coverage plus Booking frontend journey panel tests |

## Key Decisions

- Booking treats `containermovement.status` as canonical Kafka input. The controller-level `/api/bookings/movement-status` ingress was removed so the normal status path is listener to application transaction to local projection.
- The Booking aggregate is not mutated by returned movement status. Status evidence lands in `booking_consumed_events` and `booking_movement_status`, then the detail API joins the local projection into the response.
- Projection freshness follows the designed tuple: `occurredDateTime`, classifier rank `PLN < EST < ACT`, `receivedDateTime`, then `eventId`.
- The browser never calls CMM. It polls `/api/bookings/{bookingId}` for the local Booking projection, then stops after a bounded 30-second window and offers retry.

## Test Coverage

- Services Maven suite: `mvn -o -q test` passed from `services/`.
- Focused cross-service Java suite passed for Booking application/dataaccess/messaging/container and CMM application/domain/messaging/container modules.
- Booking frontend suite passed: 5 test files, 15 tests.
- Booking frontend typecheck, lint, and production build passed.
- Static Compose validation passed.
- `git diff --check` passed with line-ending warnings only.
- `aidlc-audit` and `erp-fidelity-audit` detector scripts exited 0; both print LEADS for manual review.

## Deviations

- Reviewer subagent invocation is unavailable in this Codex surface, so the review was performed inline and recorded below.
- Live Docker end-to-end proof was not run in this code-generation unit. This unit verified host tests, frontend build, static Compose, and detectors; live runtime proof remains for the later build/test/runtime gate.

## Review

Verdict: READY

Findings:
- No blocking issues found in the returned-status implementation.
- Residual risk: Kafka listener retry/DLT policy still relies on the current Spring Kafka container defaults; a later reliability pass should make retry headers and dead-letter routing explicit if the platform requires deterministic replay handling.
- Residual risk: D&D charge calculation still uses existing Booking-side movement attributes in later pricing paths; projection-driven D&D integration belongs to the following D&D/replay unit rather than this returned-status UI/projection unit.

Evidence:
- `mvn -o -q test` from `services/` passed.
- `yarn workspace @erp/app-booking test`, `typecheck`, `lint`, and `build` passed.
- `docker compose config --quiet` passed.
- `git diff --check` passed with line-ending warnings only.
- `.claude/skills/aidlc-audit/detectors.sh` and `.claude/skills/erp-fidelity-audit/detectors.sh` exited 0.
