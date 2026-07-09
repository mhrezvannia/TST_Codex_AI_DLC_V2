# Logical Components - container-movement-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define where CMM journey, movement, status, event, security, and reliability NFR patterns apply.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| JourneyCommandApi | Creates/reconciles journeys from Booking context. | Journey lifecycle. |
| JourneyQueryApi | Serves journey, status, and history queries. | Read performance. |
| ExpectedMovementDeriver | Derives expected movements from booking confirmation/revision context. | Expected plan generation. |
| MovementCaptureApi | Accepts planned/estimated/actual movement submissions. | Movement ingestion. |
| DcsaValidationAdapter | Validates DCSA-aligned movement fields. | Data quality. |
| MovementDeduplicationGuard | Detects duplicate captured and consumed events. | Idempotency. |
| MovementOrderingPolicy | Applies staleness and ordering rules. | Status consistency. |
| StatusDerivationEngine | Produces current status snapshots from movement facts. | Status projection. |
| StatusOutboxPublisher | Publishes `containermovement.status` with recoverable evidence. | Event publication. |
| CmmAuthorizationGuard | Enforces Keycloak/JWT, capabilities, and service identities. | Security boundary. |
| MovementAuditWriter | Persists capture, validation, derivation, publication, and correction evidence. | Audit durability. |

## Boundary Model

CMM owns journeys, expected movements, movement capture, DCSA-aligned validation, ordering/deduplication, status derivation, movement history, status snapshots, and status publication.

CMM does not decide D&D relevance, mutate Booking lifecycle, calculate pricing/D&D, or query Booking/Charge databases.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Invalid movement fields | Movement rejected. | DCSA validation errors and audit. |
| Duplicate event | Prior result reused. | Deduplication evidence. |
| Out-of-order event | Exception or deterministic update. | Ordering policy and preserved fact. |
| Booking revision mismatch | Journey reconciliation exception. | Revision-aware expected movement derivation. |
| Kafka/Schema Registry failure | Publication blocked. | Preserve status/outbox evidence and expose lag. |
| Boundary violation | Request rejected. | No Booking/Charge mutation or SQL access. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Fast journey/status query | JourneyQueryApi and StatusDerivationEngine snapshots. |
| DCSA validation | DcsaValidationAdapter. |
| Deduplication/idempotency | MovementDeduplicationGuard. |
| Ordering/staleness | MovementOrderingPolicy. |
| Recoverable publication | StatusOutboxPublisher. |
| Security and audit | CmmAuthorizationGuard and MovementAuditWriter. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support journey/status query, movement capture, expected movement derivation, status derivation, history, and throughput targets. |
| `security-requirements.md` | Components enforce authentication, authorization, event security, audit, boundaries, and database isolation. |
| `scalability-requirements.md` | Components support journey, movement, snapshot, duplicate/out-of-order, and concurrent user scale. |
| `reliability-requirements.md` | Components implement deduplication, ordering, idempotency, recoverable publication, and boundary checks. |
| `tech-stack-decisions.md` | Components map to CMM Service, Java/Spring, PostgreSQL, OpenAPI, Kafka/Avro/AsyncAPI/Schema Registry, message-pact, and Keycloak/JWT. |
| `business-logic-model.md` | Components implement journey creation, expected movement derivation, movement capture, DCSA validation, status derivation, and status publication. |
