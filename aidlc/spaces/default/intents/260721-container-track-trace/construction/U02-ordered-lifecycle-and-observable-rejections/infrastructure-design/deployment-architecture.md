# Deployment Architecture - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Topology

This architecture implements U02 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
application `components.md`/`services.md`, and `business-logic-model.md`.
It retains portable Compose: CMM, Booking, Kafka, Schema Registry, their
service-owned PostgreSQL stores, Identity, Reference Data, shared edge, and CMM
pages. Retry seams are acceptance-only adapter configuration, not new services.

## Isolation

`scripts/wave-a-compose.mjs` owns isolated `linercore-wave-a`; one live stack
controller is permitted. `npm run demo:guard` protects port 8088 before/after.
Additive migrations and volumes are preserved; no cloud multi-region, merged
persistence, EDI/public API, fleet/depot/M&R, or W1 waiver relabeling occurs.

## Review Iteration 1

**Verdict: READY**

1. Portable topology and ownership are explicit: CMM and Booking retain
   service-owned PostgreSQL stores, Kafka/Schema Registry remain the transport
   and schema authority, and retry/fencing seams are acceptance-only adapter
   configuration. No shared persistence, cache, broker, or synchronous CMM
   query is introduced.
2. Monitoring and acceptance artifacts provide executable recovery evidence:
   controller-observed monotonic time zero, database-clock due predicates,
   500 ms polling, bounded 30-second CMM/Booking/UI convergence, and the
   Booking PROCESSING/RETRYABLE/APPLIED event+worker+token+version fence.
   The deterministic ten-delivery fixture records durable outcomes, immutable
   receipts, separate duplicate evidence, APPLIED/STALE/REJECTED counts,
   comparator/hash assertions, and DB/UI convergence.
3. CI/CD is additive and reversible (including Flyway upgrades); volumes are
   preserved. W2-02 merge and integration synchronization precede final visual
   acceptance, with `npm run demo:guard` before/after and one isolated
   `linercore-wave-a` Compose controller protecting port 8088.
4. Security boundaries require bounded payloads/identifiers, pagination,
   dependency timeouts, and redaction of secrets/raw payloads in 409, audit,
   and UI evidence. W1 remains explicitly BLOCKED/waived, and EDI/public DCSA
   APIs, fleet/depot/M&R, and shared-shell/package redesign remain out of scope.
