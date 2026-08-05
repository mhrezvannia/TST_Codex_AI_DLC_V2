# Reliability Design - W2-03 Charge Tariffs and Agreements

## Upstream Coverage

This aggregate design consumes every unit's `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It treats calculated charges as reconstructable monetary evidence under the W2-03 DoD.

## Consistency and Idempotency

- A successful quote persists the request hash, immutable authority references, itemised lines, total, currency, and correlation ID before returning success.
- Replaying the same idempotency key and body returns the stored terminal result. Reusing a key with a different body returns conflict.
- An expired in-progress claim can be taken over only with a fenced owner token; a late worker cannot overwrite the winner.
- Agreement approval and its rate-version bindings commit atomically. Approved versions are immutable; edits create a new draft version.
- A changed rate affects only quotes calculated after activation. Existing snapshots remain reconstructable from stored authority/version references.

## Failure Classification

| Condition | Outcome | Retry policy |
| --- | --- | --- |
| No matching trade lane/equipment rate | `MANUAL_PRICING_REQUIRED` / no-rate reason | No automatic retry until data changes |
| Ambiguous active authority | Explicit manual/error outcome with audit event | No blind retry |
| Validation or authorization failure | 4xx standard error | Never retry |
| Database unavailable or timeout | 5xx/transient failure | Booking applies bounded retry with jitter; do not label manual |
| Broker unavailable | Quote commits; outbox remains pending and alerts | Relay retries independently |

## Resilience Boundaries

Use shallow liveness and dependency-aware readiness. Bound database and reference-service calls with timeouts. Reference validation occurs on administrative writes; the pricing hot path uses already-validated stable IDs and does not depend on live reference-service availability. Use a separate outbox relay pool so broker failure cannot exhaust request threads.

## Recovery and Durability

For the canonical local Compose target, rely on committed PostgreSQL state in the configured volume and prove restart recovery. Do not claim protection from host or volume destruction without backup/WAL evidence. Migration acceptance includes existing-data upgrade, backfill, restart, and forward-repair or restore behavior.

## Verification

Run crash-after-claim, crash-before-completion, late-owner fencing, database restart, broker outage/recovery, rate-change/reprice, effective-boundary, duplicate request, and no-match scenarios. The W2-03 exit gate must observe the real UI-to-Booking journey plus both required audits.
