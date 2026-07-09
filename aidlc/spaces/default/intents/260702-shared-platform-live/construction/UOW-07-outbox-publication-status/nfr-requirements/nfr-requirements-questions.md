# NFR Requirements Questions - UOW-07 Outbox Publication Status

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Answers

- Publication target: publish claimed batch under 5 seconds locally when Kafka and Schema Registry are healthy.
- Security target: event payloads contain reference identifiers/data only, no secret or token data.
- Reliability target: broker/schema failures become retrying or failed status with reason.

