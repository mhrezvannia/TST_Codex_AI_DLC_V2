# Deployment Architecture - dnd-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This unit deploys the Booking-to-Charge D&D pricing seam. Booking detects D&D relevance and stores D&D result/manual snapshots; Charge calculates D&D from Charge-owned rules.

## Runtime Topology

```text
[Booking D&D Boundary Trigger]
        |
        | HTTP OpenAPI + service JWT + idempotency + correlation
        v
[Charge D&D API]
        |
        v
[D&D Result / Manual Required]
        |
        v
[Booking D&D Snapshot]
```

Text fallback: Booking detects a D&D-relevant boundary from lifecycle and movement-status evidence, sends a D&D request to Charge, and stores a returned result or manual-required state.

## Deployment Controls

| Concern | Design |
|---|---|
| Trigger idempotency | Duplicate boundaries reuse prior request/result evidence. |
| Security context | Service JWT, user/action context, idempotency key, request hash, and correlation id. |
| Timeout/retry/circuit | No retry for auth/validation 4xx; bounded retry for transient 5xx/unavailable; circuit opens to manual/exception state. |
| Snapshot | Booking persists Charge D&D result, manual-required state, request hash, and audit correlation. |
| Contracts | OpenAPI and Pact verify Booking consumer and Charge provider behavior. |
| Boundary | Booking does not calculate D&D; CMM does not decide D&D relevance. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports trigger, request, Charge call, snapshot, and end-to-end budgets. |
| `security-design.md` | Enforces service auth, context, idempotency, correlation, audit, and boundaries. |
| `scalability-design.md` | Supports request/result, fallback, Pact, and snapshot scale. |
| `reliability-design.md` | Implements timeout, retry, circuit breaker, idempotency, snapshot, contracts, and failure handling. |
| `logical-components.md` | Maps to DndBoundaryTriggerEvaluator, DndRequestBuilder, DndSeamSecurityContext, ChargeDndClient, DndCircuitBreaker, BookingDndSnapshotWriter, DndFallbackClassifier, DndPactVerifier, and DndEvidenceReporter. |
| `components.md` | Preserves Booking, Charge, and CMM ownership boundaries. |
| `services.md` | Uses Booking-to-Charge D&D HTTP/OpenAPI/Pact seam. |
| `business-logic-model.md` | Implements trigger, D&D request/result seam, Charge handoff, manual fallback, and audit evidence. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps Booking as D&D trigger/orchestration owner and Charge as D&D calculation owner.
- CMM remains a movement-status evidence source and does not decide D&D relevance.
- Manual-required states are typed and auditable rather than generic calculation failures.
