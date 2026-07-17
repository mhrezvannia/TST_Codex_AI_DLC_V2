# Code Summary - confirm-to-cmm-journey

## Files Created Or Modified

| Area | Files |
| --- | --- |
| Contracts | `contracts/avro/booking.confirmed.avsc`, Booking and CMM service Avro schema resources |
| Booking domain/messaging | `BookingEventMapper`, `KafkaBookingEventPublisher`, serde and mapper tests |
| Booking application/API | `BookingApplicationService`, `BookingApiController`, idempotency receipt tests, controller header tests |
| Booking UI/BFF | `/api/bookings/[bookingId]/confirm`, `BookingValidationPanel`, booking detail pending-event rendering, component tests |
| CMM application/messaging | `BookingConfirmedEvent`, `ContainerMovementApplicationService`, `BookingConfirmedRecordMapper`, `KafkaBookingConfirmedListener`, messaging configuration, tests |

## Key Implementation Decisions

- Booking confirmation now commits Booking state, idempotency receipt, audit, and one canonical outbox row in a single `@Transactional` method.
- Confirm/reconfirm require `Idempotency-Key` at the REST boundary. Replays return the persisted Booking without enqueueing a second outbox row; reused keys for a different lifecycle command/body conflict.
- Booking no longer calls CMM synchronously during confirm/reconfirm. The UI drives Booking only, and CMM receives `booking.confirmed` via Kafka listener.
- The `booking.confirmed` payload uses the exact Avro field names: `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, and nested `data.bookingId`, `data.bookingRevision`, `data.routing[]`, `data.equipment[]`.
- CMM validates the canonical envelope and event data before transactionally deduping and creating or reconciling a journey.

## Test Coverage Summary

| Check | Evidence |
| --- | --- |
| Focused Java | `mvn -o -q -pl booking-service/application-service,booking-service/container -am test` passed |
| Full services Java | `mvn -o -q test` from `services/` passed |
| Booking frontend | `yarn workspace @erp/app-booking test`, `typecheck`, `lint`, and `build` passed |
| Static runtime descriptor | `docker compose config --quiet` passed |
| Whitespace | `git diff --check` passed with line-ending warnings only |
| AI-DLC audit | `.claude/skills/aidlc-audit/detectors.sh` exited 0 |
| ERP fidelity audit | `.claude/skills/erp-fidelity-audit/detectors.sh` exited 0 |

## Deviations

- The reviewer subagent could not be invoked in this Codex surface, so the architecture review was performed inline and recorded below.
- Live Docker end-to-end proof was not run in this code-generation unit. The code-generation exit gate here is host tests plus static Compose and detectors; live runtime proof remains for the later build/test or runtime gate.

## Residual Risks

- CMM still stores the journey in the existing aggregate shape rather than a full nested route/equipment event ledger, although the Kafka boundary preserves and validates the canonical nested contract.
- CMM DLT/error-handler replay behavior is not fully hardened beyond listener-level exception surfacing and application validation.

## Review

Verdict: READY

The implementation now matches the W1 design direction for the critical path: Booking confirm is transactional and idempotent, emits a canonical outbox event without synchronous CMM HTTP, and CMM consumes the canonical Kafka record through a thin adapter into a transactional application method. Contract field names are aligned with the `.avsc`, and the passed checks cover the Java service path, Avro serde, UI command path, Compose descriptor, and audit detectors.
