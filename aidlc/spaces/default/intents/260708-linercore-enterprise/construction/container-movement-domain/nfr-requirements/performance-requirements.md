# Performance Requirements - container-movement-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

CMM performance targets cover journey creation, expected movement derivation, movement capture, DCSA-aligned validation, status derivation, and movement history.

## Latency Targets

| Operation | Target |
|---|---|
| Journey query/status query | p95 <= 300 ms under seeded local load. |
| Movement capture and validation | p95 <= 500 ms. |
| Expected movement derivation | p95 <= 1 second per booking/journey. |
| Status derivation | p95 <= 1 second after accepted movement event. |
| Movement history query | p95 <= 500 ms for paginated history. |

## Throughput Targets

| Scenario | Target |
|---|---|
| Movement capture | 1,000 movement events/hour in local seeded validation. |
| Status publication | 1,000 status snapshots/hour in local seeded validation. |
| Event consumption | 1,000 booking confirmation/revision events/hour in local seeded validation. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines journey, movement capture, validation, status derivation, and publication workflows. |
| `business-rules.md` | Defines validation, evidence, ownership, and boundary rules. |
| `requirements.md` | Supplies FR-CMM, FR-E2E-002/003/005, NFR-REL, and NFR-OBS requirements. |
| `technology-stack.md` | Supplies Java/Spring, PostgreSQL, Kafka, Schema Registry, Avro, and OpenAPI context. |
| `nfr-requirements-questions.md` | Q1 sets CMM performance targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable across journey query, movement capture, validation, expected movement derivation, status derivation, and movement history.
- Security requirements preserve CMM ownership and forbid Booking/Charge database or business-rule leakage.
- Reliability requirements cover deduplication, ordering, staleness, idempotent event handling, recoverable publication, and DCSA validation failures.
- Scalability baseline covers journeys, movement events, status snapshots, and duplicate/out-of-order evidence.
- Technology decisions correctly establish a greenfield `container-movement-service` on the approved Spring/PostgreSQL/Kafka/Avro stack.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact ordering/staleness rules, deduplication keys, status snapshot materialization, and status publication recovery.
- Integration units must prove Booking -> CMM and CMM -> Booking message-pact and Schema Registry compatibility.
