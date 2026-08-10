# Scalability Requirements - U06 Replay and Restart Safety

## Replay and Duplicate Load

- A burst of 100 duplicate/stale deliveries at concurrency 10 must finish within two minutes, produce zero duplicate business effects, and return source lag to zero within 30 seconds.
- Receipt/outbox/claim uniqueness is database-backed across horizontally scaled instances; no process-local recovery authority exists.
- DLT capacity is at least 10,000 W1-sized records with alerts/failures when non-empty age exceeds five minutes or count exceeds 100 in local acceptance.
- Restart uses three partitions/listener concurrency three, relay batch 50, Hikari maximum 10, and <=256 KiB records; lag drains to zero within 30 seconds after healthy restart.

## Data Retention

Receipts/outbox metadata remain at least 30 days, audit at least 90, DLT exactly seven, and migration history permanent. Pass requires p95 pool wait <100 ms, peak Java RSS <=768 MiB, no OOM/restart, and expected business-key counts exactly unchanged.

## Source Coverage

Capacity rules derive from U06 `business-logic-model.md`, `business-rules.md`, and `requirements.md`, preserving Kafka/PostgreSQL scale patterns in `technology-stack.md`.
