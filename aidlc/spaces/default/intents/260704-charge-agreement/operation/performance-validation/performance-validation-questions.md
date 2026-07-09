# Performance Validation Questions - Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and `dashboards`.

## Questions and Answers

### Q1. What are the expected traffic patterns?

A. Local smoke only for U01; no sustained load profile yet
B. Production steady-state traffic
C. Peak seasonal load
D. Unknown
X. Other (please specify)

[Answer]: A

### Q2. What are the target latency percentiles?

A. Backend health and module-info under 200 ms locally; dashboard smoke threshold under 2 seconds
B. P99 under 10 ms globally
C. No latency target
D. Unknown
X. Other (please specify)

[Answer]: A

### Q3. What throughput must the system sustain?

A. No throughput requirement for U01 because it has no data workload
B. 1000 requests per second
C. 10000 requests per second
D. Unknown
X. Other (please specify)

[Answer]: A

### Q4. Where are the likely bottlenecks?

A. Local startup, port conflicts, and proxy routing
B. Database contention
C. Kafka throughput
D. Cross-region latency
X. Other (please specify)

[Answer]: A

## Decisions

Performance validation for B01/U01 is limited to local smoke latency and statelessness checks. Full load testing is deferred until API, persistence, and realistic data flows exist.

