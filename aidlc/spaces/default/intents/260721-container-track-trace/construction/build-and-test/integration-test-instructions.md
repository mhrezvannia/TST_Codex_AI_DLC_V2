# Integration Test Instructions

## Static and in-process boundaries

The U01/U02/U03 `code-generation-plan.md` and `code-summary.md` require both
producer/consumer contract checks and a real broker-to-database-to-Booking
proof. Run the bounded checks first:

1. `mvn -f services/pom.xml test -DskipITs`
2. `npm run contracts:validate`
3. `npm run contracts:verify`

These verify the service reactors, Avro/AsyncAPI/Pact catalog, serializers, and
consumer mappings. The focused reactor also exercises Spring transaction
propagation and verifies that a rejection audit commits on an independent
connection before the outer business transaction rolls back. These checks do
not replace a live Kafka/PostgreSQL proof.

## Isolated live proof

Only after `npm run demo:guard` succeeds:

1. Use `node scripts/wave-a-compose.mjs up -d --no-build`.
2. Publish one real `booking.confirmed`.
3. Verify canonical planned rows in the CMM database.
4. Capture GTOT/LOAD/DISC/GTIN and verify outbox/broker sequence and fences.
5. Verify Booking immutable receipt/disposition/latest projection.
6. Replay, duplicate, and send a wrong-next movement; assert typed 409 fields
   and durable rejection evidence with no accepted-state advance.
7. Run Playwright against the CMM-owned timeline at 375, 768, 1024, and
   1440 px, including keyboard, denied, degraded, retry, light, and dark states.
8. Run `npm run demo:guard` again and preserve evidence.

Never use port 8088 or bypass the single `linercore-wave-a` controller. If
Docker cannot spawn, mark live integration BLOCKED and do not infer a pass from
unit or contract results.

## Expected evidence

Retain command output, database observations, broker identity/sequence,
Booking receipt/projection evidence, screenshots, and correlation IDs. W1
history remains separately BLOCKED/waived. Final exit also requires the
project's `aidlc-audit` and `erp-fidelity-audit` checks when their owning
acceptance harness is available.
