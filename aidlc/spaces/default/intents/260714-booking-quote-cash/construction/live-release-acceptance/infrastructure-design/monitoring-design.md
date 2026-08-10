# Monitoring Design - U07 Live Release Acceptance

## Unified Release Dashboard

The collector snapshots Compose health/restarts, CPU/RSS, JVM/GC, Hikari active/wait, HTTP/BFF latency/errors, Reference fan-out/overload, Charge claim/query/calculate/breaker/manual, Booking/CMM outbox lag/claim/attempt/producer, consumer assignment/lag/retry/DLT, DB query/upsert, UI polling/render, Flyway, and Schema Registry version/fingerprint. Every signal is tied to run/phase and bounded business/correlation/event identities.

Raw JSONL/CSV retains all measured successes and failures. Nearest-rank percentiles are computed only after collection and parameter validation; errors are never dropped. Logs/traces are redacted before indexing and metric labels exclude high-cardinality IDs/PII.

## Blocking Thresholds

Pricing p99 must be <=800 ms; confirm-to-visible-status p95 <=5 seconds; Booking draft/detail p95 <=500 ms; Reference validation p95 <=1.5 seconds/p99 <=2 seconds; source lag returns to zero <=30 seconds; pool wait p95 <100 ms; DB connections <=10/service; Java RSS <=768 MiB; no OOM/unexpected restart. Workload duration, exact sample counts/concurrency/warm-ups, topic/DB row counts, DLT/noop state, and retry/lease parameters are machine-checked.

Alerts also block on legacy/unknown schema, Flyway drift/partial catalog, unassigned listener, `IN_PROGRESS` beyond lease, happy-path DLT, DLT age >5 minutes/count >100, duplicate logical event/journey, stale projection overwrite, missing browser status, failed accessibility/overlap, or state mismatch across UI/topic/DB.

## Requirement Evidence Index

The final index maps every FR/NFR/DoD to exact command, timestamp, artifact, SHA-256, and verdict. Cross-checks require one booking/container/correlation/event chain across create, validation, pricing, confirmation, both topics, CMM, Booking projection, and visible UI. Dashboard summaries link to raw evidence rather than replacing it.

## Source Coverage

Monitoring verifies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U07 `business-logic-model.md`.
