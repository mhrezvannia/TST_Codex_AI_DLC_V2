# CI/CD Pipeline - U04 Confirm to CMM Journey

## Contract and Service Build

The pipeline validates root Avro/AsyncAPI/examples/catalog first and proves each Booking/CMM schema resource is byte-for-byte identical. It builds shared `platform-messaging` once, then Booking and CMM. Shared tests assert every producer property, idempotence/retry compatibility, default 2.5-second `Duration` wait, explicit-timeout compatibility, local noop allowed only when require-real is false, local noop rejected when require-real is true, and non-local noop rejected. Serde round-trip, mapper exact-field, registrar compatibility, outbox JDBC claim/lease, application transaction, and listener ack/error/DLT tests are also blocking.

Static checks reject alternate messaging infrastructure, sync Booking-to-CMM HTTP, browser transport access, flat legacy fields, string schema version, non-atomic claims, producer idempotence/retry conflicts, multiplicative application retries, auto-commit, ack-before-commit, and unrestricted event logging. Dependency/secret/static scans and changed-code coverage >=80 percent run online.

## Compose Journey and Failure Matrix

Preflight starts Kafka/SR, performs the allow-listed local subject retirement/canonical registration, creates source/DLT topics with exact partitions/retention, sets `MESSAGING_REQUIRE_REAL=true`, and starts real adapters. A negative live-profile test selects noop beans and must fail startup through the shared guard. Positive tests confirm real publisher/registrar classes, one Booking transaction/outbox, real broker record, one CMM receipt/journey/status outbox, and no CMM HTTP request. Failure cases stop broker, crash relay after claim/send, restart Booking/CMM, duplicate and reorder source records, inject transient DB/Reference errors, submit permanent malformed contracts, and replay authorized DLT records.

The pipeline verifies a 30-second claim lease, bounded retry timings, record ack after commit/DLT, stable event IDs, and no duplicate logical journey. PostgreSQL remains on host 55432 and volumes are retained. Both audit detector suites are blocking.

## Promotion and Rollback

Schema cutover is a one-way local precondition with exported legacy evidence. Unknown/non-local history blocks rather than deleting subjects. Application rollback is safe only while the canonical schema remains; incompatible rollback images are forbidden. Additive DB repair/dump restore handles persistence failure, and failed evidence gets a new run ID.

## Source Coverage

Pipeline enforces `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U04 `business-logic-model.md`.
