# Reliability Requirements - U06 Replay and Restart Safety

## Required Invariants

- Duplicate/concurrent pricing leaves one terminal result/manual case; crashed claims recover by fenced takeover.
- Concurrent/replayed Confirm leaves one revision/logical outbox event.
- Duplicate/stale Booking confirmation leaves one highest-revision CMM journey and one status fact per applied revision.
- Duplicate/out-of-order status leaves one latest lexicographically ordered Booking projection.
- Injected failures prove local state/outbox/receipt atomic rollback at every transaction boundary.

## Migration and Restart

V1 data is backed up/checksummed, baselined correctly, upgraded additively, and survives two Booking/CMM restarts with unchanged IDs/counts/history/checksums. Unknown history blocks startup. Failed transactions leave zero partial effects; committed state survives service restart within existing volumes. Host/volume loss restore RPO is the latest captured dump; local restart RTO <=60 seconds. Restore/forward repair is proven on disposable copy; destructive reset is forbidden.

Failed/partial runs remain indexed. Health distinguishes process, DB/migration, Kafka/registry, and listener/relay readiness.

## Source Coverage

Scenarios directly prove U06 `business-logic-model.md`, `business-rules.md`, and FR-W1-012/NFRs in `requirements.md` on `technology-stack.md`.
