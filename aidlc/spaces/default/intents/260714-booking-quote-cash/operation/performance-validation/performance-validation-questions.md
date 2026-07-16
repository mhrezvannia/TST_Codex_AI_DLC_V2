# Performance Validation Questions - W1-01

## Answers

### Q1. What traffic patterns must W1 validate?

A. Charge pricing: 100 warm-up plus 1,000 measured requests at concurrency 10
B. Booking/CMM round trip: 10 warm-up plus 100 measured journeys at concurrency 5
C. Both workloads with retained errors and raw samples
D. Only direct service health checks
E. Only unit tests
X. Other (please specify)

[Answer]: C

### Q2. What latency percentiles are blocking?

A. Pricing nearest-rank p99 <=800 ms and confirm-to-visible-status nearest-rank p95 <=5 seconds
B. Mean latency only
C. p50 only
D. Browser load time only
E. No percentile targets
X. Other (please specify)

[Answer]: A

### Q3. What throughput and scalability gates apply?

A. Pricing completes within five minutes; journey completes within ten minutes; lag returns to zero within 30 seconds; no pool exhaustion, DLT, OOM, or unexpected restart
B. Throughput is not measured
C. Only CPU is measured
D. Only Kafka lag is measured
E. Only UI polling is measured
X. Other (please specify)

[Answer]: A

### Q4. What is the current executable status?

A. Dry-run planning passes, but real performance execution is blocked until full Compose starts and the live manifest can progress past `compose-start`
B. Performance passed through direct service probes
C. Performance passed without running workloads
D. Performance is out of scope
E. Performance should be inferred from unit tests
X. Other (please specify)

[Answer]: A

### Q5. Where are likely bottlenecks?

A. Docker image/runtime readiness, nginx user path, Booking/CMM relay lag, Charge/reference dependency latency, Hikari pool wait, Kafka/Schema Registry errors
B. Only frontend rendering
C. Only database storage
D. Only CPU
E. Unknown and not worth tracking
X. Other (please specify)

[Answer]: A

## Source Coverage

This question set consumes `performance-requirements.md`, `scalability-requirements.md`, `performance-design.md`, `scalability-design.md`, and `dashboards.md`. The answers reflect the current blocked live run rather than inventing performance results.
