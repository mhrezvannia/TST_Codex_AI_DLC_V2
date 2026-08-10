# Shared Infrastructure - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Ownership

This artifact implements U01 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md` for resources
shared by CMM and Booking.

Kafka topics/Schema Registry, the isolated network, Compose service discovery,
and the Wave A acceptance controller are shared platform resources. CMM owns
the status producer/outbox and Booking owns the consumer/receipt projection;
neither owns the other's database. Identity and Reference Data remain external
authorities. Access is least-privilege: CMM produces status and consumes
booking.confirmed, Booking consumes status and publishes its existing
confirmation event.

The manager demo/shared shell remains integration-owned and protected on 8088;
W2-04 adds no shared primitive, `packages/ui` change, cache, or cloud resource.

