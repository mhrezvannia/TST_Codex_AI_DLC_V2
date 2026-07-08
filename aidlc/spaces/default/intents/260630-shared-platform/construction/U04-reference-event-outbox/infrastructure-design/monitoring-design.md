# Monitoring Design - U04 Reference Event Outbox

## Metrics and KPIs

U04 emits outbox depth, oldest pending age, retry count, failed count, recovery-required count, claim latency, serialization latency, Schema Registry latency, Kafka publish latency, status update latency, publish attempts, and freshness p95.

The freshness target is p95 <= 60 seconds from committed reference change to consumer-observable Kafka event.

## Logging Strategy

Structured logs include service, event id, reference set, entity id, status, attempt count, safe failure code, broker metadata where safe, and correlation id. Logs omit secrets, unsafe payload internals, and raw stack traces.

## Tracing Configuration

OpenTelemetry spans cover claim, map, schema registry, serialize, publish, status update, retry classification, and recovery paths. Correlation id follows the original U03 change into outbox, logs, traces, and event envelope.

## Alerts and Dashboards

Alerts cover freshness p95 breach, growing oldest pending age, repeated retryable failures, permanent schema/serialization failures, recovery-required rows, and worker claim contention.

## Incident Response

Operators investigate by event id, record id, reference set, status, failure code, and correlation id. Physical DLQ behavior can be added later; MVP relies on failed/recovery-required visibility.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
