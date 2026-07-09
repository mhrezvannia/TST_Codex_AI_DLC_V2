# Logical Components - movement-status-booking-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define the CMM-to-Booking status integration, including publication, Kafka, schema, message-pact, Booking deduplication, lifecycle update, and D&D trigger evidence boundaries.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| CmmStatusOutboxWriter | Records publish-ready status evidence from CMM status derivation. | Status publication durability. |
| CmmStatusPublisher | Publishes `containermovement.status` to Kafka. | Publish path. |
| MovementStatusSchemaAdapter | Validates Avro/AsyncAPI/Schema Registry metadata and compatibility. | Schema governance. |
| MovementStatusMessagePactVerifier | Verifies producer/consumer status-event fixtures. | Contract readiness. |
| BookingMovementStatusConsumer | Consumes status events in Booking. | Consumer runtime. |
| BookingStatusDeduplicationGuard | Detects duplicate status events. | Replay safety. |
| BookingStatusOrderingPolicy | Applies stale/out-of-order rules and quarantine behavior. | Ordering correctness. |
| BookingLifecycleUpdateService | Applies idempotent lifecycle updates and records D&D trigger input evidence. | Booking state update. |
| StatusIntegrationEvidenceReporter | Emits logs, metrics, traces, lag, duplicate, stale, and lifecycle evidence. | Observability and audit. |
| StatusEventSecurityValidator | Validates producer/consumer identity and event metadata. | Security boundary. |

## Boundary Model

CMM owns movement status derivation and publication. Booking owns lifecycle update and D&D trigger input evidence. Booking does not derive movement status, and CMM does not decide D&D relevance or mutate Booking lifecycle.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| CMM publish failure | Status event delayed. | Preserve publish evidence and expose lag. |
| Schema incompatible | Readiness blocked. | Compatibility gate. |
| Duplicate event | No duplicate lifecycle update. | Deduplication evidence. |
| Stale event | Quarantine or deterministic stale result. | Ordering policy. |
| Booking update conflict | Lifecycle exception. | Preserve event and correlation evidence. |
| Auth/context failure | Event rejected. | Message-pact and denied-path evidence. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Publish latency | CmmStatusOutboxWriter and CmmStatusPublisher. |
| Compatibility | MovementStatusSchemaAdapter. |
| Message-pact | MovementStatusMessagePactVerifier. |
| Deduplication | BookingStatusDeduplicationGuard. |
| Staleness | BookingStatusOrderingPolicy. |
| Lifecycle update | BookingLifecycleUpdateService. |
| Security/observability | StatusEventSecurityValidator and StatusIntegrationEvidenceReporter. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support status derivation, publish/delivery, consume/check, lifecycle update, and end-to-end budgets. |
| `security-requirements.md` | Components enforce producer/consumer identity, metadata, boundaries, database isolation, and audit. |
| `scalability-requirements.md` | Components support status event, duplicate, stale, update, and message-pact scale. |
| `reliability-requirements.md` | Components implement recoverable publication, compatibility, message-pact, deduplication, staleness, lifecycle update, and failure handling. |
| `tech-stack-decisions.md` | Components map to CMM producer, Booking consumer, Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, and Docker Compose. |
| `business-logic-model.md` | Components implement CMM publish, Booking consume, dedupe/staleness checks, lifecycle update, and D&D trigger input evidence. |
