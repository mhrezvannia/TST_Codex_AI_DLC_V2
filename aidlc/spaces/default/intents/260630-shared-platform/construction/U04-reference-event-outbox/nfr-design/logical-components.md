# Logical Components - U04 Reference Event Outbox

## Component Overview

U04 extends the `reference-data-service` boundary with transactional outbox storage, publisher workers, Avro event mapping, Confluent Schema Registry integration, Kafka publication, retry/failure lifecycle management, and OpenAPI status APIs for administrators/operators.

## Components

### Outbox Enqueue Port

Used by U03 mutation application services to persist the domain fact and outbox row in the same PostgreSQL transaction as the reference aggregate and change history. It initializes PENDING status, stable event id, payload snapshot, schema version, and correlation id.

### Outbox Repository

Owns indexed queries and state transitions for PENDING, IN_PROGRESS, RETRYABLE, PUBLISHED, FAILED_PERMANENT, and RECOVERY_REQUIRED rows. It supports bounded claims, stale-claim recovery, status updates, retry scheduling, and filtered/paginated status queries.

### Publisher Scheduler

Runs configurable ticks, requests bounded due batches, and coordinates worker execution. It respects shutdown by leaving in-flight claimed rows recoverable rather than deleting or losing them.

### Claim Manager

Claims rows with `SKIP LOCKED` or equivalent concurrency protection, marks rows IN_PROGRESS with `claimedBy` and `claimedAt`, and prevents concurrent workers from publishing the same row at the same time.

### Event Mapper

Maps outbox payload snapshots to typed reference-change Avro envelopes and set-specific payloads. It validates required fields, schema version, event type, entity id, operation, occurredAt, producer metadata, and correlation id.

### Schema Registry Adapter

Resolves subjects, checks or registers compatible Avro schemas as configured, and classifies schema/serialization failures as permanent when they cannot succeed through retry.

### Kafka Publisher Adapter

Publishes serialized events to Kafka with deterministic topic and key strategy, receives broker metadata, and returns safe publish outcomes for status update. It does not implement downstream consumers.

### Retry Classifier

Classifies broker outages, timeouts, unknown results, schema errors, serialization errors, and status-update failures. It computes bounded backoff, preserves stable event id, and avoids poison-event retry loops.

### Status API and View Model

Exposes authorized admin/operator queries by event id, record id, reference set, status, and time range. View models include safe lifecycle state, attempts, timestamps, correlation id, and broker metadata where safe.

### Observability Layer

Emits logs, metrics, and traces for outbox depth, oldest pending age, retries, failures, recovery-required rows, claim latency, serialization latency, publish latency, status update latency, freshness p95, event id, and correlation id.

## Dependency Direction

Domain mutation services depend on the outbox enqueue port. Publisher services depend on repository, mapper, Schema Registry, Kafka, retry, and observability ports. Adapters encapsulate PostgreSQL, Kafka, Schema Registry, and OpenAPI status infrastructure.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.
