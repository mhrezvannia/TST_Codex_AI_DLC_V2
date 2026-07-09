# Performance Design - shared-platform-reference-events

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reference Data performance supports Charge, Booking, CMM, Enterprise Web, and operations validation calls while preserving service ownership, audit behavior, and outbox reliability.

## API And Mutation Budgets

| Operation | Target | Design control |
|---|---|---|
| Reference lookup | p95 <= 150 ms. | Indexed lookup by set, key/code, status, version, and effective date. |
| Reference usage validation | p95 <= 150 ms. | Purpose-built validation endpoint and read model for active records. |
| Create/update/retire record | p95 <= 300 ms excluding downstream publish. | Single transaction for reference state, history, audit trigger context, and outbox enqueue. |
| History query | p95 <= 500 ms. | Paginated query with filters by set, record, action, actor, and time. |
| Outbox enqueue | p95 <= 100 ms within committed mutation. | Append compact outbox row in same database transaction. |

## Publisher Performance

| Area | Target | Design |
|---|---|---|
| Validation API | 1,000 validations/minute. | Stateless service instances and indexed validation read path. |
| Reference mutations | 100 mutations/minute. | Transactional writes avoid synchronous Kafka dependency. |
| Outbox publisher | 1,000 events/minute. | Claim/lease batch publisher with idempotent event keys and backpressure metrics. |

The outbox publisher scales independently from command/API handling. Command latency is not blocked by Kafka publish after the outbox entry is committed.

## Caching Strategy

Consumers may cache reference validation responses only with a version, set id, and freshness marker. Reference Data remains the source of truth. Cache use cannot replace authorization, audit, or outbox publication.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements lookup, validation, mutation, history, enqueue, throughput, and publisher budgets. |
| `security-requirements.md` | Keeps authorization and audit in the mutation and validation paths. |
| `scalability-requirements.md` | Supports enterprise reference sets, records, history rows, changed events, and consumer modules. |
| `reliability-requirements.md` | Uses transactional outbox and independent publisher retry rather than synchronous Kafka dependency. |
| `tech-stack-decisions.md` | Reuses Reference Data Service, Java/Spring, PostgreSQL, OpenAPI, Avro, Kafka, Schema Registry, and Keycloak/JWT. |
| `business-logic-model.md` | Implements reference lifecycle, validation, event publication, outbox, and health workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design turns the approved API, mutation, and outbox targets into concrete read/write and publisher controls.
- Command performance is protected by transactional outbox decoupling while preserving no-lost-change reliability.
- Cache guidance preserves Reference Data ownership and avoids consumer-side source-of-truth drift.
- Residual implementation risk is in index selection, batch sizing, and outbox lease tuning.
