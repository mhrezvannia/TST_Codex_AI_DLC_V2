# Performance Design - U01 Platform Skeleton

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`performance-requirements.md` requires measurement hooks for p95 reference reads, p95 event freshness, local startup, build feedback, and health checks. `business-logic-model.md` limits U01 to workspace initialization, skeleton setup, local runtime composition, shared conventions, and walking-skeleton enablement.

## Design Summary

U01 designs performance seams rather than final optimization. The skeleton exposes consistent scripts, API placeholders, health endpoints, correlation propagation, and Compose profiles so U03, U04, U06, U08, U09, and U10 can measure and tune their concrete paths later.

## Measurement Architecture

| Component | Design |
|---|---|
| Root scripts | Stable commands for backend compile/test and frontend type/test checks. |
| Backend skeletons | Standard module layout with container/adapters prepared for request timing and health endpoints. |
| Frontend BFF apps | Route-handler structure prepared to measure BFF-to-service latency. |
| Kafka/SR placeholders | Runtime seams for event freshness measurement once U04 exists. |
| Correlation convention | One id connects BFF, service, audit/outbox, logs, and events. |
| Health endpoints | Lightweight liveness/readiness contract that avoids expensive business queries. |

## Performance Patterns

- Use pagination/filter hooks in later API units; U01 only reserves package and contract paths.
- Keep `domain-core` dependency-light to preserve fast unit tests and compile isolation.
- Keep optional observability behind a local Compose profile so core smoke checks remain usable on developer machines.
- Separate backend/frontend/contract scripts so U08 can run affected-path CI gates.

## Deferred Optimization

Caching, query indexes, connection pools, publisher batching, and frontend lazy-loading are intentionally deferred to units that own the actual runtime behavior.

