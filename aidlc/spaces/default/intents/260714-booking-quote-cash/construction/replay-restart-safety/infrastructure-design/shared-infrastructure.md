# Shared Infrastructure - U06 Replay and Restart Safety

## Reused Control Surfaces

U06 orchestrates existing Compose, Docker, PostgreSQL/Flyway, Kafka/SR, W0 messaging, service health/metrics, and W1 evidence roots. It adds checked-in test drivers and read-only collectors, not production infrastructure. Each service still owns its DB, outbox, receipt, DLT/replay authorization, and business constraints.

Shared local credentials are role-separated: operator Docker control, read-only evidence DB access, normal service identity, and replay identity. Replay credentials have Kafka publish/schema-read and no DB/business mutation permission. The local plaintext waiver does not waive application authorization or audit.

## Ownership Matrix

| Shared resource | Owner | U06 use |
|---|---|---|
| Docker Compose/process controls | platform/quality | bounded restart and dependency faults |
| Kafka/SR | platform | delivery matrix and replay transport |
| service DLT/replay | consuming service | authorization, validation, audit |
| PostgreSQL/Flyway | each service | state proof and guarded migration |
| evidence root | quality | raw run data and hashes |
| fault seams | owning service tests | test classpath only |

Retry, restart, and replay remain separate mechanisms: retry handles bounded transient delivery, restart restores process availability, and replay is an audited operator action after terminal recovery.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U06 `business-logic-model.md`.
