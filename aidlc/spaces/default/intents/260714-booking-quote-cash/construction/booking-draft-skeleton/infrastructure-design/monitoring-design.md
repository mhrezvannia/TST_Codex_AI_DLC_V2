# Monitoring Design - U01 Booking Draft Skeleton

## Signals and Dashboards

Booking exposes Spring Actuator health plus Prometheus metrics. The U01 dashboard shows HTTP/BFF request count and p50/p95/p99, transaction/query/upcast timers, Hikari active/pending/acquisition, PostgreSQL errors, idempotency replay/conflict, create rollback, list result/page size, JVM RSS/GC, and Flyway version/checksum/readiness. Labels are bounded to route template, outcome, status class, operation, and migration version; Booking IDs and customer references stay in safe logs, not metric labels.

Structured logs carry timestamp, level, service, correlation ID, safe actor ID, operation, result code, and duration. They never dump request bodies, tokens, connection strings, snapshots, or customer attributes. OTel traces cover nginx/BFF/API/JDBC spans with baggage allow-list limited to correlation ID; sampling is 100 percent for the fixed local proof and configurable downward outside local.

## Alerts and Release Thresholds

| Signal | Gate/alert |
|---|---|
| Booking API latency | fail run at p95 >500 ms or p99 >1 s |
| Error/rollback | fail on any unexpected error or partial-effect assertion |
| Hikari pool | fail at wait p95 >=100 ms or connections >10 |
| JVM | fail at RSS >768 MiB, OOM, or unexpected restart |
| Flyway | readiness red on validation/pending/unknown catalog; release blocks |
| Database | readiness red on connection loss; detail reports unavailable, never fake data |
| Migration/restart | fail if IDs/counts/checksums change or recovery exceeds 60 s |

Grafana panels link to sanitized logs/traces by correlation ID. Local alerts are release-harness assertions rather than paging claims; W1 makes no production SLO or on-call commitment.

## Evidence Collection

The harness records raw timing samples, query plans over 10,000 bookings, Docker stats, Hikari snapshots, health responses, Flyway history/checksums, pre/post row and snapshot hashes, and two restart timelines. Every command captures timestamp, exit code, output hash, commit, and Compose profile under the unique W1 run directory.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and the atomic/restart workflow in U01 `business-logic-model.md`.
