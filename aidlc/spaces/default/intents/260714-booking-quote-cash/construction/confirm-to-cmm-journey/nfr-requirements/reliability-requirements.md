# Reliability Requirements - U04 Confirm to CMM Journey

## Atomic Delivery Effects

- Booking status/revision, confirmation receipt, audit, and outbox commit atomically; CMM receipt, journey/highest revision, audit, and status outbox commit atomically.
- Deterministic UUIDv5 plus logical unique constraints prevent duplicate events/status facts; envelope receipts prevent duplicate business effects.
- Duplicate envelope is no-op; distinct stale revision is recorded and ignored; valid higher same-container revision reconciles once.
- Booking remains confirmed while relay retries; no HTTP fallback or distributed rollback exists.

## Retry, DLT, and Recovery

Transient failures receive initial delivery plus 250 ms and 1 s retries, then DLT; permanent contract/invariant failures go directly to DLT. Failed transactions commit no receipt/partial effect. Within existing PostgreSQL/Kafka volumes, committed state survives service restart and claims resume; host/volume loss has no zero-RPO claim. Local restart recovery target is <=60 seconds after dependencies are healthy.

## Source Coverage

Scenarios prove U04 `business-logic-model.md`, `business-rules.md`, and NFRs in `requirements.md` with Spring transactions/Kafka/PostgreSQL from `technology-stack.md`.
