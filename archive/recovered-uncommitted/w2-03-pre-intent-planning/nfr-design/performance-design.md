# Performance Design - W2-03 Charge Tariffs and Agreements

## Upstream Coverage

This aggregate design consumes every unit's `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It also closes the scope gap against the W2-03 statement and the bilateral `pricing.request` / `pricing.result` contract.

## Critical Path Budget

The synchronous booking-time pricing path has a provisional p99 budget of 800 ms at the Charge edge. The budget includes authentication, idempotency claim lookup, rate-authority resolution, line calculation, durable result completion, and response serialization.

| Segment | Design constraint | Evidence |
| --- | --- | --- |
| Edge and authorization | Validate JWT and `pricing:invoke` without remote authorization calls on the hot path. | Request timer and auth failure metrics |
| Idempotency | Resolve by unique key and request hash through an indexed lookup. | Query plan plus replay test |
| Authority matching | Match effective date, trade lane, equipment type, currency, and approved agreement/version through indexed predicates. | Query plan with representative data |
| Calculation | Sum immutable base tariff, one surcharge, and one local-charge version in memory using decimal money types. | Deterministic benchmark and line-total test |
| Persistence | Complete the pricing claim and snapshot atomically; do not make contract completion depend on Kafka. | Integration test and committed-row inspection |

## Data Access and Calculation

- Store normalized match dimensions as queryable columns; do not filter JSON blobs or load all active agreements into memory.
- Index active rate versions by effective window plus trade-lane and equipment-type identifiers. Index agreement bindings by agreement version and rate-version identifiers.
- Use `BigDecimal` with explicit currency scale. The quote total must equal the sum of itemised lines after the documented rounding step.
- Fetch the complete immutable pricing authority in a bounded query plan. Avoid N+1 loading of rate lines or agreement bindings.
- Do not introduce a pricing cache in W2-03. Versioned data and correct invalidation matter more than speculative latency gains; add caching only after measurements show the database path misses the budget.

## UI and Administration

Tariff, surcharge, local-charge, agreement-version, and quote-preview views use server-side pagination and bounded filters. Reference selectors debounce requests and cache only reference labels, never monetary authority. Mutations invalidate affected list/detail queries and show the committed version returned by the service.

## Validation

Run a local Compose performance scenario with representative active and expired versions. Capture p50, p95, p99, error rate, database query count, and query plans. Acceptance requires correct lines under load; a fast hardcoded or stale result is a failure.
