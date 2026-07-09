# Scalability Design - booking-charge-pricing-integration

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

This unit must support first-release pricing request volume and failure evidence without redesign.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Pricing requests | At least 10,000 requests in local/CI evidence. |
| Failure/manual fallback cases | At least 2,000 timeout, error, no-price, and manual-required cases. |
| Pact interactions | At least 20 interactions across happy path, validation, auth, timeout, and fallback behavior. |
| Booking pricing snapshots | At least 10,000 records. |

## Data Partitioning

| Data area | Index/filter strategy |
|---|---|
| Pricing request evidence | Booking id, request hash, idempotency key, Charge status, correlation ID, timestamp. |
| Snapshot records | Booking id, booking revision, pricingRef, status, customer, timestamp. |
| Failure/manual cases | Reason, status, retryable flag, circuit state, owner, age, correlation ID. |
| Pact evidence | Provider, consumer, interaction type, status, validator version, source hash. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Requests exceed 10,000 evidence rows | Verify idempotency and snapshot indexes. |
| Failure queue grows | Filter by reason/status/owner and expose aging metrics. |
| Pact interactions exceed 20 | Split interactions by happy path, auth, validation, timeout, and fallback groups. |
| Snapshot queries slow | Use compact read projection for Booking pricing state. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements request, fallback, Pact, and snapshot scale baselines. |
| `performance-requirements.md` | Uses indexed snapshot/evidence writes to preserve seam budgets. |
| `security-requirements.md` | Scales service auth, user context, idempotency, correlation, and denied-path evidence. |
| `reliability-requirements.md` | Keeps timeout, retry, circuit breaker, duplicate request, and Pact failure evidence queryable. |
| `tech-stack-decisions.md` | Uses Booking/Charge services, OpenAPI, Pact, PostgreSQL, Docker Compose, and Keycloak/JWT. |
| `business-logic-model.md` | Implements pricing seam and snapshot evidence workflow. |
