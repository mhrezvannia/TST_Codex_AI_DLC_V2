# Tech Stack Decisions - UOW-07 Outbox Publication Status

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Decisions

| Area | Decision |
| --- | --- |
| Broker | Kafka via `confluentinc/cp-kafka:7.7.1`. |
| Schema registry | Confluent Schema Registry 7.7.1. |
| Event format | Avro schemas under `contracts/avro`. |
| Service adapter | Java messaging adapter behind `ReferenceEventPublisherPort` and `SchemaRegistryPort`. |

## Rationale

Matches existing contracts, Compose services, and reference-data-service outbox model.

