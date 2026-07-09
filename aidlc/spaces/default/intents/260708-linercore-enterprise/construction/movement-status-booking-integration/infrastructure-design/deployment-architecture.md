# Deployment Architecture - movement-status-booking-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys the CMM-to-Booking status event seam.

## Runtime Topology

```text
[CMM Status Derivation]
        |
        v
[CMM Status Outbox] --> [Kafka containermovement.status]
                                   |
                                   v
                      [Booking Consumer + Dedup/Staleness]
                                   |
                                   v
                  [Booking Lifecycle + D&D Trigger Evidence]
```

Text fallback: CMM publishes derived movement status, Booking consumes it with dedupe and staleness checks, then updates booking lifecycle evidence and records D&D trigger inputs.

## Deployment Controls

| Concern | Design |
|---|---|
| CMM ownership | CMM derives status and publishes status evidence. |
| Booking ownership | Booking applies lifecycle updates and D&D trigger input evidence. |
| Schema | Avro/AsyncAPI/Schema Registry compatibility gates readiness. |
| Message pact | Producer and consumer fixtures prove status-event expectations. |
| Staleness | Booking quarantines or deterministically ignores stale/out-of-order events. |
| Boundary | Booking does not derive movement status; CMM does not decide D&D relevance or mutate Booking lifecycle. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports status derivation, publish/delivery, consume/check, lifecycle update, and end-to-end budgets. |
| `security-design.md` | Enforces producer/consumer identity, metadata, boundaries, database isolation, and audit. |
| `scalability-design.md` | Supports status event, duplicate, stale, update, and message-pact scale. |
| `reliability-design.md` | Implements recoverable publication, compatibility, message-pact, dedupe, staleness, lifecycle update, and failure handling. |
| `logical-components.md` | Maps to CmmStatusOutboxWriter, CmmStatusPublisher, MovementStatusSchemaAdapter, MovementStatusMessagePactVerifier, BookingMovementStatusConsumer, BookingStatusDeduplicationGuard, BookingStatusOrderingPolicy, BookingLifecycleUpdateService, StatusIntegrationEvidenceReporter, and StatusEventSecurityValidator. |
| `components.md` | Preserves CMM and Booking ownership boundaries. |
| `services.md` | Uses CMM-to-Booking Kafka/Avro/AsyncAPI/message-pact seam. |
| `business-logic-model.md` | Implements publish, consume, dedupe/staleness, lifecycle update, and D&D trigger input evidence workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design preserves CMM ownership of movement status and Booking ownership of lifecycle/D&D-trigger interpretation.
- Dedupe, staleness, quarantine, and message-pact evidence are explicit infrastructure concerns.
- Schema compatibility blocks readiness rather than allowing hidden event drift.
