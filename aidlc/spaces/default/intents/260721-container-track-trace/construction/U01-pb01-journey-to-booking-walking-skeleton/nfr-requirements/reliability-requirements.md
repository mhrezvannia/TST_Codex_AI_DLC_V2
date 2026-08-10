# Reliability Requirements - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

These requirements quantify U01 `business-logic-model.md` and
`business-rules.md`, retain `requirements.md` NFR-01/02/03/04/06/10, and use the
Spring/Kafka/PostgreSQL/Flyway/Compose topology in `technology-stack.md`.

## Atomicity and Durability

- Booking intake/reconciliation and accepted capture each commit their approved
  local state/audit/idempotency/outbox effects atomically; a failed transaction
  exposes no partial journey, movement, lifecycle, or pending event.
- At-least-once delivery is expected. CMM replay and Booking receipts make one
  logical result from duplicate transport without suppressing durable duplicate/
  stale evidence.
- Existing W1 rows survive ordered additive Flyway upgrade, service restart, and
  the exercised forward-repair path. Destructive volume reset is not evidence.
- For the accepted local transaction, committed-state loss target is zero during
  the exercised single-service restart scenario.

## Restart Recovery Target

Start CMM with the existing
`container-movement.outbox-relay.enabled=false` seam, accept one movement, and
verify its committed outbox row is exactly PENDING before any worker claim (no
worker/token and the initial fencing version). Restart CMM once with relay
enabled without deleting volumes. Time zero is the acceptance controller's
single monotonic timestamp when the restarted service first reports ready and
the scheduled relay is enabled; no alternative resume timestamp is used.

Claim changes the row to IN_PROGRESS with event ID, worker, unique token, and
incremented fencing version. PUBLISHED/RETRYABLE/permanent completion must
conditionally match event ID + IN_PROGRESS + worker + token + version. Booking
DB and UI APPLIED endpoints are polled every 500 ms and measured independently
from the same time zero; both must complete within 30 seconds. Publish-before-
lease-loss redelivery remains allowed, but durable receipts yield one logical
projection and no second journey advance.

An environmental failure may receive the single evidence-preserving retry
allowed by `requirements.md`; deterministic schema, migration, data, or logic
failure stays failed. No production uptime percentage, backup RPO/RTO, HA,
multi-AZ, or disaster-recovery commitment is asserted.

## Failure Isolation and Degradation

| Failure | Required behavior |
| --- | --- |
| Kafka unavailable | accepted local transaction remains pending/retryable; no false publication |
| Schema incompatible | permanent visible publication failure; no invalid publish |
| Booking unavailable | CMM remains committed; transport retries; no synchronous shortcut |
| Identity unavailable | fresh protected read/capture fails closed; no cached authority |
| Reference Data unavailable | U03 owns authorized last-known read/capture-disabled depth |
| CMM database unavailable | request fails with no partial accepted/rejected effects |

## Observability and Acceptance Evidence

Correlate broker event, CMM intake/capture/outbox/audit rows, relay attempt,
Booking receipt/projection, and both UI observations using stable correlation and
event/request identities. Capture relay attempt/state/worker/fence evidence,
duplicate/stale dispositions, dependency failures, and timing without secrets or
raw payloads. Pre/post `demo:guard`, isolated project identity, database hashes,
and service restart timestamps are mandatory evidence.
