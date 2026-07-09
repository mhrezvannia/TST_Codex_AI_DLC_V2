# Infrastructure Services - U10

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Services

Local no-op/in-memory event adapter for MVP. Future Kafka and Schema Registry are optional blocked infrastructure until Docker/Compose recovers.

## Boundaries

Published-language facts stay independent of broker implementation.
