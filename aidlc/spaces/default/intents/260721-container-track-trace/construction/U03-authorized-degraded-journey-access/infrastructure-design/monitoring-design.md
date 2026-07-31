# Monitoring Design - U03 Authorized Degraded Journey Access

## Inputs and Signals

This design implements U03 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Correlated redacted evidence records subject/resource/action decision, lookup
ordering, dependency health, freshness/checked time, safe error code,
captureEnabled, denial audit, zero business-row assertions, API/UI timings, and
the exact ten-request matrix. Bounded alerts cover Identity/Reference Data
timeouts, stale freshness, failed Retry convergence, and unauthorized-write
regressions; no global production SLO is inferred.

The acceptance harness runs the exact ten-request matrix with a repository
lookup probe before read ALLOW and snapshots attempt/request/rejection/movement/
history/version/lifecycle/outbox and Booking rows before/after each request.
Real DENY must add exactly one denial audit and zero business rows; Identity and
Reference Data outages add zero CMM rows and only correlated safe logs/metrics.
