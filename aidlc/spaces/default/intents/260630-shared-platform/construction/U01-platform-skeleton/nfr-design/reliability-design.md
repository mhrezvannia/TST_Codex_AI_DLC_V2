# Reliability Design - U01 Platform Skeleton

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`reliability-requirements.md` requires liveness/readiness contracts, dependency health, fail-fast startup, smoke hooks, standard error envelopes, and walking-skeleton promotion evidence. `business-logic-model.md` defines local runtime composition and failure handling.

## Reliability Architecture

| Component | Reliability design |
|---|---|
| Docker Compose core profile | Starts PostgreSQL, Keycloak, Kafka, Schema Registry, backend services, frontend apps, and Nginx with dependency health ordering. |
| Optional observability profile | Can be disabled locally without blocking core functional smoke checks. |
| Backend services | Reserve liveness/readiness endpoints and standard error envelope behavior. |
| Frontend BFF apps | Reserve app/BFF health routes and dependency-unavailable UI/error handling. |
| CI scripts | Deterministic entry points make compile/type/test failures reproducible. |
| Smoke hooks | Exercise auth, reference path, event path, frontend access, CI evidence, and observability basics as later units fill in behavior. |

## Resilience Patterns

- Required dependencies wait or fail fast with clear diagnostics.
- Health checks avoid expensive business queries.
- Readiness fails when required runtime dependencies are unavailable.
- Correlation ids allow smoke and runtime failures to be traced across components.
- Event-path smoke fails clearly when Kafka/SR is unavailable; it must not report false success.

## Degradation Strategy

Core local smoke can run without optional observability. Protected business paths must not silently degrade around required identity, database, or broker dependencies once those paths are implemented.

## Non-Goals

Final SLA/SLO, backup/restore, HA/DR, production deployment automation, and publisher retry details belong to later units/stages.

