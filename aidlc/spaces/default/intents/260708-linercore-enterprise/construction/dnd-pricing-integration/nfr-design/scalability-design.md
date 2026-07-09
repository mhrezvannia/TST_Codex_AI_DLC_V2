# Scalability Design - dnd-pricing-integration

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

This unit must support first-release D&D request/result volume and fallback evidence.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| D&D requests/results | At least 5,000 in local/CI evidence. |
| Manual fallback cases | At least 2,000 no-rule, conflict, and manual-required cases. |
| Pact interactions | At least 20 interactions across success, validation, auth, timeout, no-rule, conflict, and fallback behavior. |
| D&D snapshots | At least 5,000 Booking D&D charge snapshot records. |

## Data Partitioning

| Data area | Index/filter strategy |
|---|---|
| Trigger evidence | Booking id, movement status identity, boundary type, trigger key, timestamp. |
| D&D request/result | Idempotency key, request hash, pricingRef, status, correlation ID, timestamp. |
| Manual fallback | Reason, owner, status, customer, age, correlation ID. |
| Pact evidence | Interaction type, provider, consumer, status, validator version, source hash. |
| Snapshots | Booking id, revision, D&D result status, pricingRef, boundary, timestamp. |

## Growth Controls

| Trigger | Design response |
|---|---|
| D&D request volume grows | Validate idempotency and snapshot indexes. |
| Manual fallback queue grows | Paginate/filter by reason, owner, status, and age. |
| Pact cases grow | Group by success, validation, auth, timeout, no-rule, conflict, and fallback behavior. |
| Trigger p95 exceeds 300 ms | Add trigger read projection over Booking lifecycle and movement status evidence. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements D&D request/result, manual fallback, Pact, and snapshot baselines. |
| `performance-requirements.md` | Uses indexed trigger and snapshot paths to preserve seam budgets. |
| `security-requirements.md` | Scales service auth, context, idempotency, correlation, audit, and boundaries. |
| `reliability-requirements.md` | Keeps timeout, retry, circuit, duplicate, no-rule, conflict, and Pact evidence queryable. |
| `tech-stack-decisions.md` | Uses Booking trigger owner, Charge calculation owner, CMM facts, OpenAPI, Pact, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Implements D&D trigger, request/result, snapshot, and fallback evidence. |
