# Performance Requirements - movement-status-booking-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Performance covers CMM status publication through Booking consumption, deduplication/staleness checks, lifecycle update, and D&D trigger input evidence.

## Latency Targets

| Operation | Target |
|---|---|
| CMM status derivation to publish-ready | p95 <= 1 second. |
| Kafka publish/delivery to Booking consumer | p95 <= 2 seconds in local profile. |
| Booking consume/deduplicate/staleness check | p95 <= 1 second. |
| Booking lifecycle update | p95 <= 1 second. |
| End-to-end status to Booking lifecycle update | p95 <= 5 seconds under seeded local load. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines CMM publication, Booking consumption, deduplication, staleness, lifecycle update, and evidence workflow. |
| `business-rules.md` | Defines ownership, validation, evidence, and boundary rules. |
| `requirements.md` | Supplies FR-BKG-008/009, FR-CMM-006/007, FR-E2E-003/004, NFR-REL, and NFR-OBS. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, Spring, PostgreSQL, and message fixture context. |
| `nfr-requirements-questions.md` | Q1 sets status-event latency target. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable from CMM status derivation through Kafka delivery, Booking consumption, staleness check, and lifecycle update.
- Security requirements preserve producer/consumer identity, Kafka ACL hooks, event metadata, database isolation, and CMM/Booking boundary rules.
- Reliability requirements cover recoverable publication, Schema Registry compatibility, message-pact evidence, deduplication, stale/out-of-order handling, and idempotent lifecycle update.
- Technology decisions preserve event choreography and avoid shared database or UI-polling authority.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact ordering/staleness keys, lifecycle update idempotency, retry/quarantine behavior, and D&D trigger evidence contract.
- Build and Test must prove duplicate, stale, invalid payload, broker failure, and lifecycle conflict scenarios.
