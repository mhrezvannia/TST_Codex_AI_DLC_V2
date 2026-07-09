# Deployment Architecture - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys the Booking-to-Charge pricing seam. Booking prepares pricing requests and stores pricing snapshots; Charge calculates pricing and returns provider-owned pricing basis.

## Runtime Topology

```text
[Booking Service]
        |
        | HTTP OpenAPI + service JWT + idempotency + correlation
        v
[Charge Service]
        |
        v
[Pricing Result]
        |
        v
[Booking Pricing Snapshot]
```

Text fallback: Booking calls Charge over an authenticated HTTP contract, receives a typed pricing result or failure state, and stores an auditable snapshot in Booking-owned storage.

## Deployment Controls

| Concern | Design |
|---|---|
| Service route | Internal route through local service DNS/nginx as configured by local runtime. |
| Security context | Service JWT, user/capability context, correlation id, idempotency key, and request hash. |
| Timeout/retry/circuit | No retry for auth/validation 4xx; bounded retry for transient 5xx/unavailable; circuit opens to typed Booking exception state. |
| Snapshot | Booking persists Charge result, pricingRef, basis summary, request hash, and audit correlation. |
| Contracts | OpenAPI and Pact verify Booking consumer and Charge provider behavior. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports preparation, Charge call, snapshot, and fallback classification budgets. |
| `security-design.md` | Enforces service auth, user context, idempotency, correlation, denied paths, and boundaries. |
| `scalability-design.md` | Supports request, fallback, Pact, and snapshot scale. |
| `reliability-design.md` | Implements timeout, retry, circuit breaker, idempotency, snapshot, contracts, and failure handling. |
| `logical-components.md` | Maps to BookingPricingRequestBuilder, PricingSeamSecurityContext, ChargePricingClient, PricingCircuitBreaker, BookingPricingSnapshotWriter, PricingExceptionClassifier, PricingPactVerifier, and PricingEvidenceReporter. |
| `components.md` | Preserves Booking and Charge ownership boundaries. |
| `services.md` | Uses Booking-to-Charge pricing HTTP/OpenAPI/Pact seam. |
| `business-logic-model.md` | Implements request, call, success/failure/manual fallback, snapshot, and evidence workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps Charge calculation ownership separate from Booking orchestration and snapshot ownership.
- Failure states are typed and visible rather than generic or hidden behind retry loops.
- OpenAPI/Pact evidence is a blocking seam readiness requirement.
