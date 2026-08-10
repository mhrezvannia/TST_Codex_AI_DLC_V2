# Deployment Architecture - U06 Replay and Restart Safety

## Recovery Harness Topology

U06 adds checked-in Node/PowerShell controllers around the existing Compose services; it does not add a long-running recovery service. Scripts invoke Docker/Kafka controls, wait on bounded component-specific readiness, drive source/DLT records, and query read-only evidence endpoints/credentials. They run from the workspace against nginx 8088, Kafka 9092, Schema Registry 8081, and PostgreSQL host 55432.

Replay is a protected local CLI or endpoint inside the owning service boundary. It receives a separate `LOCAL_REPLAY_TOKEN`, fixed `messaging:replay` role, actor, reason, source/DLT coordinates, and destination. It has Kafka/SR access but no database credentials or table-update path. Normal service/user tokens cannot replay.

## Restart and Catch-up

Booking and CMM restart sequentially; Kafka/SR/PostgreSQL dependency faults are controlled separately. Scripts stop one component, record monotonic marks, start it, wait at most 60 seconds after dependency health, verify Flyway/readiness/listener assignment/relay, then compare business state. They never launch duplicate catch-up processes or reset volumes.

Catch-up stays within three partitions/listener concurrency three, poll/relay batch 50, Hikari 10, record <=256 KiB, and existing 30-second outbox claim lease. Consumer offsets resume normally, while receipts and business uniqueness remain final redelivery protection. Scaling is frozen if pool wait or RSS thresholds fail.

## Fault and Migration Isolation

Transaction crash hooks are constructor-injected test collaborators with production default no-op and no controller/config surface. Migration tests run guarded V1/V2 and restore/forward repair on a disposable copy after capturing dump/schema/count/hash; production-like acceptance databases are never destructively restored in place.

The durability claim is committed-state survival within existing volumes. Host/volume loss RPO is the latest captured dump. Every fault run creates a new evidence run ID and preserves failed diagnostics.

## Source Coverage

Deployment maps `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U06 `business-logic-model.md`.
