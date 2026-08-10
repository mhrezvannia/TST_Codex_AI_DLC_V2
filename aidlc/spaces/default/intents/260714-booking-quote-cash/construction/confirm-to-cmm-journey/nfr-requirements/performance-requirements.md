# Performance Requirements - U04 Confirm to CMM Journey

## Latency Budgets

- Warmed Booking Confirm API shall commit and respond within p95 <=500 ms and p99 <=1 s without waiting for Kafka/CMM.
- From successful confirm response to committed CMM journey plus pending status outbox shall meet p95 <=2 s under the fixed round-trip workload (10 warm-up, 100 measured journeys, concurrency 5).
- Booking relay publish lag, Kafka consume lag, Reference Data route validation, and CMM transaction latency are measured separately; every measured error fails.
- Avro schema lookup/registration is cached by approved shared components after compatibility preflight, not repeated as unbounded work per event.

## Throughput and Resources

Listener/relay batches and concurrency are bounded by topic partitions and database pools. Payload arrays/record size are bounded; W1 live records contain one assignment. Capture raw monotonic timings, topic coordinates, DB commit times, attempts, and lag.

## Source Coverage

Budgets decompose `requirements.md` through U04 `business-logic-model.md` and `business-rules.md` on Kafka/Avro/Spring/PostgreSQL from `technology-stack.md`.
