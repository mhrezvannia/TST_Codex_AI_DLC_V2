# Scalability Requirements - U01 Booking Draft Skeleton

## Capacity Baseline

- Stateless Booking HTTP instances may scale horizontally against one authoritative Booking PostgreSQL database; correctness relies on database uniqueness/locking, not process memory.
- W1 acceptance uses 10,000 persisted bookings, 100 list/detail/create operations at concurrency 10, and a five-minute maximum load phase; zero errors/duplicates and existing latency budgets are required.
- List page size is bounded at 100 and uses cursor-compatible deterministic `(updatedAt, bookingId)` ordering; unbounded scans/responses are forbidden.
- API limits are eight routing legs, 20 equipment lines, page size 100, and request/response body 256 KiB. The W1 fixture remains one leg/assignment.
- Each Java service uses Hikari minimum 2/maximum 10 connections and 2 s connection timeout; peak container RSS must remain <=768 MiB with no OOM/restart.

## Growth and Backpressure

Connection pools, servlet threads, and BFF concurrency are bounded so database saturation returns controlled unavailable responses instead of queue growth. UI search is debounced and aborts stale requests. Receipts/outbox terminal metadata are retained at least 30 days and audit at least 90 days; W1 does not implement purge. Tests report pool wait (p95 <100 ms), query latency, CPU, memory, and connections (never >10/service).

## Source Coverage

Capacity rules derive from U01 `business-logic-model.md`, `business-rules.md`, and `requirements.md`, preserving stateless Spring/Next.js and PostgreSQL ownership in `technology-stack.md`.
