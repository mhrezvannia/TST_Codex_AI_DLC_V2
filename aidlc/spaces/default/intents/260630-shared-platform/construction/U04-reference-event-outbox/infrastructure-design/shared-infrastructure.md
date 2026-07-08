# Shared Infrastructure - U04 Reference Event Outbox

## Shared Dependencies

| Shared resource | U04 usage | Boundary |
|---|---|---|
| PostgreSQL | Durable outbox/status store | Owned by reference-data-service boundary. |
| Kafka | Event broker | Integration transport, not reference state owner. |
| Schema Registry | Avro compatibility | Schema governance only. |
| Vault | Non-local credentials | No literal non-local secrets. |
| Observability stack | Publication telemetry | Telemetry only. |
| U06/UI status views | Operator/admin visibility | Read-only status projection. |

## Access Boundaries

U04 produces reference-change events but does not implement downstream consumers, replicas, service stubs, or shared database contracts. Consumers must deduplicate by event id and consume provider APIs/events.

## Cross-Unit Contracts

U03 creates domain facts. U04 persists and publishes them. U07 records schema contracts. U08 gates compatibility. U10 surfaces freshness, lag, retry, failure, and correlation telemetry.

## Ownership and Compliance

Payloads include only approved reference-change data. Party/Customer classification controls apply to payload mapping, examples, logs, status APIs, and broker visibility.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
