# Performance Design - movement-status-booking-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Performance covers CMM status publication through Booking consumption, deduplication/staleness checks, lifecycle update, and D&D trigger input evidence.

## Event Path Budgets

| Operation | Target | Design control |
|---|---|---|
| CMM status derivation to publish-ready | p95 <= 1 second. | Status snapshot/outbox generated from CMM-owned state. |
| Kafka publish/delivery to Booking consumer | p95 <= 2 seconds. | Local Kafka topic and consumer health evidence. |
| Booking consume/deduplicate/staleness check | p95 <= 1 second. | Dedup and ordering indexes by event/status identity and booking revision. |
| Booking lifecycle update | p95 <= 1 second. | Idempotent update against Booking-owned lifecycle state. |
| End-to-end status to Booking update | p95 <= 5 seconds. | Correlated trace from CMM status through Booking lifecycle evidence. |

## Execution Flow

CMM derives status and publishes `containermovement.status`. Booking consumes, validates schema/identity metadata, deduplicates, checks staleness/order, updates lifecycle where valid, and records D&D trigger input evidence.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements derivation, publish/delivery, consume/check, lifecycle update, and end-to-end targets. |
| `security-requirements.md` | Keeps producer/consumer identity, metadata, boundaries, database isolation, and audit in the path. |
| `scalability-requirements.md` | Supports status events, duplicate/stale cases, lifecycle updates, and message-pact fixtures. |
| `reliability-requirements.md` | Uses recoverable publication, compatibility, message-pact, deduplication, staleness, and idempotent updates. |
| `tech-stack-decisions.md` | Uses CMM producer, Booking consumer, Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, and Docker Compose. |
| `business-logic-model.md` | Implements status publication/consumption, deduplication, staleness, lifecycle update, and evidence workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design gives each step in the CMM-to-Booking path a measurable budget.
- Status and lifecycle ownership stay separated while keeping end-to-end evidence correlated.
- Staleness and deduplication are indexed, which is essential for the failure-volume baseline.
- Residual implementation risk is in exact ordering keys and lifecycle conflict handling.
