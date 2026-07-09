# Performance Design - container-movement-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

CMM performance covers journey creation, expected movement derivation, movement capture, DCSA-aligned validation, status derivation, and movement history.

## Operation Budgets

| Operation | Target | Design control |
|---|---|---|
| Journey query/status query | p95 <= 300 ms. | Materialized journey and status snapshot tables. |
| Movement capture and validation | p95 <= 500 ms. | Validate shape, identity, idempotency, DCSA fields, and persist movement fact in one bounded transaction. |
| Expected movement derivation | p95 <= 1 second per booking/journey. | Derive once from booking confirmation/revision and persist expected movements. |
| Status derivation | p95 <= 1 second after accepted movement event. | Incremental derivation from new fact and current snapshot, not full history replay by default. |
| Movement history query | p95 <= 500 ms. | Paginated history by journey, equipment, event type, location, status, and time. |

## Throughput Design

| Scenario | Target | Design |
|---|---|---|
| Movement capture | 1,000 events/hour. | Stateless API workers and indexed movement fact writes. |
| Status publication | 1,000 snapshots/hour. | Recoverable status outbox or equivalent publication evidence. |
| Event consumption | 1,000 booking confirmation/revision events/hour. | Idempotent consumer with booking revision and event identity indexes. |

## Materialization Strategy

Movement facts are durable source evidence. Current journey status is a materialized snapshot derived from movement facts and booking revision context. Queries use snapshots for speed and history tables for drill-down.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements journey/status query, movement capture, expected movement derivation, status derivation, history, and throughput targets. |
| `security-requirements.md` | Keeps auth, capability, event identity, audit, and database boundaries in the paths. |
| `scalability-requirements.md` | Uses materialized snapshots and paginated history for journey, movement, status, duplicate, and user scale. |
| `reliability-requirements.md` | Uses deduplication, ordering, idempotency, and recoverable publication. |
| `tech-stack-decisions.md` | Uses `container-movement-service`, Java/Spring, PostgreSQL, OpenAPI, Kafka/Avro/AsyncAPI/Schema Registry, message-pact, and Keycloak/JWT. |
| `business-logic-model.md` | Implements journey, movement capture, validation, status derivation, publication, and history workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design maps CMM latency and throughput targets to materialized status, indexed history, and incremental derivation controls.
- Movement facts remain durable source evidence, reducing risk from out-of-order or late status changes.
- Performance choices preserve CMM ownership and avoid Booking/Charge database shortcuts.
- Residual implementation risk is in ordering precedence and index tuning for high-volume movement history.
