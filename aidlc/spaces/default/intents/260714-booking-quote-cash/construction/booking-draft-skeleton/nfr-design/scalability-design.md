# Scalability Design - U01 Booking Draft Skeleton

## Scaling Pattern

Booking API/BFF remain stateless; nginx may distribute requests across instances. PostgreSQL uniqueness and row locking arbitrate booking number/idempotency, so no sticky session/process cache is required. Hikari max 10 and bounded servlet/BFF concurrency protect the single database.

Schema/indexes support 10,000-row acceptance: booking number unique; customer/status and updated/id ordering indexes; audit/outbox indexes. Limits (8 legs, 20 equipment, 100 page, 256 KiB) are enforced in DTO/domain before allocation. Receipts/outbox metadata retain >=30 days and audit >=90 days.

## Capacity Verification

Docker stats, Micrometer, query plans, pool metrics, and exact row counts prove five-minute concurrency-10 load with zero errors/duplicates, pool wait p95 <100 ms, connections <=10, and RSS <=768 MiB. Crossing a threshold returns controlled unavailable/429 rather than adding threads/connections.

## Source Coverage

Design realizes `scalability-requirements.md` with constraints from `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U01 `business-logic-model.md`.
