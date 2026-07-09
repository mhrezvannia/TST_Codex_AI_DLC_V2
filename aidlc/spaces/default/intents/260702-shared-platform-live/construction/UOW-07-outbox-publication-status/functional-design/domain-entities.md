# Domain Entities - UOW-07 Outbox Publication Status

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Entities

| Entity | Attributes | Lifecycle |
| --- | --- | --- |
| OutboxEvent | eventId, eventType, schemaVersion, referenceSet, recordId, operation, payload, status, correlationId | enqueued -> claimed -> published/retrying/failed |
| ReferenceChangedFact | changeId, set, recordId, code, operation, attributes, occurredAt, correlationId | mapped -> outbox event |
| ReferenceEventEnvelope | eventId, eventType, schemaSubject, schemaVersion, occurredAt | built -> published |
| BrokerMetadata | topic, partition, offset, publishedAt | created on publish success |
| EventPublicationStatusView | eventId, recordId, status, errorCode, brokerMetadata, nextAttemptAt | queried -> returned |

## Relationships

- ReferenceChange creates ReferenceChangedFact.
- ReferenceChangedFact maps to OutboxEvent.
- Published OutboxEvent has BrokerMetadata.

