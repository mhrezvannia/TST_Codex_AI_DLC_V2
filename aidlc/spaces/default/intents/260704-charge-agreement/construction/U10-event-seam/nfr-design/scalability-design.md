# Scalability Design - U10

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep publisher interface batch-neutral and adapter-backed. Future Kafka/outbox adapter can scale independently.

## Growth

Do not require live broker for MVP local functionality.
