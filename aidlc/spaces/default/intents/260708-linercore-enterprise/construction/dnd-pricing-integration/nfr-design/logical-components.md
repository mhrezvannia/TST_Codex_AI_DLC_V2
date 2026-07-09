# Logical Components - dnd-pricing-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define the Booking-to-Charge D&D seam, including trigger detection, service security, HTTP resilience, snapshots, manual fallback, Pact verification, and evidence.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| DndBoundaryTriggerEvaluator | Determines D&D relevance from Booking lifecycle and movement-status evidence. | Trigger detection. |
| DndRequestBuilder | Builds Charge D&D request with idempotency/correlation metadata. | Request preparation. |
| DndSeamSecurityContext | Adds service JWT, user/action context, idempotency key, and request hash. | Seam security. |
| ChargeDndClient | Calls Charge D&D OpenAPI endpoint within timeout/retry/circuit policy. | HTTP seam. |
| DndCircuitBreaker | Tracks timeout/5xx/unavailable failure state. | Degraded seam control. |
| BookingDndSnapshotWriter | Stores D&D result snapshot or manual-required state. | Snapshot persistence. |
| DndFallbackClassifier | Maps no-rule, conflict, timeout, and manual-required outcomes to workflow state. | Failure visibility. |
| DndPactVerifier | Verifies Booking consumer and Charge provider interactions. | Contract readiness. |
| DndEvidenceReporter | Emits seam logs, traces, metrics, Pact status, trigger evidence, and snapshots. | Integration evidence. |

## Boundary Model

Booking owns D&D relevance trigger, request orchestration, snapshots, and manual fallback visibility. Charge owns D&D rules, free time, rates, chargeable days, and calculation. CMM supplies movement facts/status only.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Trigger duplicate | Prior request/result reused. | Trigger idempotency key. |
| Auth failure | D&D call denied. | Denied-path evidence and no retry loop. |
| Charge timeout | D&D exception/manual state. | Timeout and circuit breaker. |
| No rule/conflict | Manual-required state. | Typed Charge result and audit. |
| Pact failure | Seam readiness blocked. | Contract evidence gate. |
| Snapshot failure | Booking cannot claim D&D result. | Fail command/evidence state. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Trigger latency | DndBoundaryTriggerEvaluator. |
| Request/call budgets | DndRequestBuilder and ChargeDndClient. |
| Service authentication | DndSeamSecurityContext. |
| Timeout/retry/circuit breaker | ChargeDndClient and DndCircuitBreaker. |
| Snapshot and fallback | BookingDndSnapshotWriter and DndFallbackClassifier. |
| Pact readiness | DndPactVerifier. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support trigger, request, Charge call, snapshot, and end-to-end budgets. |
| `security-requirements.md` | Components enforce service auth, context, idempotency, correlation, audit, and boundaries. |
| `scalability-requirements.md` | Components support request/result, fallback, Pact, and snapshot scale. |
| `reliability-requirements.md` | Components implement timeout, retry, circuit breaker, idempotency, snapshot, contracts, and failure handling. |
| `tech-stack-decisions.md` | Components map to Booking trigger owner, Charge calculation owner, CMM facts/status, OpenAPI, Pact, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Components implement Booking D&D boundary trigger, pricing.dnd request/result seam, Charge calculation handoff, manual fallback, and audit evidence. |
