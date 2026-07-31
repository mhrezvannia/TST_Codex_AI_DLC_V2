# Architecture Review - U03 NFR Requirements - Iteration 1

## Verdict

**NOT-READY**

The quantified administration fixture, database-backed authority locking,
same-datasource commercial/activity/outbox transaction, fail-closed adapters,
legacy/W2 and Avro compatibility, stack fidelity, restart boundary, UI ownership,
and 8088 protection are aligned. Three precision blockers remain.

## Findings

### High - terminal-transition loser is not exact

The suspend-versus-expire race says `409 stale/lifecycle loser`, but wrong
lifecycle is 422 while concurrent/stale is 409. Bind every contested loser to
one deterministic HTTP status and machine code.

### High - relay gate can pass without recovery

`publish-confirmed or safely retryable` permits all 100 events to remain pending
after broker restoration. Require every row to publish-confirm within the bound,
then separately test the broker-ack/before-outbox-mark duplicate window with
stable event/dedupe identity and no duplicate commercial/activity state.

### Medium - resource telemetry is not a gate

Heap/GC/RSS/CPU are retained but lack blocking criteria. Define an exact bounded
comparison window and failure conditions for process/OOM, heap/RSS growth,
connection pool, deadlock, unbounded queries/history, and N+1 behavior without
inventing a production capacity claim.

## Iteration outcome

A second review is required after correction. This iteration remains
permanently NOT-READY.
