# CI/CD Pipeline - U10

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline

Run published-language and event-port unit tests. Skip live Kafka tests unless broker profile is healthy and explicitly enabled.

## Rollback

Revert messaging adapter independently from event fact and port definitions.
