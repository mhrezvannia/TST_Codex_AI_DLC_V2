# Shared Infrastructure - U02 Reference Validation

## Shared Boundaries

U02 reuses nginx, the `linercore-local` network, generic Spring/Next.js builders, PostgreSQL container, Reference Data service, observability stack, and canonical seed loader. Database isolation remains logical and credential-enforced: Booking and Reference roles cannot inspect each other's schemas. Compose DNS is the only local discovery mechanism.

The shared Reference Data API is consumed through its existing typed HTTP boundary. U02 does not modify its ownership model, duplicate its tables, publish a second reference contract, or add Kafka to synchronous validation. Capacity settings are Booking-owned because they protect both Booking and the shared provider.

## Ownership Matrix

| Resource | Owner | U02 responsibility |
|---|---|---|
| Reference API/database | Reference Data | indexed active lookups, fixed local role |
| Booking executor/client | Booking | fan-out, timeout, overload, cancellation |
| local service tokens | environment/platform | distinct target token, no browser exposure |
| seed fixture | quality/platform | canonical active/inactive/missing cases |
| metrics/traces | observability platform | bounded labels and correlation flow |

Scaling Booking multiplies pressure on the shared provider, so aggregate call rate and Reference DB pool wait are release evidence before replica count changes. Shared outage degrades validation explicitly and never authorizes stale/fallback values.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U02 `business-logic-model.md`.
