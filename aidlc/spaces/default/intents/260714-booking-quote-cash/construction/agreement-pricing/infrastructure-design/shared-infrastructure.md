# Shared Infrastructure - U03 Agreement Pricing

## Shared Resources

U03 reuses the Compose network, PostgreSQL container, generic Spring image builder, nginx/BFF entry path, observability stack, and seed/evidence harness. Physical PostgreSQL sharing does not weaken service ownership: `linercore_booking` and `linercore_pricing` have separate roles, Flyway histories, dumps, and migrations with no cross-schema grants.

The pricing boundary is the checked-in OpenAPI/Pact pair over internal HTTP. It does not reuse Kafka as request/response transport and does not depend on the Charge outbox event topic. Service discovery remains Compose DNS.

## Ownership Matrix

| Shared concern | Owner | U03 rule |
|---|---|---|
| pricing contract/catalog | contract pack | Booking and Charge verify the same version/fixtures |
| local identity secrets | environment/platform | target-specific, server-only, fixed role |
| PostgreSQL container | platform | owner-local databases/migrations/credentials |
| resilience metrics | Booking/observability | exact timeout/retry/breaker/bulkhead settings |
| seed/load harness | quality | deterministic agreements, terms, and outcomes |

Shared Charge outage maps to explicit Booking unavailable/manual work and never permits local calculation, cached rates, or browser composition. Replica changes require aggregate Charge DB and Booking bulkhead evidence.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U03 `business-logic-model.md`.
