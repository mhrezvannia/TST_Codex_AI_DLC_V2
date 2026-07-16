# Performance Design - U03 Agreement Pricing

## Critical Path

Booking builds/hash-validates DTO once, then JDK HTTP client calls Charge. Charge claim is indexed unique insert/CAS; agreement query uses customer/status/validity/lane indexes; calculation streams <=100 terms using `BigDecimal`; fenced completion writes one terminal snapshot. No DB transaction spans HTTP/calculation and no result is recomputed on replay.

Resilience4j timeout is 2 s, retry max 1 for timeout/503, breaker count window 5 failures and 30 s open/one half-open probe; bulkhead concurrency ten. Micrometer times client/claim/query/calculate/complete and feeds the fixed 100/1000 p99 harness.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U03 `business-logic-model.md`.
