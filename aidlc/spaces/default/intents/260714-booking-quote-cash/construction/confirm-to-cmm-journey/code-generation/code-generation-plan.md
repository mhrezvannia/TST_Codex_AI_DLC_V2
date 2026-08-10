# Code Generation Plan - confirm-to-cmm-journey

Unit: `confirm-to-cmm-journey`
Stage: `code-generation`
Test strategy: Comprehensive

## Steps

- [x] Step 1: Replace the `booking.confirmed` Avro contract with the W1 canonical envelope and nested `data.routing[]` / `data.equipment[]` shape. Traceability: W1 confirm-to-CMM contract, no customer or pricing fields.
- [x] Step 2: Generate Booking outbox payloads from the confirmed Booking aggregate using deterministic UUIDv5 event ids and exact contract field names. Traceability: Booking confirmation publishes one canonical logical event.
- [x] Step 3: Update the Booking Kafka publisher serde path to materialize nested Avro records from the outbox payload. Traceability: event relay publishes contract-compatible `GenericRecord`.
- [x] Step 4: Remove Booking to CMM synchronous HTTP confirmation from the Booking API command path. Traceability: CMM starts from Kafka only.
- [x] Step 5: Add transactional Booking confirm/reconfirm idempotency receipts keyed by `Idempotency-Key`, with replay, in-progress, and conflict handling. Traceability: confirm command receipt and exactly-once logical outbox.
- [x] Step 6: Add the Booking BFF confirm route and UI action, forwarding idempotency and showing pending event state after confirmation. Traceability: user journey can drive confirm from the app.
- [x] Step 7: Add CMM canonical `booking.confirmed` mapping and Kafka listener over shared messaging infrastructure. Traceability: CMM consumes Kafka and calls one transactional application method.
- [x] Step 8: Update CMM application validation/dedupe for canonical envelope id, source, revision, routing, quantity, and ISO 6346 equipment. Traceability: duplicate and stale events are handled at the application boundary.
- [x] Step 9: Add/update Java tests for Booking event mapping, Avro serde, CMM record mapping, CMM consume behavior, and confirm idempotency. Traceability: service and message boundary coverage.
- [x] Step 10: Add/update frontend tests for pricing and confirm actions. Traceability: UI command coverage.
- [x] Step 11: Run Maven, frontend, Compose, diff, and audit detector gates. Traceability: exit gate evidence.

## Evidence

| Gate | Result |
| --- | --- |
| `mvn -o -q -pl booking-service/application-service,booking-service/container -am test` | Passed |
| `mvn -o -q test` from `services/` | Passed |
| `yarn workspace @erp/app-booking test` | Passed, 4 files / 12 tests |
| `yarn workspace @erp/app-booking typecheck` | Passed |
| `yarn workspace @erp/app-booking lint` | Passed |
| `yarn workspace @erp/app-booking build` | Passed |
| `docker compose config --quiet` | Passed |
| `git diff --check` | Passed with line-ending warnings only |
| `.claude/skills/aidlc-audit/detectors.sh` | Passed, leads printed for manual review |
| `.claude/skills/erp-fidelity-audit/detectors.sh` | Passed, leads printed for manual review |
