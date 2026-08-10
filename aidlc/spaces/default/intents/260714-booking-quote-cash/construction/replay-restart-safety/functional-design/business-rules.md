# Business Rules - U06 Replay and Restart Safety

## Exactly-Once Business Effect Rules

| ID | Rule | Proof |
|---|---|---|
| BR-U06-001 | At-least-once transport may duplicate records; durable local identity prevents duplicate business effects. | Same record replay tests on both topics. |
| BR-U06-002 | Charge terminal result/manual case is unique per booking amendment and request key/hash. | Concurrent/lease-takeover tests. |
| BR-U06-003 | Booking confirmation event is unique per event type, booking, and revision. | Concurrent confirm + rollback + restart. |
| BR-U06-004 | CMM applies only highest valid booking revision and records successfully consumed envelope IDs. | Duplicate/stale/higher-revision matrix. |
| BR-U06-005 | Booking projection can advance but never regress under concurrent/out-of-order status delivery. | Full ordering tuple matrix. |
| BR-U06-006 | Receipt and business effect share one transaction in each consumer. | Injected rollback tests. |

## Crash and Lease Rules

- Charge `IN_PROGRESS` lease is ten seconds; one expired-owner CAS takeover is permitted.
- Terminal Charge state is immutable; stale-owner completion cannot overwrite it.
- Outbox claims recover after their configured claim timeout without creating another logical row/event ID.
- A service crash after local commit but before publish/ack is expected; restart resumes from durable state.
- No process-local cache, scheduler memory, or browser state is an idempotency authority.

## DLT and Replay Rules

- Permanent contract/invariant errors skip transient retries; transient failures receive 250 ms and 1 second retries before DLT.
- Failed consumer transaction commits no receipt. Corrected replay with preserved envelope ID may apply once.
- Successful-record replay is a receipt no-op; stale distinct replay records stale disposition without projection/journey regression.
- Replay requires `messaging:replay`, nonblank reason, original coordinates, and immutable audit.
- Replay tooling republishes through Kafka only and never patches domain/receipt tables. Environmental repair reuses the original key/value; payload repair preserves envelope ID while auditing original/corrected hashes and field differences.
- DLT retention is seven days, local capacity at least 10,000 records, and non-empty age/count thresholds are observed.

## Migration and Restart Rules

- Booking, Charge, and CMM use V1 baselines copied from existing schemas plus ordered additive V2 migrations.
- `spring.sql.init` is disabled for all three; Flyway service-local locations are the only runtime schema writers, preventing double application.
- Existing non-empty databases baseline at V1; fresh databases execute V1 then V2.
- Migration preserves IDs, status/revision, snapshots, lifecycle/pricing/history, audit/idempotency, and outbox lifecycle.
- Migration checksums and schema history are stable over two service restarts.
- Destructive reset, volume deletion, or fixture recreation cannot count as migration/restart proof.
- Restore procedure starts from a captured pre-upgrade volume/dump; forward repair is proven separately on disposable data.

## Test-Control Rules

- Failure injection is test/package scoped or uses real local process/broker/database controls; no unauthenticated production fault endpoint is added.
- Assertions use business keys and database/topic evidence, not log-message presence alone.
- Every expected delivery and error is counted; performance/reliability summaries do not drop failures.
- Evidence excludes secrets, credentials, customer attributes, and unrestricted raw message bodies.

## UI Persistence Rules

- Booking detail after restart is served from persisted Booking-owned state and displays the same route, equipment, quote, confirmation, and latest status.
- During service restart, unavailable is explicit and Retry does not erase the last rendered persisted fact.
- Replay/duplicate delivery does not create duplicate timeline entries or regress visible status.
- The end-user UI exposes no DLT replay command; replay is an authorized operator/test control.

## Source Coverage

Rules refine U06 from `unit-of-work.md`, US-W1-006 in `unit-of-work-story-map.md`, FR-W1-012/NFR resilience in `requirements.md`, C02-C09/C12 ownership in `components.md`, idempotent transaction methods in `component-methods.md`, and at-least-once/restart/DLT behavior in `services.md`.
