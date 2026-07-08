# Deployment Architecture - U10 Observability Deployment

## Compute Model

U10 defines on-prem Docker Compose runtime descriptors for core services and optional observability services. Core services include apps, backend services, PostgreSQL, Keycloak, Kafka, Schema Registry, and Nginx. Observability includes ELK-compatible logs, Prometheus/Grafana, Jaeger, and OpenTelemetry collector wiring.

## Network Topology

Nginx routes browser traffic to app/BFF services and only to ready targets. Internal service traffic uses Compose service names. Observability collectors receive logs, metrics, and traces from services/apps without exposing credentials to browser code.

## Storage Strategy

Telemetry storage is owned by ELK/Prometheus/Jaeger local/on-prem components. Final retention/storage sizing is deferred. Deployment records capture version, config references, health/smoke results, and promotion decision.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Core Compose plus optional observability profile. |
| Staging | Vault references, registry tags, readiness, smoke, observability evidence. |
| Production | Placeholder only; final promotion automation/DR deferred. |

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
