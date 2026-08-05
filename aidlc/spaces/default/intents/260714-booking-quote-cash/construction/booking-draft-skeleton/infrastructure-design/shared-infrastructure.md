# Shared Infrastructure - U01 Booking Draft Skeleton

## Shared Resource Boundaries

U01 adopts the existing Compose bridge, PostgreSQL container, nginx ingress, image builders, seed harness, and observability stack. Sharing is physical only: Booking owns its database/role/migrations and no service receives cross-schema privileges. Nginx exposes the Booking app path; internal Spring services stay on Compose DNS. PostgreSQL host port remains 55432 to avoid the occupied default host port.

The existing Kafka/Schema Registry services may run in the full profile but U01 creates no event dependency. Later units adopt the shared `platform-messaging` module and canonical topics; U01 does not invent a relay, publisher, registrar, topic, or HTTP CMM shortcut.

## Ownership and Change Control

| Shared item | Owner | U01 change rule |
|---|---|---|
| `compose.yaml`/network | platform repository | additive env/readiness only; preserve existing profiles |
| PostgreSQL container/bootstrap | platform repository | add Booking V2 through service Flyway, not bootstrap rewrites |
| nginx | web platform | route stable Booking paths only |
| observability stack | platform repository | add bounded Booking scrape/dashboard definitions |
| Docker build definitions | platform repository | reuse pinned generic builders |
| evidence root | quality harness | U01 writes scoped raw evidence; U07 finalizes verdict |

Shared outages may make the local stack unavailable but cannot authorize cross-service data access or fallback records. Resource names, ports, image tags, environment variables, and health checks are checked into version control; console/manual drift is not accepted evidence.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U01 `business-logic-model.md` while preserving ownership boundaries.
