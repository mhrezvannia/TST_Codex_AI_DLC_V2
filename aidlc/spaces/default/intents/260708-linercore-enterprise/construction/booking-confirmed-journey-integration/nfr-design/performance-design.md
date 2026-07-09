# Performance Design - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Performance covers Booking confirmation outbox publish through CMM consumption, deduplication, revision reconciliation, and journey creation/update.

## Event Path Budgets

| Operation | Target | Design control |
|---|---|---|
| Confirmation commit to outbox entry | p95 <= 200 ms inside Booking transaction. | Append compact outbox row with confirmation state in one transaction. |
| Outbox publish to Kafka | p95 <= 2 seconds after eligible item. | Claim/lease publisher with bounded poll interval and batch size. |
| Kafka delivery to CMM consumer | p95 <= 1 second in local profile. | Local Kafka topic and consumer group health checks. |
| CMM consume/deduplicate/reconcile/create journey | p95 <= 2 seconds. | Deduplication index by event id and booking revision, plus targeted journey lookup. |
| End-to-end confirmation to journey ready | p95 <= 5 seconds. | Trace correlation across outbox, Kafka, CMM consumer, and journey state. |

## Execution Flow

Booking commits confirmation state and outbox evidence. The publisher emits `booking.confirmed` to Kafka using Avro/Schema Registry. CMM consumes the event, validates schema and identity metadata, deduplicates by event and revision, reconciles the journey, and records readiness evidence.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements commit, publish, delivery, consume/reconcile, and end-to-end latency targets. |
| `security-requirements.md` | Keeps producer/consumer identity, metadata, schema auth context, audit, and boundary controls in the event path. |
| `scalability-requirements.md` | Supports event, revision, duplicate/replay, journey, and message-pact scale. |
| `reliability-requirements.md` | Uses outbox, compatibility, message-pact, deduplication, reconciliation, and retry visibility. |
| `tech-stack-decisions.md` | Uses Booking producer, CMM consumer, Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, and Docker Compose. |
| `business-logic-model.md` | Implements Booking confirmation, outbox publish, CMM consume, deduplicate, reconcile, and journey creation workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The event path has measurable budgets from transaction commit through journey readiness.
- Booking and CMM responsibilities remain separated by the Kafka contract and service-owned persistence.
- End-to-end tracing is explicit, which makes delayed readiness diagnosable.
- Residual implementation risk is in outbox polling/claiming and consumer reconciliation tuning.
