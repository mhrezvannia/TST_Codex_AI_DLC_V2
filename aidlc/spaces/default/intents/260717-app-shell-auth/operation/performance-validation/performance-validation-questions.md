# Performance Validation Questions - W2-01 App Shell and Auth

## Upstream Inputs

These questions consume per-unit `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and the operation `dashboards` artifact.

## Questions

### Q1. Which traffic shape should W2-01 validate?

A. Ten sequential warm local samples per timing seam; single-user proof only
B. Five concurrent authenticated users against the local stack
C. Production-like peak and burst load
X. Other (please specify)

[Answer]: A - Ten sequential warm local samples per timing seam; single-user proof only. **Timestamp:** 2026-07-19T19:07:44Z. **Mode:** guided.

### Q2. How should latency percentiles be judged?

A. Apply existing per-unit p95 limits; report p50 and maximum as observations, with no p99 gate from ten samples
B. Add new p95 and p99 limits stricter than the Construction requirements
C. Record timings only and apply no pass/fail limits
X. Other (please specify)

[Answer]: A - Apply existing per-unit p95 limits; report p50 and maximum as observations, with no p99 gate from ten samples. **Timestamp:** 2026-07-19T19:07:44Z. **Mode:** guided.

### Q3. What throughput claim is allowed?

A. No throughput acceptance target; record observed completion rate only
B. Require one complete Booking lifecycle per second
C. Require five simultaneous full Booking lifecycles without errors
X. Other (please specify)

[Answer]: A - No throughput acceptance target; record observed completion rate only. **Timestamp:** 2026-07-19T19:07:44Z. **Mode:** guided.

### Q4. Which bottlenecks should analysis cover?

A. Edge/shell, OIDC/session, Identity authorization, Booking/data/pricing, and telemetry blind spots
B. Frontend and Nginx only
C. Booking, Identity, Charge, and PostgreSQL only
X. Other (please specify)

[Answer]: A - Edge/shell, OIDC/session, Identity authorization, Booking/data/pricing, and telemetry blind spots. **Timestamp:** 2026-07-19T19:09:03Z. **Mode:** guided.

## Decision Check

The answer set must preserve the local/on-prem bounds in `performance-requirements`, avoid inventing concurrency or autoscaling from `scalability-requirements` and `scalability-design`, follow the timing seams in `performance-design`, and account for the missing live application targets recorded by `dashboards`.
