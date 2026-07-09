# Reliability Requirements - UOW-07 Outbox Publication Status

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Targets

- Outbox event is durable before publication attempt.
- Retryable failures record next attempt time.
- Permanent failures record error code and message.
- Publisher crash after claim does not lose event; event can become available again by claim timeout or retry policy.

## Degradation

- Kafka unavailable: status is retrying or pending, not published.
- Schema Registry unavailable: status is retrying with registry error.

