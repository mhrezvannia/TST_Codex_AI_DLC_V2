# Domain Entities - U04 Reference Event Outbox and Kafka Publication

## Source Trace

These U04 entities derive from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## ReferenceChangedFact

Purpose: Domain change fact created by U03 and consumed by the outbox application service.

Attributes:

| Attribute | Description |
|---|---|
| `changeId` | Stable change identifier. |
| `referenceSet` | One of the nine MVP reference sets. |
| `entityId` | Stable reference id. |
| `businessKey` | Set-local code/key. |
| `operation` | Created, updated, deactivated, reactivated. |
| `changedFields` | Safe changed-field summary. |
| `payloadSnapshot` | Payload data used for event mapping. |
| `occurredAt` | Domain change timestamp. |
| `correlationId` | Platform correlation id. |

## OutboxEvent

Purpose: Durable publication work item.

Attributes:

| Attribute | Description |
|---|---|
| `eventId` | Stable event id and dedupe key. |
| `eventType` | `referencedata.<entity>.changed`. |
| `referenceSet` | Set name. |
| `entityId` | Stable reference id. |
| `operation` | Created, updated, deactivated, reactivated. |
| `payload` | Serialized or serializable event payload snapshot. |
| `schemaVersion` | Event schema version. |
| `status` | Publication lifecycle state. |
| `attemptCount` | Publish attempts. |
| `nextAttemptAt` | Retry scheduling timestamp. |
| `claimedBy` | Publisher worker id. |
| `claimedAt` | Claim timestamp. |
| `lastErrorCode` | Last failure code. |
| `lastErrorMessage` | Safe failure summary. |
| `correlationId` | Platform correlation id. |

Lifecycle:

```text
PENDING -> IN_PROGRESS -> PUBLISHED
PENDING -> IN_PROGRESS -> RETRYABLE -> IN_PROGRESS
IN_PROGRESS -> FAILED_PERMANENT
IN_PROGRESS -> RECOVERY_REQUIRED
```

## ReferenceEventEnvelope

Purpose: Common event envelope for all nine Avro events.

Attributes:

| Attribute | Description |
|---|---|
| `eventId` | Unique event id. |
| `eventType` | Typed event name. |
| `schemaVersion` | Schema version. |
| `source` | `reference-data-service`. |
| `occurredAt` | Domain event time. |
| `correlationId` | Trace id. |
| `entityId` | Changed reference id. |
| `operation` | Change operation. |
| `producer` | Producer metadata. |

## ReferenceEventPayload

Purpose: Set-specific event body.

Specializations:

- `PartyCustomerChangedPayload`
- `LocationPortChangedPayload`
- `RegionChangedPayload`
- `VoyageChangedPayload`
- `CurrencyChangedPayload`
- `ChargeCodeChangedPayload`
- `EquipmentTypeChangedPayload`
- `CommodityChangedPayload`
- `TradeLaneChangedPayload`

Common payload fields:

| Attribute | Description |
|---|---|
| `id` | Stable reference id. |
| `code` | Business code. |
| `displayName` | Safe display name. |
| `status` | Active/inactive. |
| `version` | Reference version. |
| `changedFields` | Optional changed-field list. |

## SchemaSubject

Purpose: Schema Registry subject and compatibility metadata.

Attributes:

| Attribute | Description |
|---|---|
| `subjectName` | Schema Registry subject. |
| `eventType` | Event type. |
| `schemaVersion` | Version. |
| `compatibilityMode` | Expected compatibility mode. |
| `registeredAt` | Registration timestamp where known. |

## PublicationAttempt

Purpose: Attempt-level audit/status record.

Attributes:

| Attribute | Description |
|---|---|
| `attemptId` | Stable attempt id. |
| `eventId` | Outbox event id. |
| `attemptNumber` | Attempt count. |
| `startedAt` | Attempt start. |
| `finishedAt` | Attempt finish. |
| `result` | Success, retryable failure, permanent failure. |
| `brokerMetadata` | Topic, partition, offset where successful. |
| `errorCode` | Safe failure code. |
| `correlationId` | Platform correlation id. |

## EventPublicationStatusView

Purpose: Query projection for apps/reference-data and operator views.

Attributes:

| Attribute | Description |
|---|---|
| `eventId` | Event id. |
| `recordId` | Reference record id. |
| `referenceSet` | Set name. |
| `operation` | Change operation. |
| `status` | Current publication status. |
| `attemptCount` | Attempt count. |
| `lastAttemptAt` | Last attempt timestamp. |
| `publishedAt` | Published timestamp if available. |
| `brokerMetadata` | Safe topic/partition/offset summary. |
| `lastError` | Safe error summary. |
| `correlationId` | Trace id. |

## Entity Interaction Pattern

```text
ReferenceChangedFact
  creates OutboxEvent
OutboxEvent
  maps to ReferenceEventEnvelope + ReferenceEventPayload
ReferenceEventEnvelope + ReferenceEventPayload
  serialize under SchemaSubject
OutboxEvent publication
  records PublicationAttempt
  updates EventPublicationStatusView
```

## Excluded Entities

U04 does not define downstream consumer replicas, Charge/Booking/Container Movement event handlers, frontend component state, or reference aggregate validation entities owned by U03.
