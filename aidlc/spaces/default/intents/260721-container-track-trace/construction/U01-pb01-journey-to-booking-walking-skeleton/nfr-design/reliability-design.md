# Reliability Design - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Transaction Boundaries

This design implements `reliability-requirements.md`, `business-logic-model.md`,
and `tech-stack-decisions.md`. Intake and accepted capture each use one local
Spring transaction for their service-owned receipt/request, domain state, audit,
and outbox effects. CMM and Booking migrations remain additive and service-
owned; repair is idempotent and never uses cross-database SQL.

## Fenced Relay and Recovery

The existing outbox relay claims PENDING/RETRYABLE rows as IN_PROGRESS with
event ID, worker, token, and incremented version. Completion conditionally
matches every fence field; expired leases advance the version so old workers
cannot complete. A committed PENDING fixture is used for restart proof,
at-least-once publication is allowed, and Booking receipts yield one logical
projection. Kafka/Booking failure remains retryable; schema incompatibility is
permanent and visible.

## Health and Degradation

Dependency timeouts fail closed. CMM exposes local truth when Booking is delayed;
Booking derives pending/retry/degraded from its own receipt/health evidence and
never synchronously queries CMM. Independent DB/UI APPLIED polling uses one
controller monotonic start and 500 ms cadence.

