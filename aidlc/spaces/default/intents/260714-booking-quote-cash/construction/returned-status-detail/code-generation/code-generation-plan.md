# Code Generation Plan - returned-status-detail

Unit: returned-status-detail
Stage: code-generation
Test strategy: Comprehensive

## Traceability

| Plan step | Story / requirement trace |
|---|---|
| Step 1 | Booking detail must show returned movement status from local Booking state, not a direct CMM read. |
| Step 2 | CMM must publish canonical `containermovement.status` records with exact contract field names. |
| Step 3 | Booking must consume the canonical Kafka record through shared messaging infrastructure. |
| Step 4 | Booking must dedupe movement-status events and apply only the newest fact by the designed ordering tuple. |
| Step 5 | The old synchronous CMM-to-Booking callback must not remain in the normal path. |
| Step 6 | Confirmed Booking UI must show `PENDING_EVENT` and then local projection status without browser-to-CMM calls. |
| Step 7 | Contract, Java, frontend, Compose, and audit gates must stay green. |

## Steps

- [x] Step 1: Replace the `containermovement.status` Avro schema in shared contracts plus service resources with the canonical envelope and nested `data` object.
- [x] Step 2: Update CMM status outbox mapping so payload keys and serializer records match the exact contract fields, and so Kafka keys use `bookingRef:containerRef`.
- [x] Step 3: Remove normal-path synchronous CMM-to-Booking movement-status HTTP callback wiring and obsolete Booking-to-CMM HTTP client wiring.
- [x] Step 4: Add Booking movement-status application ports for consumed-event receipt, movement location, projection row, guarded upsert result, and projection repository.
- [x] Step 5: Implement Booking JDBC receipt/projection repository with duplicate receipt insertion, guarded ordering-tuple upsert, and read-by-booking.
- [x] Step 6: Add Booking schema migration and baseline schema entries for `booking_consumed_events` and `booking_movement_status`.
- [x] Step 7: Update `BookingApplicationService.consumeMovementStatus` so one transaction validates the event/source/container, inserts the receipt, upserts projection, records stale/duplicate outcomes, and does not mutate the Booking aggregate.
- [x] Step 8: Add Booking Kafka listener and GenericRecord mapper over the canonical nested Avro record, including key and source/type/version validation.
- [x] Step 9: Wire Booking Kafka consumer configuration under the Kafka profile while preserving the local-noop guard posture from W0.
- [x] Step 10: Expose local movement projections on Booking detail API responses.
- [x] Step 11: Add Booking detail journey panel polling: confirmed/reconfirmed bookings show `PENDING_EVENT`, poll local Booking detail for up to 30 seconds, and expose retry after the bounded window.
- [x] Step 12: Update contract examples, Pact fixtures, AsyncAPI, local config, and Compose topic/environment values.
- [x] Step 13: Add/adjust Java tests for mapper serde, application projection idempotency/order, and service wiring behavior.
- [x] Step 14: Add frontend component tests for initial projection rendering, bounded polling success, and retry after timeout.
- [x] Step 15: Run the full exit gate: Maven services tests, Booking app tests/typecheck/lint/build, Compose config, whitespace check, `aidlc-audit`, and `erp-fidelity-audit`.

## Evidence

- `mvn -o -q -pl booking-service/application-service,booking-service/dataaccess,booking-service/messaging,booking-service/container,container-movement-service/domain-core,container-movement-service/messaging,container-movement-service/container,container-movement-service/application-service -am test` - pass
- `mvn -o -q test` from `services/` - pass
- `yarn workspace @erp/app-booking test` - pass, 5 files / 15 tests
- `yarn workspace @erp/app-booking typecheck` - pass
- `yarn workspace @erp/app-booking lint` - pass
- `yarn workspace @erp/app-booking build` - pass
- `docker compose config --quiet` - pass
- `git diff --check` - pass with line-ending warnings only
- `.claude/skills/aidlc-audit/detectors.sh` - exit 0, LEADS output requires manual review
- `.claude/skills/erp-fidelity-audit/detectors.sh` - exit 0, LEADS output requires manual review
