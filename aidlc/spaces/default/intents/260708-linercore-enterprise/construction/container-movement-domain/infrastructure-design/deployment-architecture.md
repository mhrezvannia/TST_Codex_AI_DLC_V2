# Deployment Architecture - container-movement-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`container-movement-domain` deploys the CMM Service responsible for journeys, expected movements, movement capture, DCSA-aligned validation, ordering/deduplication, status derivation, movement history, status snapshots, and status publication.

## Deployment Model

| Environment | Deployment shape |
|---|---|
| Local `core` | PostgreSQL, Kafka, Schema Registry, Keycloak/JWT support, shared network. |
| Local `app` | CMM Service container, nginx route, booking event consumer, status event producer. |
| Local host IDE | CMM Service can run on host while `core` remains in Docker. |
| CI | Journey, movement, DCSA validation, dedupe, ordering, status, message-pact, and boundary tests. |
| Operation path | Later stages add production deployment, scaling, backup, DR, and incident response details. |

## Runtime Topology

```text
[Booking Events / UI / API Caller]
        |
        v
[CMM Service]
        |
        +--> [container_movement PostgreSQL]
        |          +--> journeys, expected movements
        |          +--> movement facts, status snapshots
        |          +--> dedupe, exceptions, audit, outbox
        |
        +--> [Kafka Consumer: booking.confirmed / revisions]
        +--> [Kafka Producer: containermovement.status]
```

Text fallback: CMM consumes booking context, creates/reconciles journeys, captures and validates movement facts, derives status snapshots, and publishes status events.

## Runtime Controls

| Concern | Design |
|---|---|
| Journey lifecycle | Booking-revision-aware journey creation and reconciliation. |
| Movement capture | DCSA-aligned validation before persistence. |
| Deduplication | Event and command keys preserve idempotent ingestion. |
| Ordering | Out-of-order facts are preserved and applied deterministically or surfaced as exceptions. |
| Status publication | Status outbox publishes recoverable `containermovement.status` evidence. |
| Boundary guard | Rejects D&D relevance decisions, Booking lifecycle mutation, pricing/D&D calculation, and cross-service SQL behavior. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports journey/status query, movement capture, expected movement derivation, status derivation, history, and throughput targets. |
| `security-design.md` | Enforces authentication, authorization, event security, audit, boundaries, and database isolation. |
| `scalability-design.md` | Supports journey, movement, snapshot, duplicate/out-of-order, and concurrent user scale. |
| `reliability-design.md` | Implements deduplication, ordering, idempotency, recoverable publication, and boundary checks. |
| `logical-components.md` | Maps deployment to JourneyCommandApi, JourneyQueryApi, ExpectedMovementDeriver, MovementCaptureApi, DcsaValidationAdapter, MovementDeduplicationGuard, MovementOrderingPolicy, StatusDerivationEngine, StatusOutboxPublisher, CmmAuthorizationGuard, and MovementAuditWriter. |
| `components.md` | Preserves CMM ownership for journeys, movements, status, and history. |
| `services.md` | Uses CMM Service, PostgreSQL, Kafka, Schema Registry, OpenAPI, Avro/AsyncAPI, message-pact, and Keycloak/JWT. |
| `business-logic-model.md` | Implements journey creation, expected movement derivation, movement capture, DCSA validation, status derivation, and status publication. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps CMM ownership focused on journeys, movement facts, status derivation, and movement history.
- Booking lifecycle, D&D relevance, and pricing calculation are explicitly excluded from CMM infrastructure.
- Materialized status snapshots plus durable movement facts support query performance without losing recoverability.
- Residual implementation risk is exact ordering policy, DCSA field validation, status projection schema, and message-pact coverage.
