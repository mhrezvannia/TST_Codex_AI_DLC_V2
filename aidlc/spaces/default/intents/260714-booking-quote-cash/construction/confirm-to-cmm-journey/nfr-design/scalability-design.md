# Scalability Design - U04 Confirm to CMM Journey

## Partition and Pool Layout

`booking.confirmed` and DLT have three partitions; key Booking ID. Listener concurrency3, `max.poll.records=50`, relay batch50/fixed delay250ms/claim lease30s, Hikari10, outbound Reference cap10, payload256KiB, route8/equipment20. Stateless instances use consumer group balancing and atomic `SKIP LOCKED` relay claims; DB receipt/highest-revision/logical outbox constraints remain final authority.

Retention: receipts/outbox >=30d, audit >=90d, DLT 7d. Metrics/gates enforce 100 journeys <=10m, zero errors, lag zero <=30s, pool wait/RSS limits, DLT capacity/age/count. Scaling beyond three partitions requires evidence, not config drift.

## Source Coverage

Design realizes `scalability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U04 `business-logic-model.md`.
