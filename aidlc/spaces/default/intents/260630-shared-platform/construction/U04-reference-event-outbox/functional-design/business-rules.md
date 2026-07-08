# Business Rules - U04 Reference Event Outbox and Kafka Publication

## Source Trace

These U04 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Ownership Rules

BR-U04-001: `reference-data-service` is the sole producer of reference-change events in this workflow.

BR-U04-002: Kafka topics and Avro schemas are integration contracts, not shared ownership of reference data.

BR-U04-003: U04 must not implement downstream runtime consumers, replicas, or service stubs for Charge, Booking, or Container Movement.

## Outbox Rules

BR-U04-004: Every committed reference mutation that changes canonical data must create an outbox row in the same transaction.

BR-U04-005: Validation-only requests and failed mutations must not create outbox rows.

BR-U04-006: Outbox rows must have stable event ids.

BR-U04-007: Outbox rows must include reference set, entity id, operation, payload snapshot or mappable change fact, schema version, occurred-at timestamp, and correlation id.

BR-U04-008: Publisher workers must claim rows with concurrency protection so the same row is not published concurrently by multiple workers.

BR-U04-009: Claimed rows must be recoverable if the publisher crashes before final status update.

## Event Contract Rules

BR-U04-010: The service must define nine typed event contracts using the pattern `referencedata.<entity>.changed`.

BR-U04-011: Every reference-changed event must include a common envelope with event id, event type, schema version, source, occurred-at time, correlation id, entity id, operation, and producer metadata.

BR-U04-012: Event payloads must be specific enough for consumers to update local replicas without database access.

BR-U04-013: Event schemas must be Avro 1.11-compatible and registered through Confluent Schema Registry.

BR-U04-014: Schema evolution must preserve backward compatibility unless a later approved breaking-change process exists.

BR-U04-015: Event id must be sufficient for consumer deduplication.

## Publication Rules

BR-U04-016: Publication must support at-least-once semantics.

BR-U04-017: Kafka publish keys must be deterministic, preferably by reference entity id or stable business key where specified.

BR-U04-018: Successful publication must record broker metadata such as topic, partition, offset, and published-at timestamp.

BR-U04-019: Retryable failures must preserve the same event id across retries.

BR-U04-020: Permanent serialization/schema failures must not loop indefinitely.

BR-U04-021: Retry attempts must be bounded or observable so operators can detect stuck events.

## Status and Observability Rules

BR-U04-022: Outbox status must distinguish PENDING, IN_PROGRESS, RETRYABLE, PUBLISHED, FAILED_PERMANENT, and RECOVERY_REQUIRED or equivalent states.

BR-U04-023: Event publication status must be queryable for authorized admin/operator views.

BR-U04-024: Status queries must support event id, record id, reference set, status, and time-range filters.

BR-U04-025: Correlation id must propagate from API request to audit/change history, outbox row, log entries, and Kafka event envelope.

BR-U04-026: Structured logs must include service, event id, reference set, entity id, status, attempt count, and correlation id.

## Technical Environment Rules

BR-U04-027: U04 must use Java 21, Spring Boot 3.3, PostgreSQL 15+, Kafka, Confluent Schema Registry, Avro 1.11, OpenAPI, and the mandated hexagonal module shape.

BR-U04-028: Message contract tests and schema compatibility checks are required quality gates, finalized in U08.

BR-U04-029: Local development and tests must run against Docker Compose/Testcontainers-compatible Kafka and Schema Registry.

## Scope Rules

BR-U04-030: U04 must not bypass `reference-data-service` persistence or publish events directly from frontend apps.

BR-U04-031: U04 must not add public cloud services, managed AWS messaging, Kubernetes, or Helm.

BR-U04-032: U04 must not implement frontend event-status components; U06 consumes the status API/view model.
