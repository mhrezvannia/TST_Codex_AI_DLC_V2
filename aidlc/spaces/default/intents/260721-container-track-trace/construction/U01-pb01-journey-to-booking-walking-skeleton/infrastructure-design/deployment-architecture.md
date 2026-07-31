# Deployment Architecture - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Portable Topology

This architecture implements U01 `performance-design.md`,
`security-design.md`, `scalability-design.md`, `reliability-design.md`,
`logical-components.md`, application `components.md`/`services.md`, and
`business-logic-model.md`. It retains the existing portable Compose topology:
Container Movement, Booking, Kafka, Schema Registry, two service-owned
PostgreSQL stores, Identity, Reference Data, shared edge, and the CMM app.

## Environments and Isolation

Local, CI, and isolated Wave A acceptance use the same container contracts and
ordered Flyway chains. `scripts/wave-a-compose.mjs` controls the isolated
`linercore-wave-a` project; only one live acceptance stack runs at once. The
manager demo on port 8088 is protected by `npm run demo:guard` before and after.
No new AWS resource, multi-region topology, shared database, or destructive
volume reset is introduced.

## Review Iteration 1

**Verdict: READY**

1. The portable Compose topology is preserved with explicit CMM/Booking
   service-owned PostgreSQL and Flyway boundaries; Kafka and Schema Registry
   remain the existing contract authority and no cross-database ownership is
   introduced.
2. Isolated `linercore-wave-a` acceptance is serialized and controlled by
   `scripts/wave-a-compose.mjs`; W2-02 integration synchronization is required
   before final visual acceptance, and `npm run demo:guard` protects port 8088
   before and after the live stack.
3. Promotion is additive and reversible (immutable image/config rollback,
   forward-compatible migrations, no volume reset); secrets remain injected and
   redacted from evidence.
4. Correlated, bounded monitoring and alert evidence covers relay/consumer,
   dependency, database, and UI timing without introducing cloud infrastructure
   or production SLO claims. Ownership remains CMM for journey/ledger/outbox/UI,
   Booking for receipts/projection, and platform for broker/network resources;
   W1 remains an explicit BLOCKED waiver.
