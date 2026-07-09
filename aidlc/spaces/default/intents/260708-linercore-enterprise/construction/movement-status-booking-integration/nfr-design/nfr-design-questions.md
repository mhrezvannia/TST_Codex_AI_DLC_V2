# NFR Design Questions - movement-status-booking-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define status-event latency, producer/consumer identity, event metadata, scale baseline, recoverable publication, compatibility, message-pact, deduplication, staleness, idempotent Booking updates, and Kafka/Avro stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Recoverable CMM publication, compatibility gates, message-pact fixtures, Booking deduplication, staleness/quarantine, and idempotent lifecycle updates. |
| Scalability | First release supports 10,000 status events, 2,000 duplicate cases, 2,000 stale/out-of-order cases, 5,000 lifecycle updates, and message-pact evidence. |
| Performance | CMM status publish-ready p95 <= 1 second, Kafka delivery p95 <= 2 seconds, Booking consume/check p95 <= 1 second, lifecycle update p95 <= 1 second. |
| Security | CMM producer identity, Booking consumer identity, ordering metadata, schema version, audit, and no shared databases. |
| Logical boundaries | CMM derives and publishes status; Booking consumes status and decides lifecycle/D&D trigger input evidence. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact stale-event quarantine policy and ordering key details are implementation choices constrained by this design.
