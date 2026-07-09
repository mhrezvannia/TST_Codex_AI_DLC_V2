# Performance Design - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Booking performance covers draft lifecycle, validation, pricing orchestration state, confirmation, amendments, reconfirmation, exception queues, and audit.

## Command And Query Budgets

| Operation | Target | Design control |
|---|---|---|
| Create/update booking draft | p95 <= 300 ms excluding external adapters. | Validate local shape/reference snapshot, persist draft and audit in one transaction. |
| Booking query by ID | p95 <= 200 ms. | Indexed lookup by booking id and current revision. |
| Booking search/list | p95 <= 500 ms. | Paginated filters by status, customer, route, date, exception state, and owner. |
| Confirm/reconfirm booking | p95 <= 1 second excluding external pricing/validation calls. | Persist orchestration state and return current/pending/exception status instead of blocking indefinitely. |
| Exception queue operation | p95 <= 300 ms. | Indexed queue by owner, status, reason, severity, and age. |
| Audit write | p95 <= 250 ms. | Compact lifecycle audit record in the command transaction. |

## Orchestration Performance

Booking-owned commands record orchestration state for pricing, capacity, confirmation, amendment, movement-status update, and D&D trigger handling. External calls use budgets defined by integration units; this unit does not hide pending work. UI-facing calls return the current booking, pricing, lifecycle, and exception state.

## Data Access Controls

Search and query paths use Booking's PostgreSQL `booking` database only. Pricing snapshots are Booking-owned copies of Charge results; movement status updates are Booking-owned projections of CMM events. No Charge or CMM database reads are used for performance shortcuts.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements draft, query, search, confirmation, exception queue, audit, and orchestration budgets. |
| `security-requirements.md` | Keeps authorization, service-seam checks, audit, and database isolation in the request path. |
| `scalability-requirements.md` | Supports booking, revision, exception, lifecycle event, and concurrent user scale. |
| `reliability-requirements.md` | Uses idempotency, outbox, exception state, and stale revision checks to avoid long blocking calls. |
| `tech-stack-decisions.md` | Uses `booking-service`, Java/Spring, PostgreSQL, OpenAPI, Kafka/Avro/AsyncAPI/Schema Registry, Pact/message-pact, and Keycloak/JWT. |
| `business-logic-model.md` | Implements booking draft, validation, pricing state, confirmation, amendment, exception, D&D trigger, and audit workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design maps each booking latency target to a bounded command/query path.
- Long-running integration work is modeled as orchestration and exception state instead of hidden synchronous blocking.
- The performance design preserves Booking database ownership and avoids cross-service SQL shortcuts.
- Residual implementation risk is in index design, pagination, and integration budget enforcement.
