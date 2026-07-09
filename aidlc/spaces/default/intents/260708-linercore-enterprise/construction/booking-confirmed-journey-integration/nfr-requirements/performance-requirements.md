# Performance Requirements - booking-confirmed-journey-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Performance covers Booking confirmation outbox publish through CMM consumption, deduplication, revision reconciliation, and journey creation/update.

## Latency Targets

| Operation | Target |
|---|---|
| Confirmation commit to outbox entry | p95 <= 200 ms inside Booking transaction. |
| Outbox publish to Kafka | p95 <= 2 seconds after eligible outbox item. |
| Kafka delivery to CMM consumer | p95 <= 1 second in local profile. |
| CMM consume/deduplicate/reconcile/create journey | p95 <= 2 seconds. |
| End-to-end confirmation to journey ready | p95 <= 5 seconds under seeded local load. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines Booking confirmation, outbox publish, CMM consume, deduplicate, reconcile, and journey creation workflow. |
| `business-rules.md` | Defines ownership, validation, evidence, and boundary rules. |
| `requirements.md` | Supplies FR-BKG-006, FR-CMM-001/002, FR-E2E-002/005, NFR-REL, and NFR-OBS. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, Spring, PostgreSQL, and message fixture context. |
| `nfr-requirements-questions.md` | Q1 sets event latency target. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable from Booking confirmation commit through outbox, Kafka delivery, CMM consumption, deduplication, reconciliation, and journey readiness.
- Security requirements cover producer/consumer identity, Kafka ACL hooks, event metadata, and service/database boundaries.
- Reliability requirements require transactional outbox, Schema Registry compatibility, message-pact fixtures, deduplication, revision reconciliation, and retry visibility.
- Technology decisions preserve event choreography through Kafka/Avro/AsyncAPI/Schema Registry and avoid shared database coupling.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact outbox polling/claiming, retry, dead-letter, revision reconciliation, and schema subject naming policies.
- Build and Test must prove message-pact, compatibility, duplicate, stale-revision, and broker-failure scenarios.
