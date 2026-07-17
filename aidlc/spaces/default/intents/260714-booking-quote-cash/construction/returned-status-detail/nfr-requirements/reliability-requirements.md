# Reliability Requirements - U05 Returned Status Detail

## Projection Correctness

- Receipt and guarded projection upsert commit atomically; injected failure leaves neither.
- Duplicate envelope is no-op; distinct stale fact is recorded but cannot replace a newer tuple.
- Ordering is exact `(occurredDateTime, classifierRank, receivedDateTime, eventId)` with `PLN=1`, `EST=2`, `ACT=3` only for equal occurred time.
- Persisted projection survives Booking/CMM/Kafka restart and remains readable during downstream outage.

## Degradation and Recovery

Transient DB failure uses 250 ms/1 s retries then DLT; permanent contract/invariant failure goes direct. Confirmed-without-projection is explicit pending; 30-second observation exhaustion is delayed plus Retry. Failed transactions leave zero partial receipt/projection effects, and committed rows survive service restart within the existing volume. Host/volume loss has no zero-RPO claim; restart recovery target is <=60 seconds after health returns.

## Source Coverage

Scenarios prove U05 `business-logic-model.md`, `business-rules.md`, and reliability/UI clauses in `requirements.md` on the stack in `technology-stack.md`.
