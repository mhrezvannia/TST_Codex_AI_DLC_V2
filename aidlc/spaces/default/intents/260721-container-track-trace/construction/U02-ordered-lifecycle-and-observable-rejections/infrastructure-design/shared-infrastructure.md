# Shared Infrastructure - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Ownership

This artifact implements U02 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Kafka topics, Schema Registry, isolated network/service discovery, and the Wave A
controller are shared. CMM produces committed status and owns relay fencing;
Booking consumes status and owns receipt/health/projection. Retry seams are
scoped to acceptance and cannot mutate shared broker/database state. The shared
shell/8088 demo remains integration-owned; W2-04 adds no shared UI primitive.

