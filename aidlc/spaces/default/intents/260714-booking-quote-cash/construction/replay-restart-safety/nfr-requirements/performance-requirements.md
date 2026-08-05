# Performance Requirements - U06 Replay and Restart Safety

## Recovery Budgets

- Booking and CMM shall become healthy and serve persisted detail/journey within 60 seconds after their dependencies are healthy following container restart.
- Expired Charge claim recovery completes within ten-second lease expiry plus one normal pricing attempt.
- Duplicate envelope handling and stale projection/revision handling shall complete p95 <=500 ms over 100 deliveries at concurrency 10, without business-row growth beyond receipts for distinct stale IDs.
- DLT replay of a corrected W1 record shall become applied/visible within the normal five-second round-trip budget after republish.

## Measurement

Capture monotonic restart/health/query/replay times, event/receipt/outbox counts, migration duration, pool/lag metrics, and all errors. Recovery evidence cannot use destructive reset or omit failed attempts.

## Source Coverage

Budgets quantify U06 `business-logic-model.md`, `business-rules.md`, and resilience NFRs in `requirements.md` on the Compose/Spring/Kafka/PostgreSQL `technology-stack.md`.
