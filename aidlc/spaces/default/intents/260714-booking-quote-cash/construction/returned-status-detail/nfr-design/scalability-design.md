# Scalability Design - U05 Returned Status Detail

## Bounded Components

Three partitions/listener concurrency3, Hikari10, guarded one-row projection per booking/container, and local indexed detail avoid distributed locks/fan-out. Pollers max100, one request/s, 30 attempts and hidden pause; BFF/DB reject overload rather than queue indefinitely.

Receipts/outbox >=30d, audit >=90d, DLT 7d. Acceptance uses 100 journeys/concurrency5 <=10m, lag zero30s, pool wait/RSS limits. Metrics show active pollers/detail QPS, duplicate/stale, upsert result, lag and DB pool.

## Source Coverage

Design realizes `scalability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U05 `business-logic-model.md`.
