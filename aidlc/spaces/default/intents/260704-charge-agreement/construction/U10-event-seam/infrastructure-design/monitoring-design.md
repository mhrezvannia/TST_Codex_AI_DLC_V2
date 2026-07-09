# Monitoring Design - U10

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Checks

Unit tests verify fact creation and publisher calls. Live broker health is reported as blocked until infrastructure exists.

## Evidence

Do not claim durable event delivery without outbox/broker implementation.
