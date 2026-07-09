# Functional Design Questions - UOW-07 Outbox Publication Status

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Questions and Answers

- Publication pattern: [Answer]: Transactional outbox with Kafka publisher and Schema Registry checks.
- Status model: [Answer]: pending, published, retrying, failed, unavailable as queryable status.
- Failure handling: [Answer]: Schema Registry/Kafka failures become retryable or permanent outbox state, not silent success.

