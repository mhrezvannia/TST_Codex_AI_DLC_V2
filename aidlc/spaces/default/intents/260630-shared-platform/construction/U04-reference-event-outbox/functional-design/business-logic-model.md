# Business Logic Model - U04 Reference Event Outbox and Kafka Publication

## Source Trace

This U04 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Unit Purpose

U04 implements reliable reference-change publication for `reference-data-service`: transactional outbox persistence, outbox claiming, Avro event mapping, Confluent Schema Registry integration, Kafka publishing, retry/failure status, and status APIs/view models for administrators and operators.

U04 does not implement downstream runtime consumers for Charge, Booking, or Container Movement. It produces contracts and event streams that those future modules can consume later.

## Outbox Enqueue Workflow

```text
U03 reference mutation commits
  -> application service builds ReferenceChangedFact
  -> persist reference aggregate and outbox row in same database transaction
  -> initialize outbox status as PENDING
  -> include event id, entity id, reference set, operation, payload snapshot, schema version, correlation id
```

Atomicity rule: a committed reference mutation must not exist without its corresponding outbox entry unless an explicit recovery process marks and repairs the anomaly.

## Outbox Claim Workflow

```text
Scheduled publisher tick
  -> select due PENDING/RETRYABLE outbox rows by nextAttemptAt
  -> claim rows with SKIP LOCKED or equivalent concurrency guard
  -> mark rows IN_PROGRESS with claimedBy and claimedAt
  -> return bounded batch to publisher
```

Claiming constraints:

| Constraint | Behavior |
|---|---|
| Multiple publisher instances | Only one instance may claim a row at a time. |
| Batch size | Configurable and bounded. |
| Stale in-progress row | Eligible for recovery after timeout. |
| Shutdown | In-flight rows remain recoverable. |

## Event Mapping Workflow

```text
Outbox row
  -> resolve reference set event type
  -> map common envelope
  -> map set-specific payload
  -> validate schema version and required fields
  -> serialize Avro with Schema Registry subject
```

Common envelope fields:

| Field | Purpose |
|---|---|
| `eventId` | Idempotency/deduplication key. |
| `eventType` | `referencedata.<entity>.changed`. |
| `schemaVersion` | Producer schema version. |
| `source` | `reference-data-service`. |
| `occurredAt` | Domain change timestamp. |
| `correlationId` | End-to-end trace id. |
| `entityId` | Stable reference id. |
| `operation` | Created, updated, deactivated, reactivated. |
| `producer` | Service/version metadata. |

## Kafka Publication Workflow

```text
Serialized event
  -> choose topic and key
  -> publish to Kafka with event id/entity id keying strategy
  -> receive broker metadata
  -> mark outbox row PUBLISHED with partition/offset/timestamp
```

Failure handling:

| Failure | Status | Follow-up |
|---|---|---|
| Serialization/schema error | FAILED_PERMANENT | Operator action; contract/schema fix. |
| Broker unavailable | RETRYABLE | Backoff and retry. |
| Timeout/unknown result | RETRYABLE | Retry with same event id. |
| Publish succeeds but status update fails | RECOVERY_REQUIRED | Reconcile by event id and broker metadata where possible. |

## Retry and Dead-Letter Workflow

```text
Publish failure
  -> increment attempt count
  -> classify retryable/permanent
  -> compute nextAttemptAt
  -> persist lastErrorCode, lastErrorMessage, and status
  -> expose status to API/operator view
```

Dead-letter handling is represented by failed status and operator visibility for MVP. A physical DLQ topic can be added later if approved by NFR/infrastructure design.

## Event Status Query Workflow

```text
Admin/operator requests status
  -> authorize status read where required
  -> query outbox/status projection by record id, event id, reference set, status, or time range
  -> return pending/published/retrying/failed/stale status with correlation id and broker metadata where safe
```

U06 consumes this status to show recent reference changes and publication health.

## Schema Compatibility Workflow

```text
Build/test pipeline
  -> validate Avro schemas against expected compatibility mode
  -> run message-pact or equivalent contract tests
  -> block merge on incompatible changes
```

U04 defines schema families and payload intent. U08 implements hard CI compatibility gates.

## Walking Skeleton Support

U04 supports the walking skeleton by:

- Creating one outbox row with a reference mutation.
- Publishing one typed reference-changed event to local Kafka/SR.
- Marking the row as PUBLISHED.
- Returning status through a status API/view model.
- Preserving correlation id from API request to audit/outbox/log/event.

## Non-Goals

- No downstream runtime consumers or local replicas.
- No Charge, Booking, or Container Movement code.
- No generic central event platform service.
- No replacement for U03 reference validation or U08 CI compatibility gates.
