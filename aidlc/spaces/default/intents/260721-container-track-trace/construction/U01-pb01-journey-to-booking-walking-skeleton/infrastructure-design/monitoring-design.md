# Monitoring Design - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Correlated Evidence

This design implements U01 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

## Signals and Alerts

Structured service logs and existing metrics/traces carry correlation ID,
booking/container/event/request identity, outbox state/fence, Kafka partition/
offset, Booking receipt/disposition, and DB/UI observation times without secrets
or raw payloads. Dashboards show journey intake outcomes, accepted/rejected
captures, relay lag/retry/permanent failure, consumer health, projection
dispositions, and p95/max/30-second evidence. Bounded alerts cover retryable or
permanent outbox growth, consumer degradation, dependency timeout, and failed
acceptance thresholds; no production SLO is inferred.

## Acceptance and Incident Evidence

`npm run demo:guard` pre/post, isolated project identity, service readiness,
database hashes, and controller monotonic timings are captured. Alert/runbook
actions are retry, inspect correlated owner, or preserve evidence; no synchronous
Booking-to-CMM shortcut is permitted.

