# Infrastructure Services - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Ownership

This design implements U02 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

CMM owns journey/request/attempt/rejection/audit/outbox tables and publisher;
Booking owns receipt, duplicate-delivery evidence, latest projection, and
consumer-health tables. Kafka/Schema Registry owns transport/schema authority.
Indexes cover stable journey/request/event identity, outbox fence state,
receipt/event ID, sequence, and health. No cache, new broker, or synchronous
CMM query is introduced.

