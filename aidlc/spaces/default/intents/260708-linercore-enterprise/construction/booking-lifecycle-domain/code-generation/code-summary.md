# Code Generation Summary - booking-lifecycle-domain

## Files Created Or Modified

| File | Change |
|---|---|
| `services/pom.xml` | Added `booking-service` to the root services reactor. |
| `services/booking-service/pom.xml` | Added Booking Service Maven parent with `domain-core` and `application-service` modules. |
| `services/booking-service/domain-core/pom.xml` | Added booking domain-core module. |
| `services/booking-service/application-service/pom.xml` | Added booking application-service module. |
| `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/*` | Added Booking aggregate, booking id/status, pricing snapshot, lifecycle events, exception queue entries, and D&D trigger candidates. |
| `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/outbox/*` | Added booking confirmed outbox event and mapper with schema subject, producer identity, deduplication key, correlation id, pricing ref, and contract payload fields. |
| `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/*` | Added application service commands, ports, and use cases for create draft, validate, request pricing, store pricing snapshot, confirm, and record D&D trigger candidates. |
| `services/booking-service/**/src/test/java/**` | Added domain and application-service tests for transitions, idempotency, authorization denial, validation failure, pricing snapshot storage, confirmation outbox, and D&D trigger candidate evidence. |
| `scripts/validate-contract-catalog.mjs` | Narrowed the old shared-platform guardrail so Booking Service is allowed while still blocking out-of-scope downstream runtimes. |
| `scripts/validate-contract-catalog.test.mjs` | Updated the guardrail test to use `services/container-movement-service`, which remains outside this unit. |

## Key Implementation Decisions

- Created only `domain-core` and `application-service` modules for the Booking Service foundation. Container/API wiring is intentionally left for later runtime/API expansion.
- Stored pricing snapshots as externally supplied results through a `PricingPort`; no pricing or D&D calculations were implemented.
- Represented D&D trigger candidates as booking-owned orchestration evidence only.
- Used fakeable ports for authorization, reference validation, pricing, idempotency, audit, repository, and outbox.
- Preserved contract alignment with the existing `booking.confirmed` Avro/AsyncAPI fields through the booking outbox mapper.

## Test Coverage Summary

| Command | Result |
|---|---|
| `.local-tools/apache-maven/bin/mvn.cmd -f services/booking-service/pom.xml test` with `.local-tools/jdk-21` as `JAVA_HOME` | Passed: booking reactor success, 10 tests. |
| `.local-tools/apache-maven/bin/mvn.cmd -f services/pom.xml test` with `.local-tools/jdk-21` as `JAVA_HOME` | Passed: root services reactor success including booking-service. |
| `node scripts/validate-contract-catalog.mjs` | Passed: catalog status `ok`, 13 contracts, green health snapshot. |
| `node --test scripts/validate-contract-catalog.test.mjs` | Passed: 12 tests. |
| `yarn exec eslint scripts/validate-contract-catalog.mjs scripts/validate-contract-catalog.test.mjs` | Passed. |

## Deviations From Plan

- Container/API routes and local runtime profile entries were not added in this unit. The implemented service foundation is executable through Maven tests, and container wiring can be added once API shape and persistence adapters are expanded.
- No UI code was changed; the unit established backend application-service seams for later UI workflows.
- No live downstream services were used. Reference validation and pricing use ports with fakes in tests.

## Traceability

| Story or requirement | Implemented evidence |
|---|---|
| US-BKG-001 - Create and validate booking | Draft creation, idempotency, reference validation success/failure, and exception state tests. |
| US-BKG-003 - Request and store pricing snapshot | Pricing request port and pricing snapshot storage without calculation. |
| US-BKG-004 - Confirm booking | Confirm transition and booking confirmed outbox event tests. |
| US-BKG-006 - Amend/reconfirm booking | Domain transition tests for amend/reconfirm and revisioning. |
| US-BKG-007 - Exception queues and D&D trigger candidates | Exception state and D&D trigger candidate evidence tests. |
| US-UI-002 - UI workflow support | Application-service ports and command behavior provide backend seams for later UI work. |
