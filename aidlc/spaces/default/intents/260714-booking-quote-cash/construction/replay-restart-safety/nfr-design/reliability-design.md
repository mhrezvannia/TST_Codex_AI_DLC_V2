# Reliability Design - U06 Replay and Restart Safety

## Fault Matrix

JUnit transaction hooks fail after each provisional write and assert full rollback. Pricing clock/owner hooks prove live lease, expired CAS and stale completion. Kafka integration/live scripts publish duplicate/stale/out-of-order/permanent records, inspect DLT, correct/replay, and restart Booking/CMM sequentially.

Migration harness captures dump/schema/count/hash, starts Flyway baseline/V2, verifies two restarts, and tests restore/forward repair on disposable copy. State evidence snapshots compare pricing, confirmation/outbox, journey/status outbox, receipts/projection before/after. Existing-volume durability is claimed; host loss RPO is dump time.

## Source Coverage

Design implements `reliability-requirements.md` with `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U06 `business-logic-model.md`.
