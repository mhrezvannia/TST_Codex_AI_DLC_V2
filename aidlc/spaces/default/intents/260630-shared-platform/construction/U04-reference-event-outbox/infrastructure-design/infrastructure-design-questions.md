# Infrastructure Design Questions - U04 Reference Event Outbox

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U04-reference-event-outbox`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Run publisher workers inside the `reference-data-service` deployment boundary as separate scheduled/worker components or process roles. HTTP APIs and publisher workers may scale independently as long as they share the owned PostgreSQL outbox and use safe claims.

### Q2. Compute/storage/networking

[Answer]: Use PostgreSQL outbox rows as the durable work queue, Kafka as broker, Confluent Schema Registry for Avro compatibility, and internal status APIs for admin/operator views.

### Q3. Monitoring approach

[Answer]: Monitor outbox depth, oldest pending age, claim latency, serialization latency, Schema Registry latency, Kafka publish latency, status update latency, retries, permanent failures, recovery-required rows, and freshness p95.

### Q4. CI/CD pipeline

[Answer]: Run Java/Maven checks, outbox repository integration tests, Kafka/SR Testcontainers-compatible tests, Avro validation, Schema Registry compatibility, message-pact fixtures, and smoke for one outbox row to published status.

### Q5. Secrets management

[Answer]: Kafka credentials, Schema Registry credentials, DB credentials, and telemetry/export credentials are Vault references outside local development. Logs expose safe reason codes only.

### Q6. Scaling policy

[Answer]: Scale workers horizontally with bounded batch sizes and row-level claim protection. Backoff and `nextAttemptAt` prevent retry storms; permanent failures stop poison-event loops.

## Ambiguity Analysis

No blocking ambiguity remains. Final broker partition count, physical DLQ topic, and production capacity are deferred.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
