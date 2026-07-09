# Business Logic Model - UOW-07 Outbox Publication Status

## Context

This Functional Design consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Publication Workflow

1. Mutation enqueues outbox event with event id, reference set, record id, operation, schema subject/version, payload, correlation id, and pending status.
2. Publisher claims available events with worker id and batch size.
3. Publisher ensures schema is registered/compatible.
4. Publisher sends event to Kafka.
5. On success, outbox records broker metadata and published timestamp.
6. On retryable failure, outbox records retrying status, error code, message, and next attempt time.
7. On permanent failure, outbox records failed status and reason.

## Status Query Workflow

1. UI/BFF queries statuses by event id, record id, reference set, status, or time range.
2. Service returns latest status views.
3. BFF maps status into UI text and retry availability.

