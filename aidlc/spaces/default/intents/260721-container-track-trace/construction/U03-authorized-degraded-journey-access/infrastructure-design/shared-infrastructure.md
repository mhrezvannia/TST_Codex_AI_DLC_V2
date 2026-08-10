# Shared Infrastructure - U03 Authorized Degraded Journey Access

## Inputs and Ownership

This artifact implements U03 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Shared resources are Kafka/Schema Registry, isolated network/service discovery,
Wave A controller, and the integration-owned shell/edge. Identity and Reference
Data remain authoritative external dependencies. CMM owns protected read/capture
and its DB; Booking owns its projection and never supplies authorization. W2-04
adds no shared UI primitive, cache, cloud service, or manager-demo change.

