# Scalability Requirements - U04 Confirm to CMM Journey

## Partitioned Scale

- `booking.confirmed` uses `bookingId` key so all revisions for one Booking remain ordered while distinct bookings distribute across partitions.
- Stateless Booking relays and CMM listeners may scale horizontally; database logical uniqueness, receipts, and highest-revision guards preserve correctness.
- Local source/DLT topics use three partitions; listener concurrency is three, relay batch size 50, Hikari maximum 10, and Reference HTTP concurrency maximum ten per instance.
- W1 proves 100 unique journeys at concurrency 5 within ten minutes. Zero errors are allowed; source consumer lag must return to zero within 30 seconds after submissions and p95 pool wait remain <100 ms.

## Data Growth

Consumed receipts/outbox metadata are retained at least 30 days, audit at least 90 days, and DLT exactly seven days. Payload <=256 KiB, routing <=8, equipment <=20. DLT capacity is 10,000 records; age >5 minutes or count >100 fails local acceptance. Peak Java RSS <=768 MiB with no OOM/restart.

## Source Coverage

Capacity rules derive from U04 `business-logic-model.md`, `business-rules.md`, and `requirements.md`, retaining Kafka/Spring/PostgreSQL scale patterns in `technology-stack.md`.
