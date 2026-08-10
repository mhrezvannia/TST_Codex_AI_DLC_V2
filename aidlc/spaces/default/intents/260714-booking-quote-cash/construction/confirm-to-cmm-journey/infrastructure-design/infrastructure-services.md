# Infrastructure Services - U04 Confirm to CMM Journey

## Messaging and Data Services

| Service | U04 role | Ownership/failure boundary |
|---|---|---|
| Booking DB/outbox | confirmation and logical event atomicity | Booking PostgreSQL |
| Booking relay/mapper | exact canonical publish through shared W0 infra | Booking process plus Kafka/SR |
| Kafka/Schema Registry | keyed at-least-once transport and contract governance | shared local platform |
| CMM listener/error handler | strict map, bounded retry, service DLT | CMM consumer group |
| Reference Data API | route authority before CMM apply | synchronous dependency outside DB tx |
| CMM DB/application | receipt, highest revision, journey, status outbox | CMM PostgreSQL |

No new publisher, registrar, scheduler, generic retry framework, sync CMM callback, or cross-service transaction is created. Service adapters wrap the existing `KafkaGenericRecordPublisher`, `ConfluentSchemaRegistrar`, `ScheduledOutboxRelay`, and `NoopMessagingGuard`. The shared module itself owns the narrowly scoped producer-property, `Duration` send-timeout, and require-real guard overloads; Booking/CMM configurations only bind values and invoke those shared APIs.

## Persistence and Migration

Booking V2 carries confirmation receipt/outbox logical uniqueness and claim lease fields/indexes. CMM V2 adds canonical journey routing/equipment, consumed-event receipts, highest Booking revision, and status-outbox uniqueness. Both owner-local Flyway strategies disable automatic baseline and require valid history, empty schema, or exact service V1 fingerprint before explicit baseline. Unknown/partial catalogs abort before mutation.

Outbox eligibility is `PENDING`, due `RETRYABLE`, or expired `IN_PROGRESS`; claim is one transaction, publish occurs after claim commit, and success/failure state transition is idempotent. CMM inserts envelope receipt and applies highest revision in one transaction. Duplicate envelope is no-op, stale distinct revision records disposition only, and failed application rolls back receipt/effect.

## Security, DLT, and Replay

Adapters require expected source, type, integer schema version 1, canonical field names, body <=256 KiB, route <=8, equipment <=20, and no customer PII. Local service tokens/roles protect HTTP dependencies; replay requires separate `LOCAL_REPLAY_TOKEN` and `messaging:replay`. DLT stores original key/value plus topic/partition/offset and error headers, not unrestricted log dumps.

Permanent schema/contract failures do not retry. Transient DB/Reference errors receive only listener-handler retries. Environmental replay preserves the envelope ID; corrected replay audits original/corrected hashes and field differences. DLT capacity is >=10,000 W1 records and any non-empty age >5 minutes or count >100 fails acceptance. Source-topic retention is 30 days and DLT retention is seven days.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U04 `business-logic-model.md`.
