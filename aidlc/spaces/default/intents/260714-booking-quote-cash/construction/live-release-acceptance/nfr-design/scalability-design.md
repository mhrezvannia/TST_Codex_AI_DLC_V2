# Scalability Design - U07 Live Release Acceptance

## Fixed Environment Envelope

Compose declares three topic/DLT partitions, listener concurrency3, relay50, Hikari2/10/2s, outbound10, body256KiB and service memory expectation. Seed builders create 10k bookings, >=100 reference records/set, >=100 agreements x <=100 terms while preserving the unique measured journey fixtures.

Collector gates pricing <=5m, journey <=10m, lag zero30s, pool wait/connection/RSS/OOM and exact row/topic counts. Capacity/retention assertions are machine-readable; production forecast/autoscaling is explicitly not inferred from W1.

## Source Coverage

Design realizes `scalability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U07 `business-logic-model.md`.
