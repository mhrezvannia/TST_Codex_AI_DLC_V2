# Reliability Design - U10 Observability Deployment

## Reliability Goals

U10 makes runtime health, smoke status, publication health, deployment readiness, and support diagnostics explicit. Required dependencies affect readiness; telemetry degradation is visible; smoke failures identify the failing boundary and correlation id.

## Health and Readiness

Every deployable service and BFF app exposes liveness and readiness appropriate to its runtime. Readiness checks required dependencies such as databases, identity-service dependencies, Kafka, Schema Registry, and downstream service dependencies needed for the path. Nginx routes only to ready frontend/BFF services.

## Smoke Checks

Smoke checks exercise auth, reference API/BFF access, persistence, outbox/event publication evidence, correlation evidence, and selected CI/deployment readiness evidence. Successful smoke includes duration, environment, version, checks run, and correlation id.

## Publication Health

Outbox depth, oldest pending age, retry count, failed count, recovery-required count, freshness p95, and publication attempts are visible. Freshness p95 above 60 seconds and repeated publication failures produce operator-visible alert/dashboard signals with safe reason and affected event id.

## Failure Behavior

Status API unavailable produces non-blocking status-unavailable UI/smoke output with correlation id. Telemetry export unavailable keeps application behavior functional but marks observability degraded. Required runtime dependency unavailable fails readiness and prevents smoke from claiming success.

## Promotion Evidence

Staging requires successful health and smoke checks before production promotion is considered. U10 does not define final SLA/SLO, DR target, production promotion automation policy, or service-level recovery behavior.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
