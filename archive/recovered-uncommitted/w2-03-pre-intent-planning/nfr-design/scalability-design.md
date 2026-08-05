# Scalability Design - W2-03 Charge Tariffs and Agreements

## Upstream Coverage

This aggregate design consumes every unit's `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It maps the W2-03 rate model into the existing service boundary without importing D&D or multi-currency scope.

## Scaling Model

The Charge API remains stateless outside PostgreSQL and can run multiple instances behind the existing ingress. Idempotency claims, pricing snapshots, agreement versions, and rate versions live in the database so retries or instance changes cannot alter the result.

| Workload | Scaling approach | Guardrail |
| --- | --- | --- |
| Pricing requests | Horizontal service instances plus bounded database pool per instance | Sum of pools must stay below the database connection budget |
| Rate administration | Paginated reads and optimistic writes | No unbounded list endpoints |
| Quote matching | Composite indexes and bounded result cardinality | Ambiguous matches return an explicit error/manual outcome |
| Event publication | Transactional outbox with independently scalable relay | Pricing response does not wait for broker publication |

## Partitioning and Growth

Do not shard in W2-03. Keep tenant/legal-entity scope explicit in schemas and indexes so later multi-entity work can choose a partition key without rewriting monetary history. Rate and agreement history is append-oriented; archive only under a retention policy that preserves quote reconstruction.

## Capacity Triggers

Scale service replicas when sustained request concurrency breaches the measured per-instance saturation point while p99 approaches the 800 ms budget. Tune indexes and queries before adding replicas when database time dominates. Consider read replicas only for administrative history/reporting; pricing-authority reads stay on a consistency source that cannot lag behind approved changes.

## Load Validation

Exercise concurrent new requests, exact replays, conflicting idempotency reuse, rate activation boundaries, and simultaneous administrative approval. Record latency, pool wait, lock wait, rows scanned, CPU, memory, and database saturation. The test dataset must contain active, future, expired, and overlapping-candidate records.
