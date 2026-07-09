# Logical Components - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define the Booking-to-Charge pricing seam, including contract, security, resilience, snapshot, and evidence boundaries.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| BookingPricingRequestBuilder | Builds Charge pricing request from Booking-owned state. | Request preparation. |
| PricingSeamSecurityContext | Adds service JWT, user/capability context, correlation ID, idempotency key, and request hash. | Seam security. |
| ChargePricingClient | Calls Charge OpenAPI endpoint within timeout/retry/circuit policy. | HTTP seam. |
| PricingCircuitBreaker | Tracks timeout/5xx/unavailable failure state. | Degraded seam control. |
| BookingPricingSnapshotWriter | Stores Charge result snapshot and evidence in Booking. | Snapshot persistence. |
| PricingExceptionClassifier | Maps timeout, 4xx, 5xx, no-price, and manual-required outcomes to Booking exception state. | Failure visibility. |
| PricingPactVerifier | Verifies Booking consumer and Charge provider interactions. | Contract readiness. |
| PricingEvidenceReporter | Emits seam logs, traces, metrics, Pact status, and snapshot evidence. | Integration evidence. |

## Boundary Model

Booking owns request preparation, orchestration state, idempotency from the consumer side, pricing snapshots, and exception/manual fallback visibility.

Charge owns pricing calculation, pricing basis, pricingRef, and provider-side idempotency/audit. The integration does not use shared databases or frontend-owned pricing calls.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Auth failure | Pricing call denied. | Denied-path evidence and no retry loop. |
| Charge timeout | Booking pricing exception/manual state. | Timeout and circuit breaker. |
| Charge validation 4xx | Booking validation exception. | No transient retry. |
| Charge 5xx/unavailable | Retry then circuit/manual state. | Bounded retry and open circuit. |
| Pact failure | Seam readiness blocked. | Contract evidence gate. |
| Snapshot persistence failure | Booking cannot claim pricing success. | Fail command/evidence state. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Seam latency budgets | BookingPricingRequestBuilder, ChargePricingClient, BookingPricingSnapshotWriter. |
| Service authentication | PricingSeamSecurityContext. |
| Timeout/retry/circuit breaker | ChargePricingClient and PricingCircuitBreaker. |
| Snapshot evidence | BookingPricingSnapshotWriter and PricingEvidenceReporter. |
| Failure classification | PricingExceptionClassifier. |
| Pact readiness | PricingPactVerifier. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support end-to-end, preparation, Charge call, snapshot, and fallback classification budgets. |
| `security-requirements.md` | Components enforce service auth, user context, idempotency, correlation, denied paths, and boundaries. |
| `scalability-requirements.md` | Components support request, fallback, Pact, and snapshot scale. |
| `reliability-requirements.md` | Components implement timeout, retry, circuit breaker, idempotency, snapshot, contracts, and failure handling. |
| `tech-stack-decisions.md` | Components map to Booking/Charge services, OpenAPI, Pact, PostgreSQL, Docker Compose, and Keycloak/JWT. |
| `business-logic-model.md` | Components implement Booking request, Charge call, success/failure/manual fallback, snapshot, and evidence workflow. |
