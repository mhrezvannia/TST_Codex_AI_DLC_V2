# NFR Design Questions - U01 PB-01 Journey-to-Booking Walking Skeleton

U01's approved NFR requirements already fix the local latency, restart-fence,
authorization, additive-migration, and isolated-Compose boundaries. These
questions select concrete patterns without adding production SLOs or new
infrastructure.

## Q1. Retry and resilience boundary

Which resilience pattern should the U01 design use for Kafka/Reference Data
dependency failures?

- A. Keep domain writes transactional and local; use the existing fenced outbox relay with bounded retry, explicit permanent-failure mapping, and fail-closed dependency timeouts. (recommended)
- B. Add a synchronous cross-service transaction for CMM, Kafka, Booking, and Reference Data.
- C. Queue capture requests in a new cache/work queue during outages.
- X. Other (please specify)

[Answer]: Fenced outbox + fail-closed (Recommended)

## Q2. Read performance pattern

Which read optimization should support the bounded list/detail targets?

- A. Use indexed service-owned read queries with bounded pagination and existing connection pools; do not add a cache or CDN. (recommended)
- B. Add a shared distributed cache and invalidate it on every movement.
- C. Use unbounded full-table reads for the demo path.
- X. Other (please specify)

[Answer]: Indexed bounded queries (Recommended)

## Q3. Logical failure domains

How should U01 isolate failures while preserving the broker-to-Booking proof?

- A. Keep CMM, Booking, Kafka, Reference Data, and the UI as explicit adapter/service boundaries; only committed CMM outbox rows cross Kafka, and Booking never synchronously queries CMM. (recommended)
- B. Collapse CMM and Booking into one shared persistence boundary.
- C. Introduce a new orchestration service between CMM and Booking.
- X. Other (please specify)

[Answer]: Explicit service adapters (Recommended)
