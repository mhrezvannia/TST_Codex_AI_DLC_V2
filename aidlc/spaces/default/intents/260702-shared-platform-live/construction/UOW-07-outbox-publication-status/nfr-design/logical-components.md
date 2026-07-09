# Logical Components - UOW-07 Outbox Publication Status

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Components

| Component | Responsibility | Failure domain |
| --- | --- | --- |
| OutboxRepository | Durable event state. | PostgreSQL. |
| ReferenceEventMapper | Converts domain facts to contract payloads. | Domain/application logic. |
| SchemaRegistryAdapter | Ensures schema registration/compatibility. | Schema Registry. |
| KafkaEventPublisher | Publishes Avro-compatible messages. | Kafka broker/network. |
| PublicationStatusQuery | Exposes event state to BFF/UI. | reference-data-service/API. |

## Shared Resources

- PostgreSQL outbox table.
- Kafka topic.
- Schema Registry subjects.

