# Scalability Requirements - U05 Returned Status Detail

## Partition and Projection Scale

- Topic key `bookingRef:containerRef` preserves per-container order while distributing distinct containers across partitions.
- Source/DLT topics have three partitions and listener concurrency three; one guarded PostgreSQL upsert resolves concurrent/out-of-order candidates without process locks.
- Detail reads remain Booking-local and indexed by booking/container; no fan-out to CMM or Kafka occurs per browser poll.
- Polling is one request/second per active pending detail, bounded to 30 and paused when hidden; BFF/database pools enforce backpressure.

## Data Growth and Signals

Receipts/outbox metadata are retained at least 30 days, audit at least 90, and DLT exactly seven; projection holds one row per booking/container. The 100-journey/concurrency-5 run finishes within ten minutes, source lag returns to zero within 30 seconds, pool wait p95 <100 ms, Hikari connections <=10, active pollers <=100, and peak RSS <=768 MiB without OOM/restart.

## Source Coverage

Capacity rules derive from U05 `business-logic-model.md`, `business-rules.md`, and `requirements.md`, using Kafka/Spring/PostgreSQL/Next.js from `technology-stack.md`.
