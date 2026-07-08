# Shared Infrastructure - U03 Reference Domain API

## Shared Dependencies

| Shared resource | U03 usage | Boundary |
|---|---|---|
| `identity-service` | Authorization dependency for protected workflows | U03 does not embed policy logic. |
| PostgreSQL host/container | Local physical database service may be shared | U03 owns its logical schema/database. |
| Kafka/SR | U04 publication infrastructure for U03 facts | U03 domain does not publish directly. |
| Nginx | Browser edge to BFF apps | No direct browser-to-service calls. |
| Vault | Non-local secret references | No literal non-local secrets. |
| Observability stack | Logs, metrics, traces | Telemetry only. |

## Access Boundaries

U03 is the canonical owner of reference state. Consumers integrate through provider/admin OpenAPI and later reference-change events. No frontend, future module, or other service reads/writes the reference datastore directly.

## Cross-Unit Contracts

U02 supplies authorization decisions. U04 consumes durable domain facts/outbox records. U06 consumes provider/admin/status APIs through BFF routes. U07 publishes contracts. U08 gates quality/compatibility. U10 consumes U03 telemetry and health.

## Ownership and Compliance

Party/Customer data may be Confidential or Restricted. Infrastructure and telemetry must preserve classification, avoid unsafe payload exposure, and keep audit/change history available for authorized investigation.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
