# Code Generation Plan - U04 Reference Event Outbox and Kafka Publication

## Source Trace

This plan implements U04 from `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `unit-of-work.md`, `unit-of-work-story-map.md`, and `requirements.md`.

U04 extends `reference-data-service` with reliable reference-change publication: outbox event model, enqueue boundary, claim/retry/status behavior, event envelope/payload mapping, Avro schema placeholders, Kafka/Schema Registry adapter seams, and status APIs. It must not implement downstream consumers, frontend status components, public cloud messaging, or Charge/Booking/Container Movement code.

## Implementation Steps

- [x] Step 1: Add U04 domain entities in `reference-data-service/domain-core`.
  - Traceability: BR-U04-004 through BR-U04-026.
  - Add `ReferenceChangedFact`, `OutboxEvent`, `OutboxStatus`, `ReferenceEventEnvelope`, `ReferenceEventPayload`, `SchemaSubject`, `PublicationAttempt`, and `EventPublicationStatusView`.

- [x] Step 2: Implement outbox lifecycle behavior.
  - Traceability: BR-U04-004 through BR-U04-009, BR-U04-016 through BR-U04-022.
  - Support enqueue as PENDING, bounded claim as IN_PROGRESS, published status, retryable failure with nextAttemptAt, permanent failure, and recovery-required status.

- [x] Step 3: Add application-service ports and services.
  - Traceability: BR-U04-001, BR-U04-027.
  - Add outbox repository, Kafka publisher, schema registry, clock/id generation, and status query ports.
  - Add enqueue, claim batch, publish batch, mark result, and status query flows.

- [x] Step 4: Map reference changes to typed events.
  - Traceability: BR-U04-010 through BR-U04-015.
  - Define event type names using `referencedata.<entity>.changed`.
  - Include event id, schema version, source, occurredAt, correlation id, entity id, operation, and producer metadata.

- [x] Step 5: Add dataaccess/messaging adapter placeholders.
  - Traceability: BR-U04-008, BR-U04-018 through BR-U04-021.
  - Add in-memory outbox repository with claim protection suitable for tests.
  - Add Kafka publisher and Schema Registry adapter placeholders that preserve event ids and safe failure classification.

- [x] Step 6: Add status API placeholders.
  - Traceability: BR-U04-022 through BR-U04-026.
  - Add status query controller or route under `reference-data-service` for event id, record id, reference set, status, and time range filters.

- [x] Step 7: Add Avro schema placeholders and examples.
  - Traceability: BR-U04-010 through BR-U04-014, BR-U04-028.
  - Add nine schema placeholder files under `contracts/avro/referencedata.*.changed.avsc`.
  - Add one example event envelope under `contracts/examples/`.

- [x] Step 8: Add tests.
  - Traceability: Standard test strategy.
  - Cover enqueue status, claim exclusivity, retryable/permanent failure classification, event mapping, status projection, and no downstream consumer code.

- [x] Step 9: Run verification.
  - Traceability: U04 NFR and quality gates.
  - Run Java tests if Java/Maven are available; otherwise record the environment limitation.
  - Re-run skeleton validation, source-level domain-core dependency scan, direct TypeScript checks, Vitest, and ESLint as applicable.

## Test Strategy

The active strategy is Standard. U04 must create domain/application tests and adapter/publisher stubs for the key publication boundaries. U08 will later harden compatibility gates, but U04 must create the contract/schema artifacts now.

## Approval

This plan is ready for review before U04 implementation.
