# Performance Requirements - shared-platform-reference-events

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reference Data performance targets support validation calls from Charge, Booking, CMM, and UI while preserving service ownership and audit behavior.

## Latency Targets

| Operation | Target |
|---|---|
| Reference lookup | p95 <= 150 ms under seeded local load. |
| Reference usage validation | p95 <= 150 ms under seeded local load. |
| Create/update/retire reference record | p95 <= 300 ms excluding downstream event publish. |
| History query | p95 <= 500 ms for seeded reference history. |
| Outbox enqueue | p95 <= 100 ms as part of committed mutation. |

## Throughput Targets

| Area | Target |
|---|---|
| Validation API | 1,000 validations/minute in local seeded test profile. |
| Reference mutations | 100 mutations/minute in local seeded test profile. |
| Outbox publisher | 1,000 reference-data changed events/minute in local test profile. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines reference lifecycle, validation, event, outbox, and health workflows. |
| `business-rules.md` | Defines validation, boundary, and evidence rules. |
| `requirements.md` | Supplies FR-SP-004, FR-SP-005, NFR-REL-002, NFR-OBS-001, and NFR-COMP-001. |
| `technology-stack.md` | Supplies Java/Spring, PostgreSQL, Kafka, Schema Registry, Avro, and OpenAPI context. |
| `nfr-requirements-questions.md` | Q1 sets reference API performance targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable across reference lookup, validation, mutation, outbox enqueue, and event publishing.
- Reliability requirements correctly require transactional outbox, at-least-once publish, deduplication keys, retry visibility, and no lost committed changes.
- Security requirements preserve service/API/event boundaries and prohibit cross-service database access.
- Scalability baseline covers enterprise reference sets, records, history, events, and consumer modules.
- Tech-stack decisions harden the existing `reference-data-service` with PostgreSQL, Kafka, Avro, Schema Registry, and OpenAPI.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define outbox claim/lease semantics, schema subject naming, publisher retry policy, and reference-validation cache strategy.
- Build and Test must prove compatibility, outbox recovery, and no-cross-database-access checks.
