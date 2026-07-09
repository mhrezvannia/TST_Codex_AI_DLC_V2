# Logical Components - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define the Booking-confirmed to CMM journey integration, including outbox, Kafka, schema, message-pact, deduplication, and reconciliation boundaries.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| BookingConfirmationOutboxWriter | Writes confirmation event row with Booking confirmation transaction. | Event durability. |
| BookingEventPublisher | Claims outbox rows and publishes `booking.confirmed` to Kafka. | Publish path. |
| BookingConfirmedSchemaAdapter | Validates Avro/AsyncAPI/Schema Registry metadata and compatibility. | Schema governance. |
| BookingConfirmedMessagePactVerifier | Verifies producer/consumer event fixtures. | Contract readiness. |
| CmmBookingConfirmedConsumer | Consumes events in CMM service. | Consumer runtime. |
| CmmEventDeduplicationGuard | Detects duplicate/replayed events by event id and revision. | Replay safety. |
| JourneyReconciliationService | Creates or updates CMM journey for booking revision. | Journey consistency. |
| IntegrationEvidenceReporter | Emits logs, metrics, traces, publish/consume lag, and readiness evidence. | Observability and audit. |
| EventSecurityContextValidator | Validates producer/consumer identity and event metadata. | Security boundary. |

## Boundary Model

Booking owns confirmation facts, outbox rows, and event production. CMM owns event consumption, deduplication, journey creation, and journey reconciliation. The integration does not use shared database triggers or synchronous CMM journey APIs as the primary path.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Outbox write failure | Booking confirmation cannot claim publish-ready state. | Transaction rollback or explicit failure. |
| Kafka unavailable | Publish blocked. | Preserve outbox and expose lag. |
| Schema incompatible | Readiness blocked. | Schema Registry compatibility gate. |
| Duplicate event | No duplicate journey. | Dedup evidence and prior result. |
| Stale revision | Reconciliation exception or stale rule. | Preserve event evidence. |
| CMM processing failure | Event retryable. | Consumer health and retry evidence. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Outbox durability | BookingConfirmationOutboxWriter. |
| Publish latency | BookingEventPublisher. |
| Schema compatibility | BookingConfirmedSchemaAdapter. |
| Message-pact evidence | BookingConfirmedMessagePactVerifier. |
| Deduplication | CmmEventDeduplicationGuard. |
| Reconciliation | JourneyReconciliationService. |
| Security and observability | EventSecurityContextValidator and IntegrationEvidenceReporter. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support commit, publish, delivery, consume/reconcile, and end-to-end budgets. |
| `security-requirements.md` | Components enforce producer/consumer identity, event metadata, schema context, audit, and boundary rules. |
| `scalability-requirements.md` | Components support event, revision, duplicate/replay, journey, and message-pact scale. |
| `reliability-requirements.md` | Components implement outbox, compatibility, message-pact, deduplication, reconciliation, retry visibility, and failure handling. |
| `tech-stack-decisions.md` | Components map to Booking producer, CMM consumer, Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, and Docker Compose. |
| `business-logic-model.md` | Components implement Booking confirmation, outbox publish, CMM consume, deduplicate, reconcile, and journey creation workflow. |
