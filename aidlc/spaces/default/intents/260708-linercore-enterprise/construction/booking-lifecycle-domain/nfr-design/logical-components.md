# Logical Components - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define where booking lifecycle, orchestration, security, scale, and reliability NFR patterns apply.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| BookingCommandApi | Handles draft, update, confirm, amend, reconfirm, and override commands. | API command validation. |
| BookingQueryApi | Provides query, search, list, revision, and exception views. | Read performance. |
| BookingStateMachine | Enforces lifecycle transitions and stale revision checks. | Lifecycle consistency. |
| BookingRepository | Persists booking, revision, pricing snapshot, exception, idempotency, outbox, and audit state. | Booking-owned data. |
| IdempotencyGuard | Stores command keys, request hashes, accepted results, and duplicate response policy. | Duplicate command control. |
| PricingOrchestrationState | Records pricing and D&D request status without calculating Charge-owned outcomes. | Charge seam state. |
| ExceptionQueueManager | Opens, assigns, resolves, and audits pricing/capacity/movement/D&D/contract exceptions. | Exception visibility. |
| BookingOutboxWriter | Appends confirmation and revision events atomically with lifecycle changes. | Event durability. |
| MovementStatusConsumer | Deduplicates and applies CMM movement-status events where lifecycle rules allow. | Event consumption. |
| BookingAuditWriter | Persists lifecycle, override, exception, amendment, and integration audit records. | Audit durability. |
| BookingAuthorizationGuard | Enforces Keycloak/JWT subject, capability, and service identity checks. | Security boundary. |

## Boundary Model

Booking owns booking drafts, validation state, pricing orchestration state, pricing snapshots, confirmation, amendments, reconfirmation, revisioning, lifecycle status, exception queues, D&D trigger evaluation, booking audit, idempotency, and booking outbox.

Booking does not calculate prices, D&D rates/free time, or movement status. It does not query Charge or CMM databases.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Command validation failure | Command rejected. | No state mutation; auditable validation error. |
| Authorization failure | Protected action denied. | Denied-path audit. |
| Charge seam failure | Pricing/D&D state pending or exception. | No indefinite user blocking. |
| CMM event conflict | Movement exception. | Preserve event evidence and booking revision. |
| Duplicate command | Prior accepted result returned. | Request hash validation. |
| Outbox failure | Event publish delayed. | Preserve outbox and expose lag health. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Fast commands/queries | BookingCommandApi, BookingQueryApi, BookingRepository. |
| Idempotency | IdempotencyGuard. |
| Stale revision rejection | BookingStateMachine. |
| Transactional outbox | BookingOutboxWriter. |
| Exception queues | ExceptionQueueManager. |
| Integration state | PricingOrchestrationState and MovementStatusConsumer. |
| Security and audit | BookingAuthorizationGuard and BookingAuditWriter. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support draft/query/search/confirm/exception/audit budgets and orchestration behavior. |
| `security-requirements.md` | Components enforce authentication, authorization, service seams, audit, ownership, and database isolation. |
| `scalability-requirements.md` | Components support booking, revision, exception, event, and concurrent user scale. |
| `reliability-requirements.md` | Components implement idempotency, outbox, deduplication, exception queues, stale revision checks, and audit. |
| `tech-stack-decisions.md` | Components map to Booking Service, Java/Spring, PostgreSQL, OpenAPI, Kafka/Avro/AsyncAPI/Schema Registry, Pact/message-pact, and Keycloak/JWT. |
| `business-logic-model.md` | Components implement create booking, validate references/capacity, request pricing, store pricing snapshot, confirm, amend, reconfirm, and handle exceptions. |
