# Deployment Architecture - U04 Reference Event Outbox

## Compute Model

U04 runs as publisher worker components within the `reference-data-service` boundary. Workers may be deployed as scheduled jobs, background workers, or separate process roles that share the service image and configuration. They are separate from provider/admin HTTP request handling.

Multiple worker instances are supported only with row-level claim protection and bounded batches.

## Network Topology

Workers read PostgreSQL outbox rows, resolve Avro schemas through Confluent Schema Registry, publish to Kafka, then update outbox status in PostgreSQL. Status APIs expose safe lifecycle views to authorized admin/operator consumers.

Downstream modules are not deployed by U04; they are contract-only future consumers.

## Storage Strategy

PostgreSQL stores durable outbox rows, status, attempts, `nextAttemptAt`, claim metadata, safe failure summaries, and broker metadata. Kafka stores published events. Schema Registry stores Avro schema metadata and compatibility information.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Compose Kafka/SR/PostgreSQL and one publisher worker. |
| Staging | Vault references, compatibility baseline, smoke event publish evidence. |
| Production | Placeholder only; final partitions, retention, DLQ, and sizing deferred. |

## Resource Sizing

Worker batch size, backoff, claim timeout, and max attempts are configurable. Initial sizing prioritizes freshness p95 <= 60 seconds and operational visibility over final broker throughput tuning.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
