# Deployment Architecture - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys the event-driven path from Booking confirmation to CMM journey creation/reconciliation.

## Runtime Topology

```text
[Booking Confirmation Transaction]
        |
        v
[Booking Outbox] --> [Booking Event Publisher] --> [Kafka booking.confirmed]
                                                         |
                                                         v
                                         [CMM Consumer + Deduplication]
                                                         |
                                                         v
                                          [Journey Reconciliation]
```

Text fallback: Booking writes a confirmation outbox row during confirmation, publishes `booking.confirmed` to Kafka, and CMM consumes, deduplicates, and creates or reconciles the journey.

## Deployment Controls

| Concern | Design |
|---|---|
| Outbox | Booking confirmation and event row commit atomically. |
| Kafka | Topic and consumer group are deterministic and covered by local/CI evidence. |
| Schema | Avro/AsyncAPI/Schema Registry compatibility gates readiness. |
| Message pact | Producer and consumer fixtures prove event expectations. |
| CMM dedupe | Event id and booking revision prevent duplicate or stale journey creation. |
| Boundary | Integration does not derive movement status or calculate pricing/D&D. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports commit, publish, delivery, consume/reconcile, and end-to-end budgets. |
| `security-design.md` | Enforces producer/consumer identity, event metadata, schema context, audit, and boundaries. |
| `scalability-design.md` | Supports event, revision, duplicate/replay, journey, and message-pact scale. |
| `reliability-design.md` | Implements outbox, compatibility, message-pact, dedupe, reconciliation, retry visibility, and failure handling. |
| `logical-components.md` | Maps to BookingConfirmationOutboxWriter, BookingEventPublisher, BookingConfirmedSchemaAdapter, BookingConfirmedMessagePactVerifier, CmmBookingConfirmedConsumer, CmmEventDeduplicationGuard, JourneyReconciliationService, IntegrationEvidenceReporter, and EventSecurityContextValidator. |
| `components.md` | Preserves Booking and CMM ownership boundaries. |
| `services.md` | Uses Booking-to-CMM Kafka/Avro/AsyncAPI/message-pact seam. |
| `business-logic-model.md` | Implements confirmation, outbox publish, CMM consume, deduplicate, reconcile, and journey creation workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design uses outbox-backed Kafka integration rather than synchronous CMM calls or shared database triggers.
- Booking owns confirmation facts and event production; CMM owns consumption, dedupe, and journey reconciliation.
- Schema Registry and message-pact evidence are explicit readiness gates.
