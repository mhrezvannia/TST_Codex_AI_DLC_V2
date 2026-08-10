# Reliability Requirements - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

These requirements specialize U02 `business-logic-model.md` and
`business-rules.md`, retain `requirements.md` atomicity/ordering/propagation
constraints, and use the Spring/Kafka/PostgreSQL runtime in
`technology-stack.md`.

## Transaction and Idempotency Reliability

- Each accepted LOAD/DISC/GTIN transaction atomically completes the immutable
  request disposition, attempt, accepted movement, version/lifecycle, audit, and
  one outbox row.
- Duplicate occurrence with a new key commits new rejected disposition +
  attempt + rejection + audit only. Existing same/conflicting key or concurrent
  loser commits attempt + rejection + audit only; original disposition remains
  immutable. Wrong next commits its rejected disposition/attempt/rejection/audit
  set only.
- Boundary/reference validation and Reference Data outage happen before claim
  and write no attempt/request/rejection/domain/outbox database row.
- Booking inserts/locks one receipt before classification. A redelivered event
  ID leaves the original receipt and its APPLIED/STALE/REJECTED disposition
  unchanged, returns DUPLICATE for that delivery, and appends separate duplicate
  delivery/audit evidence only. Equal/lower positive unique events are STALE,
  strictly higher positive is APPLIED, and invalid/unassigned is REJECTED.

## Fenced Relay Recovery

Acceptance configuration overrides the retry backoff so a run-scoped
event-ID-targeted publisher seam fails exactly the first matching send,
auto-disarms, and persists RETRYABLE with same-service-clock `lastAttemptAt` and
`nextAttemptAt <= lastAttemptAt+5s`.
Production backoff remains configuration-owned and unspecified. A due claim
records event ID, IN_PROGRESS, worker, unique token, incremented version, claim
time, and attempt count. PUBLISHED/RETRYABLE/FAILED_PERMANENT completion must
match event ID + IN_PROGRESS + worker + token + claim version.

Expired-lease recovery additionally matches the expired worker/token/version and
lease predicate before incrementing version into RETRYABLE. The old worker
cannot complete. Publish-before-lease-loss may redeliver; Booking receipts still
yield one logical projection. Recovery timing uses the later of observed seam
release plus broker readiness or observed row due as the single controller-
monotonic time zero, polls every 500 ms, and independently requires CMM
PUBLISHED, Booking DB APPLIED, and Booking UI APPLIED within 30 seconds.

Booking consumer retry is a separate event-ID-targeted fail-once fixture. It
commits receipt PROCESSING then RETRYABLE with attempt/next-at evidence and a
Booking-owned degraded consumer-health record without updating the projection.
After the seam releases and a database-clock predicate says the receipt is due,
the retry conditionally claims RETRYABLE into PROCESSING with worker ID, unique
token, and incremented claim version. Completion to APPLIED/RETRYABLE/
FAILED_PERMANENT must match event ID + PROCESSING + worker + token + claim
version; only APPLIED updates the projection and restores consumer health. DB
and UI endpoints must each converge within 30 seconds. It never
queries CMM and cannot be inferred from a pre-broker publisher failure.

## Degradation and Failure Visibility

Serialization/schema incompatibility becomes FAILED_PERMANENT and cannot be
shown as published. Kafka outage leaves accepted local truth pending/retryable.
Booking outage does not roll back CMM and cannot trigger a synchronous query.
Consumer retry/degraded state derives from Booking-owned receipt processing and
health evidence. Deterministic failures remain failed; only the approved one
environmental evidence retry is permitted.

## Evidence and Non-Claims

Evidence correlates capture response, request/attempt/rejection/movement/snapshot
rows, outbox state/fence, broker record, Booking receipt/projection, and UI state.
No production uptime, RPO/RTO, backup, HA, DR, or fixed retry schedule is claimed.
