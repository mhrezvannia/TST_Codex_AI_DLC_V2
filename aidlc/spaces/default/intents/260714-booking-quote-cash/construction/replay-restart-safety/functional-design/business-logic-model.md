# Business Logic Model - U06 Replay and Restart Safety

## Scope and Inputs

U06 implements the resilience slice in `unit-of-work.md` and US-W1-006 from `unit-of-work-story-map.md`. It proves FR-W1-012 and NFR-W1-003 through NFR-W1-005 from `requirements.md` across C02-C09/C12 in `components.md`. It exercises the atomic claim, confirmation, receipt, projection, relay, and replay methods in `component-methods.md` under the at-least-once and service-isolation model in `services.md`.

## Protected Business Effects

Every scenario finishes by asserting one coherent logical state:

- one terminal Charge pricing request/result for `(bookingRef, amendmentSeq)`;
- one Booking confirmation revision and one logical `booking.confirmed` outbox event;
- one CMM journey for `(bookingId, containerRef)` at the highest valid revision;
- one logical planned CMM status outbox event per applied revision/fact;
- one Booking movement projection per `(bookingRef, containerRef)`, retaining the newest ordering tuple;
- durable receipts for every successfully processed distinct envelope ID;
- stable Booking detail after refresh and process restart.

Counts are business-key assertions, not assumptions based on Kafka delivery count.

## Pricing Crash and Replay Scenarios

### Duplicate/concurrent request

Send two identical requests with the same key/hash. One claims `IN_PROGRESS`; the other returns in-progress or terminal replay. After completion, both observe byte-equivalent business data and one stored result. A changed hash with the same key conflicts and does not mutate the winner.

### Crash after claim

Stop/fail the owning execution after the committed claim but before completion. Before ten seconds, replay returns `PRICING_IN_PROGRESS`. After lease expiry, exactly one contender CAS-takes ownership and completes. A late original owner fails fenced completion and rereads the winner. Manual-case and result counts remain one.

### Crash after Charge completion before Booking apply

Retry from Booking with the same body/key. Charge replays the terminal result; Booking applies by expected amendment/fingerprint and persists one snapshot/work outcome.

Booking never commits aggregate `PRICING_PENDING` before the HTTP call. A crash before or during the call leaves durable `VALIDATED`/manual state, and a 409 live claim returns lease-bounded retry guidance. Retry after Charge completion/lease recovery applies the terminal result, so restart cannot strand a Booking in pending state.

## Booking Confirmation and Outbox Scenarios

1. Run duplicate/concurrent Confirm with the same idempotency key. Row locking, receipt replay, UUIDv5 identity, and outbox uniqueness leave one revision/event.
2. Inject a transaction failure after outbox enqueue but before commit in an integration test. Booking status, receipt, audit, and outbox all roll back.
3. Stop Booking after commit but before relay publication. On restart, the relay reclaims the persisted pending/expired-claim row and publishes the same event ID.
4. Simulate publish acknowledgement uncertainty. Redelivery may occur, but the outbox retains one logical row and CMM envelope receipt protects business effects.

Fault hooks are package/test-scoped collaborators or transaction-test failures, never public production endpoints.

## CMM Duplicate, Stale, Rollback, and Replay

### Delivery matrix

1. Deliver initial revision envelope twice: first commits receipt/journey/status outbox; duplicate envelope is a no-op.
2. Deliver a distinct envelope carrying a lower/equal revision: receipt disposition is stale, highest journey remains unchanged, no status outbox is added.
3. Deliver a valid higher revision with the same container: journey reconciles and exactly one new planned status fact is enqueued.
4. Inject failure after receipt insert/journey change but before commit: receipt, journey, audit, and status outbox all roll back; retry applies once.
5. Deliver a permanent invalid record: no receipt/business effect commits; original record reaches `booking.confirmed.DLT`.
6. Correct and replay with authorization while preserving envelope ID: environmental correction uses the original key/value; payload correction uses a canonical corrected value with audited original/corrected hashes and field differences. It applies once; a second replay is deduped.

## Booking Status Duplicate and Ordering Scenarios

1. Deliver one status twice: one receipt/projection; duplicate envelope no-op.
2. Deliver newer then older occurred time: both distinct receipts commit, but projection retains newer.
3. Deliver equal occurred time with `PLN`, then `ACT`: `ACT` wins by classifier rank.
4. Deliver equal occurred/classifier with older received time: candidate is stale.
5. Inject failure between receipt insert and projection update: transaction rolls back; retry applies both atomically.
6. Permanent invalid record reaches `containermovement.status.DLT` with no receipt; corrected canonical replay preserves envelope ID, records original/corrected hashes and field differences, and applies once.

## Service Restart Proof

Use the real Compose databases and broker:

1. Complete one end-to-end Booking and capture business IDs/counts/checksums.
2. Restart Booking only; verify health, detail, pricing, confirmation, receipts, projection, and pending/published outbox remain queryable.
3. Restart CMM only; verify health, journey/highest revision, receipts, and outbox remain queryable.
4. Replay both original topic records with the same key/value/envelope IDs.
5. Reassert unchanged logical counts and stable latest projection/UI.

Container/process restart must not remove PostgreSQL volumes. A destructive database reset cannot satisfy this proof.

## V1-to-V2 Migration Proof

1. Start from a captured W0/V1 database fixture containing real Booking/CMM IDs, snapshots, statuses, audit/idempotency, and outbox rows.
2. Record pre-upgrade row counts, selected value checksums, schema history, and outbox lifecycle state.
3. Start W1 services with `spring.sql.init.mode=never`, service-local Flyway locations, and baseline-at-V1 rules. Proven non-empty databases receive a version-1 baseline marker then V2; empty databases execute V1 then V2. Unknown/partial history blocks startup.
4. Assert preserved IDs, Booking numbers, statuses/revisions, lifecycle/pricing data, journey history, audit/idempotency, and W0 outbox rows.
5. Restart twice and verify Flyway applies no migration again and checksums remain stable.
6. Prove forward repair on a disposable clone/transaction. Document volume restore from the pre-upgrade backup; do not reset the acceptance database.

## DLT Replay Control

The local proof command selects by DLT topic/partition/offset, requires `messaging:replay` actor authorization and nonblank reason, and preserves envelope ID. For environmental/configuration repair it republishes original key/value unchanged. For payload/schema/invariant repair it publishes a corrected canonical value and writes original/corrected SHA-256 plus field-level differences to replay audit. It does not edit receipt or business tables. DLT non-empty for five minutes or more than 100 records fails/alerts; local capacity is at least 10,000 W1-sized records.

## Evidence Capture

Each scenario writes machine-readable before/after counts, IDs, hashes, timestamps, topic coordinates, service restart times, migration history/checksums, and pass/fail assertions under `artifacts/w1-01-live/replay-restart/`. Secrets and raw customer data are excluded.

## Source Coverage

The workflow implements U06 in `unit-of-work.md`, maps US-W1-006 from `unit-of-work-story-map.md`, proves resilience requirements in `requirements.md`, exercises C02-C09/C12 ownership in `components.md`, validates atomic methods in `component-methods.md`, and follows delivery/restart/DLT constraints in `services.md`.
