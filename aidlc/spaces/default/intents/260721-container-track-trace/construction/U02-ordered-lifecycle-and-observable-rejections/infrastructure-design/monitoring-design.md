# Monitoring Design - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Signals

This design implements U02 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Correlated redacted logs/metrics/traces show rejection code, request deltas,
outbox event/worker/token/version, seam armed/disarmed state, due/readiness
times, Kafka partition/offset, Booking receipt/duplicate evidence/disposition,
consumer health, projection hash, and independent DB/UI convergence. Bounded
alerts cover retryable/permanent outbox growth, stale fences, consumer retry/
degraded health, and failed ten-delivery evidence; no production throughput SLO
is created.

