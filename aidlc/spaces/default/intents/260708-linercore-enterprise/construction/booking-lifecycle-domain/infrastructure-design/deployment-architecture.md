# Deployment Architecture - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`booking-lifecycle-domain` deploys the Booking Service responsible for booking drafts, validation state, pricing orchestration state, confirmation, amendments, reconfirmation, lifecycle status, exception queues, D&D trigger evaluation, idempotency, outbox, and audit.

## Deployment Model

| Environment | Deployment shape |
|---|---|
| Local `core` | PostgreSQL, Kafka, Schema Registry, Keycloak/JWT support, shared network. |
| Local `app` | Booking Service container, nginx route, Charge client configuration, Kafka producer/consumer configuration. |
| Local host IDE | Booking Service can run on host while `core` remains in Docker; routes and service endpoints are explicit. |
| CI | Booking API, state-machine, idempotency, outbox, Pact/message-pact, and denied-path tests. |
| Operation path | Later stages add production deployment, scaling, backup, DR, and incident response details. |

## Runtime Topology

```text
[Enterprise Web / API Caller]
        |
        v
[Booking Service] ---> [Charge Service APIs]
        |
        +--> [booking PostgreSQL]
        |          +--> bookings, revisions, pricing snapshots
        |          +--> exceptions, idempotency, audit, outbox
        |
        +--> [Kafka Producer: booking.confirmed / revisions]
        +--> [Kafka Consumer: containermovement.status]
```

Text fallback: Booking Service receives commands and queries, persists booking-owned state in its database, calls Charge APIs for pricing and D&D outcomes, publishes booking lifecycle events, and consumes CMM status events.

## Compute And Runtime Controls

| Concern | Design |
|---|---|
| Command API | Stateless service layer with transaction boundaries around booking state, idempotency, audit, and outbox. |
| Query API | Indexed read paths with pagination for search, revisions, and exception queues. |
| Charge seam | HTTP client with timeout, retry/circuit policy, idempotency keys, and typed pending/exception states. |
| CMM seam | Kafka consumer with dedupe, ordering/revision checks, and movement exception recording. |
| Outbox | Booking lifecycle events committed atomically with booking state changes. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports draft/query/search/confirm/exception/audit budgets and orchestration behavior. |
| `security-design.md` | Enforces auth, capabilities, service seams, audit, ownership, and database isolation. |
| `scalability-design.md` | Supports booking, revision, exception, event, and concurrent user scale. |
| `reliability-design.md` | Implements idempotency, outbox, dedupe, exception queues, stale revision checks, and audit. |
| `logical-components.md` | Maps deployment to BookingCommandApi, BookingQueryApi, BookingStateMachine, BookingRepository, IdempotencyGuard, PricingOrchestrationState, ExceptionQueueManager, BookingOutboxWriter, MovementStatusConsumer, BookingAuditWriter, and BookingAuthorizationGuard. |
| `components.md` | Preserves Booking Service ownership and prevents Charge/CMM ownership leakage. |
| `services.md` | Uses booking-service, pricing API, D&D API, booking.confirmed, containermovement.status, PostgreSQL, Kafka, Schema Registry, and Keycloak/JWT. |
| `business-logic-model.md` | Implements create, validate, request pricing, store pricing snapshot, confirm, amend, reconfirm, and exception workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps Booking ownership explicit and does not move pricing, D&D calculation, or movement status derivation into Booking.
- Synchronous Charge calls and asynchronous CMM status consumption are separated with typed orchestration state and exception queues.
- Database-backed idempotency and transactional outbox provide the right infrastructure foundation for booking lifecycle reliability.
- Residual implementation risk is exact retry/circuit settings, state-machine tables, event schema subjects, and exception taxonomy.
